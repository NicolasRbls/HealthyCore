const config = require("../../config/config");
const { PrismaClient } = require("@prisma/client");
const authService = require("./auth.service");
const { success, error, AppError } = require("../../utils/response.utils");

const prisma = new PrismaClient();

/**
 * Contrôleur pour gérer l'inscription d'un nouvel utilisateur
 */
exports.register = async (req, res, next) => {
  try {
    const userData = req.body;

    const result = await authService.registerUser(userData);

    res.status(201).json(
      success(
        {
          token: result.token,
          user: result.user,
        },
        "Inscription réussie"
      )
    );
  } catch (err) {
    console.error("Registration error:", err);

    // Si c'est une erreur de contrainte unique (email déjà utilisé)
    if (err.code === "P2002" && err.meta?.target?.includes("email")) {
      return res
        .status(409)
        .json(
          error(
            "Cette adresse email est déjà utilisée",
            "EMAIL_ALREADY_EXISTS",
            409
          )
        );
    }

    next(err);
  }
};

/**
 * Contrôleur pour gérer la connexion d'un utilisateur
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError(
        "L'email et le mot de passe sont requis",
        400,
        "MISSING_CREDENTIALS"
      );
    }

    try {
      const result = await authService.loginUser(email, password);

      res.status(200).json(
        success(
          {
            token: result.token,
            user: result.user,
          },
          "Connexion réussie"
        )
      );
    } catch (authError) {
      // Nous masquons la raison précise de l'échec d'authentification pour des raisons de sécurité
      if (
        authError.message === "User not found" ||
        authError.message === "Invalid password"
      ) {
        throw new AppError(
          "Email ou mot de passe incorrect",
          401,
          "INVALID_CREDENTIALS"
        );
      }
      throw authError;
    }
  } catch (err) {
    next(err);
  }
};

/**
 * Contrôleur pour vérifier la validité d'un token JWT
 */
exports.verifyToken = (req, res) => {
  // Le middleware checkAuth a déjà vérifié le token et ajouté req.user
  res.status(200).json(
    success(
      {
        valid: true,
        user: req.user,
      },
      "Token valide"
    )
  );
};

/**
 * Contrôleur pour récupérer les informations de l'utilisateur connecté
 */
exports.getMe = async (req, res, next) => {
  try {
    // req.user contient l'utilisateur authentifié (ajouté par le middleware auth)
    const userId = req.user.id_user;

    const user = await prisma.users.findUnique({
      where: { id_user: userId },
      select: {
        id_user: true,
        prenom: true,
        nom: true,
        email: true,
        role: true,
        sexe: true,
        date_de_naissance: true,
        cree_a: true,
      },
    });

    if (!user) {
      throw new AppError("Utilisateur non trouvé", 404, "USER_NOT_FOUND");
    }

    res.status(200).json(
      success(
        {
          user: {
            id: user.id_user,
            firstName: user.prenom,
            lastName: user.nom,
            email: user.email,
            role: user.role,
            gender: user.sexe,
            birthDate: user.date_de_naissance,
            createdAt: user.cree_a,
          },
        },
        "Informations utilisateur récupérées avec succès"
      )
    );
  } catch (err) {
    next(err);
  }
};
