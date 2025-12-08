const { PrismaClient, Prisma } = require("@prisma/client");
const prisma = new PrismaClient();
const { hashPassword, comparePassword } = require("../../utils/password.utils");
const { generateToken } = require("../../utils/jwt.utils");
const { AppError, ValidationError } = require("../../utils/response.utils");
const config = require("../../config/config");

/**
 * Service pour l'inscription d'un nouvel utilisateur
 * @param {Object} userData - Données de l'utilisateur
 */
const registerUser = async (userData) => {
  try {
    // Hachage du mot de passe
    const hashedPassword = await hashPassword(userData.password);

    // Création de l'utilisateur
    const user = await prisma.users.create({
      data: {
        role: "user",
        prenom: userData.firstName,
        nom: userData.lastName,
        sexe: userData.gender,
        date_de_naissance: new Date(userData.birthDate),
        email: userData.email.toLowerCase(), // Stocker en minuscules pour éviter les duplications
        mot_de_passe: hashedPassword,
        cree_a: new Date(),
        mis_a_jour_a: new Date(),
      },
    });

    // Création d'un document d'évolution (poids et taille initiale)
    await prisma.evolutions.create({
      data: {
        id_user: user.id_user,
        date: new Date(),
        poids: userData.weight,
        taille: userData.height,
      },
    });

    // Création des préférences
    const preferences = await prisma.preferences.create({
      data: {
        id_user: user.id_user,
        objectif_poids: userData.targetWeight,
        id_repartition_nutritionnelle: userData.nutritionalPlanId,
        id_regime_alimentaire: userData.dietId,
        id_niveau_sedentarite: userData.sedentaryLevelId,
        seances_par_semaines: userData.sessionsPerWeek,
        bmr: new Prisma.Decimal(userData.bmr),
        tdee: new Prisma.Decimal(userData.tdee),
        calories_quotidiennes: new Prisma.Decimal(userData.dailyCalories),
        deficit_surplus_calorique: userData.caloricDeficitSurplus
          ? new Prisma.Decimal(userData.caloricDeficitSurplus)
          : null,
        duree_objectif_semaines: userData.targetDurationWeeks,
      },
    }); // Ajout des activités préférées
    if (userData.activities && userData.activities.length > 0) {
      for (const activityId of userData.activities) {
        await prisma.preferences_activites.create({
          data: {
            id_preference: preferences.id_preference,
            id_activite: activityId,
          },
        });
      }
    }

    // Génération du token JWT
    const token = generateToken({
      userId: user.id_user,
      email: user.email,
      role: user.role,
    });

    return {
      token,
      user: {
        id: user.id_user,
        firstName: user.prenom,
        lastName: user.nom,
        email: user.email,
        role: user.role,
      },
    };
  } catch (error) {
    // Gestion spécifique des erreurs Prisma
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002" && error.meta?.target?.includes("email")) {
        throw new AppError(
          "Cette adresse email est déjà utilisée",
          409,
          "EMAIL_ALREADY_EXISTS"
        );
      }
    }
    throw error;
  }
};

/**
 * Service pour la connexion d'un utilisateur
 * @param {string} email - Email de l'utilisateur
 * @param {string} password - Mot de passe de l'utilisateur
 */
const loginUser = async (email, password) => {
  try {
    // Recherche de l'utilisateur (insensible à la casse pour l'email)
    const user = await prisma.users.findFirst({
      where: {
        email: {
          equals: email.toLowerCase(),
          mode: "insensitive",
        },
      },
    });

    if (!user) {
      throw new AppError(
        "Email ou mot de passe incorrect",
        401,
        "INVALID_CREDENTIALS"
      );
    }

    // Vérification du mot de passe
    const isPasswordValid = await comparePassword(password, user.mot_de_passe);

    if (!isPasswordValid) {
      throw new AppError(
        "Email ou mot de passe incorrect",
        401,
        "INVALID_CREDENTIALS"
      );
    }

    // Mise à jour de la dernière connexion
    await prisma.users.update({
      where: { id_user: user.id_user },
      data: { mis_a_jour_a: new Date() },
    });

    // Génération du token JWT
    const token = generateToken({
      userId: user.id_user,
      email: user.email,
      role: user.role,
    });

    return {
      token,
      user: {
        id: user.id_user,
        firstName: user.prenom,
        lastName: user.nom,
        email: user.email,
        role: user.role,
      },
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Service pour la demande de réinitialisation de mot de passe
 * @param {string} email - Email de l'utilisateur
 */
const forgotPassword = async (email) => {
  const crypto = require("crypto");
  const emailService = require("../../services/email.service");

  // 1. Vérifier si l'utilisateur existe
  const user = await prisma.users.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    // Pour des raisons de sécurité, on ne dit pas si l'email existe ou non
    // Mais on peut retourner un succès simulé ou une erreur spécifique captée par le contrôleur
    // Ici, on retourne succès pour ne pas fuiter d'infos
    return;
  }

  // 2. Générer le token de réinitialisation
  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetTokenHash = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const resetTokenExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  // 3. Sauvegarder le token hashé en base
  await prisma.users.update({
    where: { id_user: user.id_user },
    data: {
      reset_token: resetTokenHash,
      reset_token_expires: resetTokenExpires,
    },
  });

  // 4. Envoyer l'email
  try {
    await emailService.sendPasswordResetEmail(user.email, resetToken);
  } catch (err) {
    // Si l'envoi échoue, on nettoie le token pour éviter un blocage
    await prisma.users.update({
      where: { id_user: user.id_user },
      data: {
        reset_token: null,
        reset_token_expires: null,
      },
    });
    throw new AppError(
      "Erreur lors de l'envoi de l'email de réinitialisation",
      500,
      "EMAIL_SEND_ERROR"
    );
  }
};

/**
 * Service pour réinitialiser le mot de passe
 * @param {string} token - Token de réinitialisation
 * @param {string} newPassword - Nouveau mot de passe
 */
const resetPassword = async (token, newPassword) => {
  const crypto = require("crypto");

  // 1. Hasher le token reçu
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  // 2. Trouver l'utilisateur avec ce token VALIDE
  const user = await prisma.users.findFirst({
    where: {
      reset_token: hashedToken,
      reset_token_expires: {
        gt: new Date(), // Date d'expiration doit être dans le futur
      },
    },
  });

  if (!user) {
    throw new AppError(
      "Token invalide ou expiré",
      400,
      "INVALID_OR_EXPIRED_TOKEN"
    );
  }

  // 3. Hasher le nouveau mot de passe
  const hashedPassword = await hashPassword(newPassword);

  // 4. Mettre à jour l'utilisateur
  await prisma.users.update({
    where: { id_user: user.id_user },
    data: {
      mot_de_passe: hashedPassword,
      reset_token: null,
      reset_token_expires: null,
    },
  });
};

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
};
