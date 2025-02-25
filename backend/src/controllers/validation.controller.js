const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const validationService = require("../services/validation.service");
const calculationService = require("../services/calculation.service");

exports.checkEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const result = await validationService.checkEmailAvailability(email);

    res.status(200).json({
      available: result.available,
      message: result.available ? "Email available" : "Email already in use",
    });
  } catch (error) {
    console.error("Email check error:", error);
    res
      .status(500)
      .json({ message: "Error checking email", error: error.message });
  }
};

exports.validateProfile = (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    const result = validationService.validateProfileData(
      firstName,
      lastName,
      email,
      password
    );

    res.status(200).json(result);
  } catch (error) {
    console.error("Profile validation error:", error);
    res
      .status(500)
      .json({ message: "Error validating profile", error: error.message });
  }
};

exports.validatePhysical = (req, res) => {
  try {
    const { gender, birthDate, weight, height } = req.body;

    const result = validationService.validatePhysicalData(
      gender,
      birthDate,
      weight,
      height
    );

    res.status(200).json(result);
  } catch (error) {
    console.error("Physical validation error:", error);
    res.status(500).json({
      message: "Error validating physical attributes",
      error: error.message,
    });
  }
};

exports.validateTargetWeight = async (req, res) => {
  try {
    const {
      currentWeight,
      targetWeight,
      height,
      gender,
      birthDate,
      sedentaryLevelId,
    } = req.body;

    // Validation de l'IMC
    const bmiValidation = calculationService.validateTargetWeight(
      targetWeight,
      height
    );

    if (!bmiValidation.isValid) {
      return res.status(200).json({
        isValid: false,
        targetBMI: bmiValidation.targetBMI,
        message: bmiValidation.message,
      });
    }

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

    // Calcul de l'estimation
    const estimation = calculationService.calculateWeightChangeEstimation(
      currentWeight,
      targetWeight,
      height,
      gender,
      age,
      activityFactor
    );

    res.status(200).json({
      isValid: true,
      targetBMI: bmiValidation.targetBMI,
      estimation,
      message: bmiValidation.message,
    });
  } catch (error) {
    console.error("Target weight validation error:", error);
    res
      .status(500)
      .json({
        message: "Error validating target weight",
        error: error.message,
      });
  }
};
