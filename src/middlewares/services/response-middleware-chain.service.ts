import { ResponseMiddleware } from "../types/response.middleware";

/**
 * Crée une chaîne de middlewares pour les réponses.
 * Prend un tableau de middlewares et les exécute séquentiellement sur l'objet de réponse.
 * Chaque middleware reçoit la réponse et une fonction `next` pour passer au suivant.
 *
 * @param {ResponseMiddleware[]} middlewares - Un tableau de middlewares de réponse à enchaîner.
 * @returns Une fonction asynchrone qui prend la réponse initiale et exécute la chaîne de middlewares.
 */
export const createResponseMiddlewareChain = (
  middlewares: ResponseMiddleware[],
) => {
  return async (response: any) => {
    const executeMiddleware = async (
      index: number,
      currentResponse: any,
    ): Promise<any> => {
      if (index >= middlewares.length) {
        return currentResponse;
      }

      const next = async (modifiedResponse: any) => {
        return executeMiddleware(index + 1, modifiedResponse);
      };

      return middlewares[index](currentResponse, next);
    };

    return executeMiddleware(0, response);
  };
};
