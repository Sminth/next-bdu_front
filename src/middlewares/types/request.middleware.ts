/**
 * Définit la signature d'un middleware de requête.
 * C'est une fonction qui reçoit la configuration de la requête et une fonction `next`.
 * Elle peut modifier la configuration avant de la passer à `next`.
 *
 * @param config La configuration de la requête (ex: objet de configuration Axios).
 * @param next Une fonction qui, lorsqu'elle est appelée avec une configuration, poursuit la chaîne des middlewares.
 * @returns Une promesse qui se résout avec le résultat de la chaîne de middlewares.
 */
export type RequestMiddleware = (
  config: any,
  next: (config: any) => Promise<any>,
) => Promise<any>;
