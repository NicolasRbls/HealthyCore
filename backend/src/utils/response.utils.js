/**
 * Utilitaires pour standardiser les réponses API
 */

/**
 * Crée une réponse de succès standardisée
 * @param {Object} data - Les données à retourner
 * @param {string} message - Message de succès (optionnel)
 * @param {number} statusCode - Code HTTP (default: 200)
 */
const success = (data, message = "", statusCode = 200) => {
  return {
    status: "success",
    statusCode,
    message,
    data,
  };
};

/**
 * Crée une réponse d'erreur standardisée
 * @param {string} message - Message d'erreur
 * @param {string} code - Code d'erreur pour identifier le type d'erreur
 * @param {number} statusCode - Code HTTP (default: 400)
 * @param {Object} errors - Détails des erreurs (validation, etc.)
 */
const error = (
  message,
  code = "BAD_REQUEST",
  statusCode = 400,
  errors = null
) => {
  const errorResponse = {
    status: "error",
    statusCode,
    message,
    code,
  };

  if (errors) {
    errorResponse.errors = errors;
  }

  return errorResponse;
};

/**
 * Crée une erreur personnalisée avec code HTTP
 * @param {string} message - Message d'erreur
 * @param {number} statusCode - Code HTTP
 * @param {string} code - Code d'erreur pour identifier le type d'erreur
 */
class AppError extends Error {
  constructor(message, statusCode = 400, code = "BAD_REQUEST") {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.name = "AppError";
  }
}

/**
 * Crée une erreur de validation
 * @param {string} message - Message d'erreur global
 * @param {Object} errors - Détails des erreurs de validation par champ
 */
class ValidationError extends Error {
  constructor(message, errors = {}) {
    super(message);
    this.errors = errors;
    this.name = "ValidationError";
  }
}

module.exports = {
  success,
  error,
  AppError,
  ValidationError,
};
