/**
 * Objet centralisant les variables d'environnement de l'application.
 * Permet d'accéder aux variables définies dans le fichier `.env` via `process.env`.
 * Assure un accès typé et cohérent dans toute l'application.
 */
const ENVIRONNEMENTS = {
  /** URL de base de l'application front-end. */
  BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  /** Domaine principal de l'application. */
  DOMAIN: process.env.NEXT_PUBLIC_DOMAIN,
  /** URL de base de l'API back-end. */
  API_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  /** L'univers ou le contexte de l'application */
  UNIVERSE: process.env.NEXT_PUBLIC_UNIVERSE,
  /** L'environnement d'exécution (ex: 'development', 'production'). */
  NODE_ENV: process.env.NEXT_PUBLIC_NODE_ENV,
};

export default ENVIRONNEMENTS;
