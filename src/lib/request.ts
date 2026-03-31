import axios from "axios";
import { createRequestMiddlewareChain } from "@/middlewares/services/request-middleware-chain.service";
import { requestHeaderMiddleware } from "@/middlewares/requests/request-header.middleware";
import { createResponseMiddlewareChain } from "@/middlewares/services/response-middleware-chain.service";
import { errorHandlingMiddleware } from "@/middlewares/error-handling.middleware";
import { tokenMiddleware } from "@/middlewares/token-manager.middleware";
import ENVIRONNEMENTS from "@/constants/environnement";

/**
 * Instance Axios pré-configurée pour tous les appels API de l'application.
 * Définit l'URL de base, un timeout et les en-têtes par défaut.
 */
export const api = axios.create({
  baseURL: ENVIRONNEMENTS.API_URL || "",
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
  validateStatus: () => true, // Toujours résoudre la promesse pour gérer les erreurs dans les middlewares
});

/**
 * Chaîne de middlewares exécutée sur chaque requête sortante.
 * Utilise `requestHeaderMiddleware` pour ajouter le token d'authentification.
 */
const requestMiddlewareChain = createRequestMiddlewareChain([
  requestHeaderMiddleware,
]);

/**
 * Chaîne de middlewares exécutée sur chaque réponse entrante.
 * Utilise `tokenMiddleware` pour la gestion du token et `errorHandlingMiddleware` pour la gestion des erreurs.
 */
const responseMiddlewareChain = createResponseMiddlewareChain([
  tokenMiddleware,
  errorHandlingMiddleware,
]);

// Applique les chaînes de middlewares comme intercepteurs Axios.
api.interceptors.request.use(requestMiddlewareChain, (error) =>
  Promise.reject(error),
);
api.interceptors.response.use(responseMiddlewareChain, (error) =>
  Promise.reject(error),
);

/**
 * En environnement de développement, cet intercepteur loggue les informations
 * de base de chaque requête et réponse pour faciliter le débogage.
 */
if (process.env.NODE_ENV === "development") {
  api.interceptors.request.use((config) => {
    console.log(` ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  });

  api.interceptors.response.use(
    (response) => {
      console.log(
        ` ${response.config.method?.toUpperCase()} ${response.config.url}`,
      );
      return response;
    },
    (error) => {
      console.error(
        ` ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
        error.message,
      );
      return Promise.reject(error);
    },
  );
}

/**
 * Un objet wrapper autour d'Axios pour simplifier les appels HTTP courants.
 * Chaque méthode retourne directement la propriété `data` de la réponse Axios.
 */
