import { toast } from "@/lib/toast";
import { ResponseMiddleware } from "./types/response.middleware";
import { authService } from "@/services/auth.service";
import Cookies from "js-cookie";
import ENVIRONNEMENTS from "@/constants/environnement";
import { api } from "@/lib/request";

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

/**
 * Traite la file d'attente des requêtes qui ont échoué pendant le rafraîchissement du token.
 * Pour chaque requête en attente, elle la rejette avec l'erreur ou la résout avec le nouveau token.
 *
 * @param {any} error - L'erreur survenue lors du rafraîchissement du token, ou null si réussie.
 * @param {string | null} [token=null] - Le nouveau token d'accès si le rafraîchissement a réussi.
 */
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

/**
 * Middleware de réponse pour la gestion centralisée des erreurs.
 * Il intercepte les réponses pour identifier les erreurs réseau ou les erreurs
 * structurées renvoyées par l'API, affiche une notification (toast) à l'utilisateur
 * côté client, et rejette une promesse pour signaler l'échec de la requête.
 *
 * @param response L'objet de réponse Axios, ou une valeur falsy en cas d'erreur réseau.
 * @param next La fonction pour passer au middleware suivant dans la chaîne.
 * @returns Le résultat du middleware suivant en cas de succès, ou une promesse rejetée en cas d'erreur.
 */
export const errorHandlingMiddleware: ResponseMiddleware = async (
  response,
  next,
) => {
  if (!response) {
    // Cas d'une erreur réseau où le serveur n'a pas répondu
    return Promise.reject(new Error("Erreur réseau ou serveur indisponible."));
  }

  // Si l'appel est marqué "silencieux", ne pas afficher de toast d'erreur
  const isSilent = response.config?.headers?.['x-silent'] === 'true';

  const originalRequest = response.config;

  if (response.status === 401) {
    // Requête silencieuse → rejet discret, sans refresh ni redirection
    if (isSilent) {
      return Promise.reject(new Error("unauthorized"));
    }

    const url = String(originalRequest.url ?? "");
    const isRefreshEndpoint = url.includes("/auth/refresh-token");
    const isLoginOrRegister =
      url.includes("/auth/login") || url.includes("/auth/register");

    // Échec du refresh : déconnexion (évite une boucle infinie)
    if (isRefreshEndpoint) {
      Cookies.remove("token_" + ENVIRONNEMENTS.UNIVERSE);
      Cookies.remove("refreshToken_" + ENVIRONNEMENTS.UNIVERSE);
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      return Promise.reject(new Error("Session expirée."));
    }

    const backendMessage = response.data?.message;
    const msg = Array.isArray(backendMessage)
      ? backendMessage[0]
      : backendMessage;

    // Erreurs de connexion explicites : pas de refresh (mauvais mot de passe, etc.)
    const loginCredentialErrors = new Set([
      "Identifiants invalides",
      "Compte désactivé",
    ]);
    if (isLoginOrRegister && msg && loginCredentialErrors.has(String(msg))) {
      const err = new Error(String(msg));
      (err as any).response = response;
      return Promise.reject(err);
    }

    // Nest renvoie souvent message: "Unauthorized" pour JWT expiré / invalide — il faut tenter le refresh.
    // Ne pas confondre avec les messages de login ci-dessus.

    const reqAny = originalRequest as { _retryAfterRefresh?: boolean };
    if (reqAny._retryAfterRefresh) {
      Cookies.remove("token_" + ENVIRONNEMENTS.UNIVERSE);
      Cookies.remove("refreshToken_" + ENVIRONNEMENTS.UNIVERSE);
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      return Promise.reject(new Error("Session expirée."));
    }

    const retryOriginalRequest = async () => {
      reqAny._retryAfterRefresh = true;
      // Réponse Axios complète : le wrapper `request.*` fait ensuite `response.data`.
      return api.request({ ...originalRequest });
    };

    if (isRefreshing) {
      return new Promise(function (resolve, reject) {
        failedQueue.push({ resolve, reject });
      })
        .then(() => retryOriginalRequest())
        .catch((err) => Promise.reject(err));
    }

    isRefreshing = true;
    const refresh_token = Cookies.get("refreshToken_" + ENVIRONNEMENTS.UNIVERSE);

    if (!refresh_token) {
      isRefreshing = false;
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      return Promise.reject(new Error("Session expirée."));
    }

    try {
      const refreshResponse = await authService.refreshToken(refresh_token);
      const accessToken =
        refreshResponse &&
        typeof refreshResponse === "object" &&
        "access_token" in refreshResponse &&
        typeof (refreshResponse as { access_token?: string }).access_token ===
          "string"
          ? (refreshResponse as { access_token: string }).access_token
          : "success" in refreshResponse &&
              (refreshResponse as { success?: boolean }).success &&
              "token" in refreshResponse
            ? (refreshResponse as { token: string }).token
            : null;

      if (accessToken) {
        processQueue(null, accessToken);
        return await retryOriginalRequest();
      }

      const message =
        refreshResponse &&
        typeof refreshResponse === "object" &&
        "message" in refreshResponse
          ? String((refreshResponse as { message?: string }).message ?? "")
          : "Échec du rafraîchissement du token";
      throw new Error(message || "Échec du rafraîchissement du token");
    } catch (error: any) {
      processQueue(error, null);
      Cookies.remove("token_" + ENVIRONNEMENTS.UNIVERSE);
      Cookies.remove("refreshToken_" + ENVIRONNEMENTS.UNIVERSE);
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      return Promise.reject(error);
    } finally {
      isRefreshing = false;
    }
  }

  // Si le statut est une erreur (ex: 4xx, 5xx)
  if (response.status >= 400) {
    if (response.data) {
      const message =
        response.data.message ||
        `Erreur ${response.status}: ${response.statusText}`;
      const customError = new Error(message);
      (customError as any).response = response;
      return Promise.reject(customError);
    }

    const genericMessage = `Erreur ${response.status}: ${response.statusText}`;
    if (!isSilent && typeof window !== "undefined") {
      toast({
        variant: "error",
        title: `Erreur ${response.status}`,
        message: response.statusText,
      });
    }
    return Promise.reject(new Error(genericMessage));
  }

  // Pour les réponses de succès (2xx)
  return next(response);
};
