const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { hashPassword, comparePassword } = require("../utils/password.utils");
const { generateToken } = require("../utils/jwt.utils");

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
        email: userData.email,
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
        bmr: userData.bmr,
        tdee: userData.tdee,
        calories_quotidiennes: userData.dailyCalories,
        duree_objectif_semaines: userData.targetDurationWeeks,
        deficit_surplus_calorique: userData.caloricDeficitSurplus,
      },
    });

    // Ajout des activités préférées
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
    throw error;
  }
};

const loginUser = async (email, password) => {
  try {
    // Recherche de l'utilisateur
    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Vérification du mot de passe
    const isPasswordValid = await comparePassword(password, user.mot_de_passe);

    if (!isPasswordValid) {
      throw new Error("Invalid password");
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
    throw error;
  }
};

module.exports = {
  registerUser,
  loginUser,
};
