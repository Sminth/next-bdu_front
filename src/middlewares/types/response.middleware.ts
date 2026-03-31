/**
 * Définit la signature d'un middleware de réponse.
 * C'est une fonction qui reçoit l'objet de réponse et une fonction `next`.
 * Elle peut inspecter ou modifier la réponse avant de la passer à `next`.
 *
 * @param response L'objet de réponse (ex: réponse Axios).
 * @param next Une fonction qui, lorsqu'elle est appelée avec une réponse, poursuit la chaîne des middlewares.
 * @returns Le résultat de la chaîne de middlewares.
 */
export type ResponseMiddleware = (
  response: any,
  next: (response: any) => any,
) => any;
