import { RequestMiddleware } from "../types/request.middleware";

/**
 * Crée une chaîne de middlewares pour les requêtes.
 * Prend un tableau de middlewares et les exécute séquentiellement.
 * Chaque middleware reçoit la configuration de la requête et une fonction `next` pour passer au suivant.
 *
 * @param {RequestMiddleware[]} middlewares - Un tableau de middlewares de requête à enchaîner.
 * @returns Une fonction asynchrone qui prend la configuration initiale et exécute la chaîne de middlewares.
 */
export const createRequestMiddlewareChain = (
  middlewares: RequestMiddleware[],
) => {
  return async (config: any) => {
    const executeMiddleware = async (
      index: number,
      currentConfig: any,
    ): Promise<any> => {
      if (index >= middlewares.length) {
        return currentConfig;
      }

      const next = async (modifiedConfig: any) => {
        return executeMiddleware(index + 1, modifiedConfig);
      };

      return middlewares[index](currentConfig, next);
    };

    return executeMiddleware(0, config);
  };
};
