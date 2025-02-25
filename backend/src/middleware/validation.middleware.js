// Middleware pour valider les données d'entrée

// Validation de l'inscription
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
    return res.status(400).json({
      message: "Invalid input data",
      errors: {
        firstName: !nameRegex.test(firstName)
          ? "Invalid first name format"
          : null,
        lastName: !nameRegex.test(lastName) ? "Invalid last name format" : null,
        email: !isEmailValid ? "Invalid email format" : null,
        password: !isPasswordValid
          ? "Password must be at least 8 characters long"
          : null,
      },
    });
  }

  next();
};

// Validation des attributs physiques
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
  const isWeightValid = weight > 0 && weight < 500;
  const isHeightValid = height > 0 && height < 300;

  if (!isGenderValid || !isOldEnough || !isWeightValid || !isHeightValid) {
    return res.status(400).json({
      message: "Invalid physical data",
      errors: {
        gender: !isGenderValid ? "Invalid gender" : null,
        birthDate: !isOldEnough ? "You must be at least 13 years old" : null,
        weight: !isWeightValid
          ? "Invalid weight (must be less than 500kg)"
          : null,
        height: !isHeightValid
          ? "Invalid height (must be less than 300cm)"
          : null,
      },
    });
  }

  next();
};

// Validation du poids cible
const validateTargetWeight = (req, res, next) => {
  const { currentWeight, targetWeight } = req.body;

  // Vérification que le poids cible est un nombre positif
  const isTargetWeightValid =
    targetWeight !== undefined &&
    !isNaN(targetWeight) &&
    targetWeight > 0 &&
    targetWeight < 500;

  if (!isTargetWeightValid) {
    return res.status(400).json({
      message: "Invalid target weight",
      error: "Target weight must be a positive number less than 500kg",
    });
  }

  // Vérification que le poids actuel est défini pour les calculs
  if (currentWeight === undefined || isNaN(currentWeight)) {
    return res.status(400).json({
      message: "Current weight is required",
      error: "Current weight must be provided for calculations",
    });
  }

  next();
};

module.exports = {
  validateRegistration,
  validatePhysical,
  validateTargetWeight,
};
