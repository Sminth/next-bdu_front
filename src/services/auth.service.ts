import { request } from "@/lib/request";
import { AuthEndpoints } from "@/constants/endpoint";
import Cookies from "js-cookie";
import ENVIRONNEMENTS from "@/constants/environnement";
import { Singleton } from "@/lib/singleton";
import {
  LoginPayload,
  LoginResponse,
  GetMeResponse,
  RefreshTokenResponse,
  SendPasswordResetLinkResponse,
  ResetPasswordResponse,
} from "@/types/auth.types";

/**
 * Service d'authentification pour l'administration ALADIN.
 * Implémenté en singleton pour garantir une instance unique dans toute l'application.
 *
 * Gère :
 * - La connexion et déconnexion des administrateurs
 * - La récupération des informations utilisateur
 * - Le rafraîchissement automatique des tokens
 * - La gestion des cookies d'authentification
 */
export class AuthService extends Singleton<AuthService> {
  public async login(credentials: LoginPayload): Promise<LoginResponse> {
    try {
      const response = await request.post<LoginResponse>(
        AuthEndpoints.LOGIN,
        credentials,
      );

      // Save tokens to cookies immediately if they are present in the response
      if ("access_token" in response && response.access_token) {
        Cookies.set("token_" + ENVIRONNEMENTS.UNIVERSE, response.access_token, { expires: 1 }); // 1 day
      }
      if ("refresh_token" in response && response.refresh_token) {
        Cookies.set("refreshToken_" + ENVIRONNEMENTS.UNIVERSE, response.refresh_token, { expires: 7 }); // 7 days
      }

      return response;
    } catch (error: any) {
      throw new Error(error.message || "Erreur lors de la connexion");
    }
  }

  /**
   * Déconnecte l'administrateur actuel.
   * Supprime les tokens des cookies et invalide la session côté serveur.
   *
   * @returns Une promesse qui se résout quand la déconnexion est terminée
   *
   * @example
   * ```typescript
   * const authService = AuthService.getInstance();
   * await authService.logout();
   * // Rediriger vers la page de connexion
   * ```
   */
  public async logout(): Promise<void> {
    try {
      await request.post(AuthEndpoints.AUTH_LOGOUT);
    } catch (error) {
      // Même en cas d'erreur côté serveur, on supprime les tokens locaux
      console.error("Erreur lors de la déconnexion:", error);
    } finally {
      // Supprimer les tokens des cookies
      this.clearTokens();
    }
  }

  /**
   * Récupère les informations de l'administrateur connecté.
   * Utilise le token stocké dans les cookies pour l'authentification.
   *
   * @returns Une promesse contenant les données de l'utilisateur
   * @throws Error si l'utilisateur n'est pas authentifié
   *
   * @example
   * ```typescript
   * const authService = AuthService.getInstance();
   * const userData = await authService.me();
   * console.log(userData.user.email);
   * ```
   */
  public async me(): Promise<GetMeResponse> {
    // L'option `x-silent: true` désactive le toast "Erreur réseau" dans errorHandlingMiddleware
    const response = await request.get<GetMeResponse>(AuthEndpoints.AUTH_ME, {
      headers: { 'x-silent': 'true' },
    });
    return response;
  }

  /**
   * Rafraîchit le token d'accès en utilisant le refresh token.
   * Cette méthode est appelée automatiquement par le middleware en cas de 401.
   *
   * @param refreshToken - Le refresh token à utiliser
   * @returns Une promesse contenant les nouveaux tokens
   * @throws Error si le rafraîchissement échoue
   *
   * @internal Cette méthode est principalement utilisée par le middleware
   */
  public async refreshToken(
    refreshToken: string,
  ): Promise<RefreshTokenResponse> {
    try {
      const response = await request.post<RefreshTokenResponse>(
        AuthEndpoints.REFRESH_TOKEN,
        { refresh_token: refreshToken },
      );
      return response;
    } catch (error: any) {
      throw new Error(
        error.message || "Erreur lors du rafraîchissement du token",
      );
    }
  }

