const config = require("../config/config");
const { PrismaClientKnownRequestError } = require("@prisma/client/runtime");

/**
 * Middleware de gestion centralisée des erreurs
 * Toutes les erreurs de l'application sont traitées ici
 */
const errorMiddleware = (err, req, res, next) => {
  // Log l'erreur complète en développement uniquement
  if (config.NODE_ENV === "development") {
    console.error("Error details:", err);
  } else {
    // En production, log juste le message et la stack si disponible
    console.error(`${err.name}: ${err.message}`);
  }

  // Erreurs spécifiques à Prisma
  if (err instanceof PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002": // Unique constraint violation
        return res.status(409).json({
          status: "error",
          message: "Une ressource avec ces données existe déjà.",
          code: "RESOURCE_CONFLICT",
        });
      case "P2025": // Record not found
        return res.status(404).json({
          status: "error",
          message: "Ressource non trouvée.",
          code: "RESOURCE_NOT_FOUND",
        });
      default:
        return res.status(500).json({
          status: "error",
          message: "Erreur de base de données.",
          code: "DATABASE_ERROR",
        });
    }
  }

  // Erreurs d'authentification
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      status: "error",
      message: "Votre session a expiré. Veuillez vous reconnecter.",
      code: "TOKEN_EXPIRED",
    });
  }

  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      status: "error",
      message: "Session invalide. Veuillez vous reconnecter.",
      code: "INVALID_TOKEN",
    });
  }

  // Erreurs de validation
  if (err.name === "ValidationError") {
    return res.status(400).json({
      status: "error",
      message: err.message,
      errors: err.errors,
      code: "VALIDATION_ERROR",
    });
  }

  // Erreurs personnalisées avec code HTTP spécifique
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
      code: err.code || "API_ERROR",
    });
  }

  // Erreur par défaut
  res.status(500).json({
    status: "error",
    message: "Une erreur interne est survenue.",
    code: "INTERNAL_SERVER_ERROR",
  });
};

module.exports = errorMiddleware;
