const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { ValidationError } = require("../utils/response.utils");

/**
 * Vérifie si un email est disponible (non utilisé)
 * @param {string} email - Email à vérifier
 * @returns {Promise<{available: boolean}>}
 */
const checkEmailAvailability = async (email) => {
  try {
    const user = await prisma.users.findFirst({
      where: {
        email: {
          equals: email.toLowerCase(),
          mode: "insensitive",
        },
      },
    });

    return { available: !user };
  } catch (error) {
    throw error;
  }
};

/**
 * Valide les données de profil (nom, prénom, email, mot de passe)
 * @param {string} firstName - Prénom
 * @param {string} lastName - Nom
 * @param {string} email - Email
 * @param {string} password - Mot de passe
 * @returns {{isValid: boolean, errors: Object}}
 */
const validateProfileData = (firstName, lastName, email, password) => {
  // Validation du nom et prénom
  const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s-]+$/;
  const isFirstNameValid = firstName && nameRegex.test(firstName);
  const isLastNameValid = lastName && nameRegex.test(lastName);

  // Validation de l'email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = email && emailRegex.test(email);

  // Validation du mot de passe
  const isPasswordValid = password && password.length >= 8;

  const isValid =
    isFirstNameValid && isLastNameValid && isEmailValid && isPasswordValid;

  const errors = {
    firstName: !isFirstNameValid
      ? "Le prénom contient des caractères invalides"
      : null,
    lastName: !isLastNameValid
      ? "Le nom contient des caractères invalides"
      : null,
    email: !isEmailValid ? "Format d'email invalide" : null,
    password: !isPasswordValid
      ? "Le mot de passe doit contenir au moins 8 caractères"
      : null,
  };

  // Filtrer les erreurs nulles
  for (const key in errors) {
    if (errors[key] === null) {
      delete errors[key];
    }
  }

  return {
    isValid,
    errors,
  };
};

/**
 * Valide les attributs physiques (genre, date de naissance, poids, taille)
 * @param {string} gender - Genre (H, F, NS)
 * @param {string} birthDate - Date de naissance
 * @param {number} weight - Poids
 * @param {number} height - Taille
 * @returns {{isValid: boolean, errors: Object}}
 */
const validatePhysicalData = (gender, birthDate, weight, height) => {
  // Validation du genre
  const isGenderValid = ["H", "F", "NS"].includes(gender);

  // Validation de la date de naissance (13 ans minimum)
  let isOldEnough = false;
  let adjustedAge = 0;

  if (birthDate) {
    const birthDateObj = new Date(birthDate);
    const today = new Date();
    const age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDiff = today.getMonth() - birthDateObj.getMonth();
    const isMonthLower =
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDateObj.getDate());
    adjustedAge = isMonthLower ? age - 1 : age;
    isOldEnough = adjustedAge >= 13;
  }

  // Validation du poids et de la taille
  const isWeightValid = weight && weight > 0 && weight < 500;
  const isHeightValid = height && height > 0 && height < 300;

  const isValid =
    isGenderValid && isOldEnough && isWeightValid && isHeightValid;

  const errors = {
    gender: !isGenderValid ? "Genre invalide" : null,
    birthDate: !isOldEnough ? "Vous devez avoir au moins 13 ans" : null,
    weight: !isWeightValid
      ? "Poids invalide (doit être inférieur à 500kg)"
      : null,
    height: !isHeightValid
      ? "Taille invalide (doit être inférieure à 300cm)"
      : null,
  };

  // Filtrer les erreurs nulles
  for (const key in errors) {
    if (errors[key] === null) {
      delete errors[key];
    }
  }

  return {
    isValid,
    errors,
  };
};

/**
 * Calcule l'âge à partir d'une date de naissance
 * @param {string} birthDate - Date de naissance
 * @returns {number}
 */
const calculateAge = (birthDate) => {
  const today = new Date();
  const birthDateObj = new Date(birthDate);

  let age = today.getFullYear() - birthDateObj.getFullYear();
  const monthDiff = today.getMonth() - birthDateObj.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDateObj.getDate())
  ) {
    age--;
  }

  return age;
};

module.exports = {
  checkEmailAvailability,
  validateProfileData,
  validatePhysicalData,
  calculateAge,
};