export const request = {
  /**
   * Exécute une requête GET.
   * @template T Le type de données attendu dans la réponse.
   * @param {string} url L'URL de l'endpoint.
   * @param {import("axios").AxiosRequestConfig} [config] Configuration optionnelle (permet d'envoyer des paramètres, headers, etc.).
   * @returns {Promise<T>} Une promesse qui se résout avec les données de la réponse.
   */
  get: async <T>(
    url: string,
    config?: import("axios").AxiosRequestConfig,
  ): Promise<T> => {
    const response = await api.get<T>(url, config);
    return response.data;
  },

  /**
   * Exécute une requête POST.
   * @template T Le type de données attendu dans la réponse.
   * @param {string} url L'URL de l'endpoint.
   * @param {unknown} [data] Le corps de la requête.
   * @returns {Promise<T>} Une promesse qui se résout avec les données de la réponse.
   */
  post: async <T>(
    url: string,
    data?: unknown,
    config?: import("axios").AxiosRequestConfig,
  ): Promise<T> => {
    const response = await api.post<T>(url, data, config);
    return response.data;
  },

  /**
   * Exécute une requête PUT.
   * @template T Le type de données attendu dans la réponse.
   * @param {string} url L'URL de l'endpoint.
   * @param {unknown} [data] Le corps de la requête.
   * @returns {Promise<T>} Une promesse qui se résout avec les données de la réponse.
   */
  put: async <T>(url: string, data?: unknown): Promise<T> => {
    const response = await api.put<T>(url, data);
    return response.data;
  },

  /**
   * Exécute une requête DELETE.
   * @template T Le type de données attendu dans la réponse.
   * @param {string} url L'URL de l'endpoint.
   * @param {import("axios").AxiosRequestConfig} [config] Configuration optionnelle (permet d'envoyer des données via config.data).
   * @returns {Promise<T>} Une promesse qui se résout avec les données de la réponse.
   */
  delete: async <T>(
    url: string,
    config?: import("axios").AxiosRequestConfig,
  ): Promise<T> => {
    const response = await api.delete<T>(url, config);
    return response.data;
  },

  /**
   * Exécute une requête POST avec des données `multipart/form-data`, typiquement pour un upload de fichier.
   * @template T Le type de données attendu dans la réponse.
   * @param {string} url L'URL de l'endpoint.
   * @param {Record<string, any>} data Un objet contenant les paires clé-valeur à envoyer.
   * @param {File} file Le fichier à uploader.
   * @param {string} [fileFieldName="photo"] Le nom du champ pour le fichier (par défaut "photo").
   * @returns {Promise<T>} Une promesse qui se résout avec les données de la réponse.
   */
  postWithFile: async <T>(
    url: string,
    data: Record<string, any>,
    file: File,
    fileFieldName: string = "photo",
  ): Promise<T> => {
    const formData = new FormData();

    formData.append(fileFieldName, file);

    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const value = data[key];
        if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value);
        }
      }
    }

    const response = await api.post<T>(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },

  /**
   * Exécute une requête POST avec FormData (agnostique et flexible).
   * Permet d'envoyer des données multipart/form-data avec ou sans fichier.
   * @template T Le type de données attendu dans la réponse.
   * @param {string} url L'URL de l'endpoint.
   * @param {Record<string, any>} data Un objet contenant les données à envoyer (peut inclure des File).
   * @param {import("axios").AxiosRequestConfig} [config] Configuration optionnelle (ex: timeout).
   * @returns {Promise<T>} Une promesse qui se résout avec les données de la réponse.
   */
  postFormData: async <T>(
    url: string,
    data: Record<string, any>,
    config?: import("axios").AxiosRequestConfig,
  ): Promise<T> => {
    const formData = new FormData();

    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const value = data[key];
        if (value === undefined || value === null) {
          continue;
        }
        if (value instanceof File || value instanceof Blob) {
          formData.append(key, value);
        } else if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else if (typeof value === "object") {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      }
    }

    // console.log("\nFormData entries:");
    // for (const [key, value] of formData.entries()) {
    //   if (value instanceof File) {
    //     console.log(
    //       `  - ${key}: [File] ${value.name} (${value.size} bytes, ${value.type})`,
    //     );
    //   } else {
    //     console.log(`  - ${key}:`, value);
    //   }
    // }

    const response = await api.post<T>(url, formData, {
      ...config,
      headers: {
        ...config?.headers,
        // Explicitly remove Content-Type for FormData - let the browser set it automatically with boundary
        "Content-Type": undefined,
      },
    });

    return response.data;
  },
};

/**
 * Fonction utilitaire pour créer des clés de requête pour TanStack Query.
 * Accepte des chaînes, nombres, objets, undefined ou null.
 * Les valeurs undefined/null sont filtrées automatiquement.
 * Les objets sont inclus tels quels pour permettre la comparaison par référence de TanStack Query.
 * @param {...(string | number | object | undefined | null)[]} parts Les segments qui composent la clé.
 * @returns {(string | object)[]} Un tableau utilisable comme clé de requête TanStack Query.
 */
export const createQueryKey = (
  ...parts: (string | number | object | undefined | null)[]
): (string | object)[] => {
  return parts
    .filter((part) => part !== undefined && part !== null)
    .map((part) => {
      if (typeof part === "object") {
        return part; // Garder les objets tels quels pour TanStack Query
      }
      return String(part);
    });
};
