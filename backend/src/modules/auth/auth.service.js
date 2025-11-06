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

module.exports = {
  registerUser,
  loginUser,
};
