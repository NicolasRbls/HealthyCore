const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const checkEmailAvailability = async (email) => {
  try {
    const user = await prisma.users.findUnique({
      where: { email },
    });

    return { available: !user };
  } catch (error) {
    throw error;
  }
};

const validateProfileData = (firstName, lastName, email, password) => {
  // Validation du nom et prénom
  const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s-]+$/;
  const isNameValid = nameRegex.test(firstName) && nameRegex.test(lastName);

  // Validation de l'email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(email);

  // Validation du mot de passe
  const isPasswordValid = password && password.length >= 8;

  const isValid = isNameValid && isEmailValid && isPasswordValid;

  return {
    isValid,
    errors: {
      firstName: !nameRegex.test(firstName)
        ? "Le prénom contient des caractères invalides"
        : null,
      lastName: !nameRegex.test(lastName)
        ? "Le nom contient des caractères invalides"
        : null,
      email: !isEmailValid ? "Format d'email invalide" : null,
      password: !isPasswordValid
        ? "Le mot de passe doit contenir au moins 8 caractères"
        : null,
    },
  };
};

const validatePhysicalData = (gender, birthDate, weight, height) => {
  // Validation du genre
  const isGenderValid = ["H", "F", "NS"].includes(gender);

  // Validation de la date de naissance (13 ans minimum)
  const birthDateObj = new Date(birthDate);
  const today = new Date();
  const age = today.getFullYear() - birthDateObj.getFullYear();
  const monthDiff = today.getMonth() - birthDateObj.getMonth();
  const isMonthLower =
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDateObj.getDate());
  const adjustedAge = isMonthLower ? age - 1 : age;
  const isOldEnough = adjustedAge >= 13;

  // Validation du poids et de la taille
  const isWeightValid = weight > 0 && weight < 500;
  const isHeightValid = height > 0 && height < 300;

  const isValid =
    isGenderValid && isOldEnough && isWeightValid && isHeightValid;

  return {
    isValid,
    errors: {
      gender: !isGenderValid ? "Genre invalide" : null,
      birthDate: !isOldEnough ? "Vous devez avoir au moins 13 ans" : null,
      weight: !isWeightValid
        ? "Poids invalide (doit être inférieur à 500kg)"
        : null,
      height: !isHeightValid
        ? "Taille invalide (doit être inférieure à 300cm)"
        : null,
    },
  };
};

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
