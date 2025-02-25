require("dotenv").config();

/**
 * Configuration centralisée de l'application
 * Toutes les variables d'environnement sont récupérées ici
 * Pour les variables requises, une vérification est effectuée
 */

// Fonction utilitaire pour vérifier les variables d'environnement requises
const requireEnv = (key) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is required`);
  }
  return value;
};

// Configuration du serveur
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";
const API_URL = process.env.API_URL || `http://localhost:${PORT}/api`;
const VERSION = process.env.npm_package_version || "1.0.0";

// Configuration de la base de données
const DATABASE_URL = requireEnv("DATABASE_URL");

// Configuration de l'authentification
const JWT_SECRET = requireEnv("JWT_SECRET");
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || "10", 10);

// Configuration CORS
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";

// Exporter la configuration
const config = {
  PORT,
  NODE_ENV,
  API_URL,
  VERSION,
  DATABASE_URL,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  SALT_ROUNDS,
  CORS_ORIGIN,

  // Informations pour le seed/provisionnement initial
  ADMIN: {
    PRENOM: process.env.ADMIN_PRENOM || "admin",
    NOM: process.env.ADMIN_NOM || "admin",
    SEXE: process.env.ADMIN_SEXE || "NS",
    DATE_DE_NAISSANCE: process.env.ADMIN_DATE_DE_NAISSANCE || "1990-01-01",
    EMAIL: process.env.ADMIN_EMAIL || "admin@admin.com",
    PASSWORD: process.env.ADMIN_PASSWORD || "admin",
  },
};

module.exports = config;
