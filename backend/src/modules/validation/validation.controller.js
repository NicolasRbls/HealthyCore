const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const validationService = require("../../services/validation.service");
const calculationService = require("../../services/calculation.service");
const {
  success,
  error,
  AppError,
  ValidationError,
} = require("../../utils/response.utils");

/**
 * Contrôleur pour vérifier la disponibilité d'un email
 */
exports.checkEmail = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new AppError("L'email est requis", 400, "MISSING_EMAIL");
    }

    const result = await validationService.checkEmailAvailability(email);

    res.status(200).json(
      success(
        {
          available: result.available,
        },
        result.available ? "Email disponible" : "Email déjà utilisé"
      )
    );
  } catch (err) {
    next(err);
  }
};

/**
 * Contrôleur pour valider les données de profil
 */
exports.validateProfile = (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    const result = validationService.validateProfileData(
      firstName,
      lastName,
      email,
      password
    );

    res.status(200).json(success(result));
  } catch (err) {
    next(err);
  }
};

/**
 * Contrôleur pour valider les attributs physiques
 */
exports.validatePhysical = (req, res, next) => {
  try {
    const { gender, birthDate, weight, height } = req.body;

    const result = validationService.validatePhysicalData(
      gender,
      birthDate,
      weight,
      height
    );

    res.status(200).json(success(result));
  } catch (err) {
    next(err);
  }
};

/**
 * Contrôleur pour valider le poids cible
 */
exports.validateTargetWeight = async (req, res, next) => {
  try {
    const {
      currentWeight,
      targetWeight,
      height,
      gender,
      birthDate,
      sedentaryLevelId,
    } = req.body;

    // Validation des données d'entrée
    if (!currentWeight || !targetWeight || !height) {
      throw new AppError(
        "Données incomplètes pour la validation",
        400,
        "INCOMPLETE_DATA"
      );
    }

    // Validation de l'IMC
    const bmiValidation = calculationService.validateTargetWeight(
      targetWeight,
      height
    );

    // Calcul de l'âge
    const age = validationService.calculateAge(birthDate);

    // Récupération du facteur d'activité depuis la base de données
    const sedentaryLevel = await prisma.niveaux_sedentarites.findUnique({
      where: { id_niveau_sedentarite: sedentaryLevelId },
    });

    // Utilisation de la valeur de la base de données, ou valeur par défaut si non trouvée
    const activityFactor = sedentaryLevel
      ? parseFloat(sedentaryLevel.valeur)
      : 1.2;

    // Calculer l'estimation DANS TOUS LES CAS, même si le BMI n'est pas valide
    let estimation = calculationService.calculateWeightChangeEstimation(
      Number(currentWeight),
      Number(targetWeight),
      Number(height),
      gender,
      age,
      activityFactor
    );

    // Renvoyer toujours l'estimation, que le BMI soit valide ou non
    res.status(200).json(
      success({
        isValid: bmiValidation.isValid,
        targetBMI: bmiValidation.targetBMI,
        estimation: estimation,
        message: bmiValidation.message,
      })
    );
  } catch (err) {
    next(err);
  }
};
