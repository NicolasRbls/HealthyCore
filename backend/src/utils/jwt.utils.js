const jwt = require("jsonwebtoken");
const config = require("../config/config");
const { AppError } = require("./response.utils");

/**
 * Génère un token JWT
 * @param {Object} payload - Données à intégrer dans le token
 * @returns {string}
 */
const generateToken = (payload) => {
  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN,
  });
};

/**
 * Vérifie un token JWT
 * @param {string} token - Token à vérifier
 * @returns {Object}
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.JWT_SECRET);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new AppError("Votre session a expiré", 401, "TOKEN_EXPIRED");
    }

    if (error.name === "JsonWebTokenError") {
      throw new AppError(
        "Token d'authentification invalide",
        401,
        "INVALID_TOKEN"
      );
    }

    throw error;
  }
};

module.exports = {
  generateToken,
  verifyToken,
};
