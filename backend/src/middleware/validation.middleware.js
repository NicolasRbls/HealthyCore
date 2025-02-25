const { ValidationError } = require("../utils/response.utils");

/**
 * Middleware pour valider les données d'inscription
 */
const validateRegistration = (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;

  // Validation du nom et prénom
  const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s-]+$/;
  const isNameValid = nameRegex.test(firstName) && nameRegex.test(lastName);

  // Validation de l'email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(email);

  // Validation du mot de passe
  const isPasswordValid = password && password.length >= 8;

  if (!isNameValid || !isEmailValid || !isPasswordValid) {
    const errors = {
      firstName: !nameRegex.test(firstName)
        ? "Format de prénom invalide"
        : null,
      lastName: !nameRegex.test(lastName) ? "Format de nom invalide" : null,
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

    return next(new ValidationError("Données d'inscription invalides", errors));
  }

  next();
};

/**
 * Middleware pour valider les attributs physiques
 */
const validatePhysical = (req, res, next) => {
  const { gender, birthDate, weight, height } = req.body;

  // Validation du genre
  const isGenderValid = ["H", "F", "NS"].includes(gender);

  // Validation de la date de naissance (13 ans minimum)
  const birthDateObj = new Date(birthDate);
  const today = new Date();
  const age = today.getFullYear() - birthDateObj.getFullYear();
  const isOldEnough = age >= 13;

  // Validation du poids et de la taille
  const isWeightValid = parseFloat(weight) > 0 && parseFloat(weight) < 500;
  const isHeightValid = parseFloat(height) > 0 && parseFloat(height) < 300;

  if (!isGenderValid || !isOldEnough || !isWeightValid || !isHeightValid) {
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

    return next(new ValidationError("Données physiques invalides", errors));
  }

  next();
};

/**
 * Middleware pour valider le poids cible
 */
const validateTargetWeight = (req, res, next) => {
  const { currentWeight, targetWeight } = req.body;

  // Vérification que le poids cible est un nombre positif
  const isTargetWeightValid =
    targetWeight !== undefined &&
    !isNaN(targetWeight) &&
    parseFloat(targetWeight) > 0 &&
    parseFloat(targetWeight) < 500;

  if (!isTargetWeightValid) {
    return next(
      new ValidationError("Poids cible invalide", {
        targetWeight:
          "Le poids cible doit être un nombre positif inférieur à 500kg",
      })
    );
  }

  // Vérification que le poids actuel est défini pour les calculs
  if (currentWeight === undefined || isNaN(currentWeight)) {
    return next(
      new ValidationError("Poids actuel requis", {
        currentWeight: "Le poids actuel doit être fourni pour les calculs",
      })
    );
  }

  next();
};

module.exports = {
  validateRegistration,
  validatePhysical,
  validateTargetWeight,
};