  /**
   * Demande l'envoi d'un lien de réinitialisation de mot de passe par email.
   *
   * @param email - L'email de l'administrateur
   * @returns Une promesse contenant la réponse du serveur
   *
   * @example
   * ```typescript
   * const authService = AuthService.getInstance();
   * await authService.sendResetLink("admin@aladin-edu.net");
   * ```
   */
  public async sendResetLink(
    email: string,
  ): Promise<SendPasswordResetLinkResponse> {
    try {
      const response = await request.post<SendPasswordResetLinkResponse>(
        AuthEndpoints.RESET_LINK,
        { email },
      );
      return response;
    } catch (error: any) {
      throw new Error(
        error.message || "Erreur lors de l'envoi du lien de réinitialisation",
      );
    }
  }

  /**
   * Réinitialise le mot de passe avec le token reçu par email.
   *
   * @param token - Le token de réinitialisation reçu par email
   * @param email - L'email de l'administrateur
   * @param password - Le nouveau mot de passe
   * @param passwordConfirmation - La confirmation du nouveau mot de passe
   * @returns Une promesse contenant la réponse du serveur
   *
   * @example
   * ```typescript
   * const authService = AuthService.getInstance();
   * await authService.resetPassword(
   *   "reset-token-123",
   *   "admin@aladin-edu.net",
   *   "newpassword",
   *   "newpassword"
   * );
   * ```
   */
  public async changePassword(
    currentPassword: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    try {
      const response = await request.post<{ message: string }>(
        AuthEndpoints.CHANGE_PASSWORD,
        { currentPassword, newPassword },
      );
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Erreur lors du changement de mot de passe');
    }
  }

  public async forceChangePassword(newPassword: string): Promise<{ message: string }> {
    try {
      const response = await request.post<{ message: string }>(
        AuthEndpoints.CHANGE_PASSWORD.replace('change-password', 'force-change-password'),
        { newPassword },
      );
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Erreur lors du changement de mot de passe');
    }
  }

  public async resetPassword(
    token: string,
    email: string,
    password: string,
    passwordConfirmation: string,
  ): Promise<ResetPasswordResponse> {
    try {
      const response = await request.post<ResetPasswordResponse>(
        AuthEndpoints.PASSWORD_RESET,
        {
          token,
          email,
          password,
          password_confirmation: passwordConfirmation,
        },
      );
      return response;
    } catch (error: any) {
      throw new Error(
        error.message || "Erreur lors de la réinitialisation du mot de passe",
      );
    }
  }

  /**
   * Vérifie si un administrateur est actuellement connecté.
   * Vérifie la présence du token dans les cookies.
   *
   * @returns true si un token existe, false sinon
   *
   * @example
   * ```typescript
   * const authService = AuthService.getInstance();
   * if (authService.isAuthenticated()) {
   *   // L'utilisateur est connecté
   * }
   * ```
   */
  public isAuthenticated(): boolean {
    const token = Cookies.get("token_" + ENVIRONNEMENTS.UNIVERSE);
    return !!token;
  }

  /**
   * Récupère le token d'accès depuis les cookies.
   *
   * @returns Le token d'accès ou undefined s'il n'existe pas
   */
  public getToken(): string | undefined {
    return Cookies.get("token_" + ENVIRONNEMENTS.UNIVERSE);
  }

  /**
   * Récupère le refresh token depuis les cookies.
   *
   * @returns Le refresh token ou undefined s'il n'existe pas
   */
  public getRefreshToken(): string | undefined {
    return Cookies.get("refreshToken_" + ENVIRONNEMENTS.UNIVERSE);
  }

  /**
   * Supprime tous les tokens d'authentification des cookies.
   * Utilisé lors de la déconnexion ou en cas d'erreur d'authentification.
   *
   * @private
   */
  private clearTokens(): void {
    Cookies.remove("token_" + ENVIRONNEMENTS.UNIVERSE);
    Cookies.remove("refreshToken_" + ENVIRONNEMENTS.UNIVERSE);
  }
}

/**
 * Instance singleton exportée pour un accès direct.
 * Permet d'utiliser le service sans appeler getInstance() à chaque fois.
 */
export const authService = AuthService.getInstance();
