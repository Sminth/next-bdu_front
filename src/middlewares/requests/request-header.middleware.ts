import ENVIRONNEMENTS from "@/constants/environnement";
import Cookies from "js-cookie";
import { RequestMiddleware } from "../types/request.middleware";

/**
 * Middleware pour ajouter l'en-tête d'autorisation (Authorization) aux requêtes sortantes.
 * Ce middleware récupère le token d'authentification depuis les cookies et, s'il existe,
 * l'ajoute à l'en-tête 'Authorization' avec le préfixe 'Bearer'.
 *
 * @param config La configuration de la requête en cours. Cet objet sera modifié pour y inclure l'en-tête.
 * @param next La fonction à appeler pour passer au middleware suivant dans la chaîne.
 * @returns Le résultat de l'appel au middleware suivant.
 */
export const requestHeaderMiddleware: RequestMiddleware = async (
  config,
  next,
) => {
  const token = Cookies.get("token_" + ENVIRONNEMENTS.UNIVERSE);

  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return next(config);
};
