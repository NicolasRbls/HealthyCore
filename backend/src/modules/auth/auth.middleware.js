const { PrismaClient } = require("@prisma/client");
const { verifyToken } = require("../../utils/jwt.utils");
const { AppError } = require("../../utils/response.utils");

const prisma = new PrismaClient();

/**
 * Middleware pour vérifier si l'utilisateur est authentifié
 * Vérifie le token JWT et ajoute l'utilisateur à la requête
 */
const checkAuth = async (req, res, next) => {
  try {
    // Extraire le token du header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("Authentification requise", 401, "NO_TOKEN");
    }

    const token = authHeader.split(" ")[1];

    // Vérifier le token
    const decoded = verifyToken(token);

    // Récupérer l'utilisateur depuis la base de données
    const user = await prisma.users.findUnique({
      where: { id_user: decoded.userId },
      select: {
        id_user: true,
        prenom: true,
        nom: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      throw new AppError("Utilisateur non trouvé", 404, "USER_NOT_FOUND");
    }

    // Ajouter l'utilisateur à la requête
    req.user = user;
    next();
  } catch (err) {
    // Les erreurs spécifiques à JWT seront capturées par le middleware d'erreur
    if (err.name === "TokenExpiredError") {
      return next(new AppError("Votre session a expiré", 401, "TOKEN_EXPIRED"));
    }

    if (err.name === "JsonWebTokenError") {
      return next(
        new AppError("Token d'authentification invalide", 401, "INVALID_TOKEN")
      );
    }

    next(err);
  }
};

/**
 * Middleware pour vérifier si l'utilisateur a le rôle administrateur
 * Doit être utilisé après le middleware checkAuth
 */
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return next(
      new AppError("Utilisateur non authentifié", 401, "NOT_AUTHENTICATED")
    );
  }

  if (req.user.role !== "admin") {
    return next(
      new AppError(
        "Accès refusé. Rôle administrateur requis.",
        403,
        "FORBIDDEN"
      )
    );
  }

  next();
};

/**
 * Middleware pour vérifier si l'utilisateur est le propriétaire de la ressource
 * ou s'il est administrateur
 * @param {Function} getResourceUserId - Fonction pour extraire l'ID utilisateur de la ressource
 */
const isOwnerOrAdmin = (getResourceUserId) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        throw new AppError(
          "Utilisateur non authentifié",
          401,
          "NOT_AUTHENTICATED"
        );
      }

      // Si l'utilisateur est admin, on le laisse passer
      if (req.user.role === "admin") {
        return next();
      }

      // Sinon, on vérifie s'il est le propriétaire de la ressource
      const resourceUserId = await getResourceUserId(req);

      if (req.user.id_user !== resourceUserId) {
        throw new AppError(
          "Accès refusé. Vous n'êtes pas le propriétaire de cette ressource.",
          403,
          "FORBIDDEN"
        );
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};

module.exports = {
  checkAuth,
  isAdmin,
  isOwnerOrAdmin,
};
