const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const calculationService = require("../../services/calculation.service");
const { success, AppError } = require("../../utils/response.utils");

/**
 * Contrôleur pour récupérer les niveaux de sédentarité
 */
exports.getSedentaryLevels = async (req, res, next) => {
  try {
    const levels = await prisma.niveaux_sedentarites.findMany();

    res
      .status(200)
      .json(success(levels, "Niveaux de sédentarité récupérés avec succès"));
  } catch (err) {
    next(err);
  }
};

/**
 * Contrôleur pour récupérer les plans nutritionnels
 */
exports.getNutritionalPlans = async (req, res, next) => {
  try {
    const { type } = req.query; // type: perte_de_poids, prise_de_poids, maintien

    const plans = await prisma.repartitions_nutritionnelles.findMany({
      where: type ? { type } : undefined,
    });

    res
      .status(200)
      .json(success(plans, "Plans nutritionnels récupérés avec succès"));
  } catch (err) {
    next(err);
  }
};

/**
 * Contrôleur pour récupérer les régimes alimentaires
 */
exports.getDiets = async (req, res, next) => {
  try {
    const diets = await prisma.regimes_alimentaires.findMany();

    res
      .status(200)
      .json(success(diets, "Régimes alimentaires récupérés avec succès"));
  } catch (err) {
    next(err);
  }
};

/**
 * Contrôleur pour récupérer les activités
 */
exports.getActivities = async (req, res, next) => {
  try {
    const activities = await prisma.activites.findMany();

    res
      .status(200)
      .json(success(activities, "Activités récupérées avec succès"));
  } catch (err) {
    next(err);
  }
};

/**
 * Contrôleur pour récupérer les sessions hebdomadaires
 */
exports.getWeeklySessions = async (req, res, next) => {
  try {
    // Les valeurs sont hardcodées car elles ne sont pas stockées en base de données
    const sessions = [
      { id: 1, value: "1 à 2 séances", label: "Débutant" },
      { id: 2, value: "3 à 4 séances", label: "Intermédiaire" },
      { id: 3, value: "5 à 6 séances", label: "Confirmé" },
      { id: 4, value: "7+ séances", label: "Expert" },
    ];

    res
      .status(200)
      .json(success(sessions, "Sessions hebdomadaires récupérées avec succès"));
  } catch (err) {
    next(err);
  }
};

/**
 * Contrôleur pour récupérer les préférences de l'utilisateur
 */
exports.getUserPreferences = async (req, res, next) => {
  try {
    const userId = req.user.id_user;

    const preferences = await prisma.preferences.findFirst({
      where: { id_user: userId },
      include: {
        niveaux_sedentarites: true,
        regimes_alimentaires: true,
        repartitions_nutritionnelles: true,
        preferences_activites: {
          include: {
            activites: true,
          },
        },
      },
    });

    if (!preferences) {
      throw new AppError(
        "Préférences utilisateur non trouvées",
        404,
        "PREFERENCES_NOT_FOUND"
      );
    }

    // Récupération de la dernière évolution pour connaître le poids et la taille actuels
    const latestEvolution = await prisma.evolutions.findFirst({
      where: { id_user: userId },
      orderBy: { date: "desc" },
    });

    // Calcul de la répartition des macronutriments
    const macroDistribution = calculationService.calculateMacroDistribution(
      preferences.calories_quotidiennes,
      parseFloat(preferences.repartitions_nutritionnelles.pourcentage_glucides),
      parseFloat(
        preferences.repartitions_nutritionnelles.pourcentage_proteines
      ),
      parseFloat(preferences.repartitions_nutritionnelles.pourcentage_lipides)
    );

    // Construction de la réponse
    const response = {
      preferences,
      currentWeight: latestEvolution ? parseFloat(latestEvolution.poids) : null,
      currentHeight: latestEvolution
        ? parseFloat(latestEvolution.taille)
        : null,
      macroDistribution,
      tdee: preferences.tdee ? parseFloat(preferences.tdee) : null,
    };

    res
      .status(200)
      .json(
        success(response, "Préférences utilisateur récupérées avec succès")
      );
  } catch (err) {
    next(err);
  }
};

/**
 * Contrôleur pour récupérer l'évolution de l'utilisateur
 */
exports.getUserEvolution = async (req, res, next) => {
  try {
    const userId = req.user.id_user;

    const evolutions = await prisma.evolutions.findMany({
      where: { id_user: userId },
      orderBy: { date: "asc" },
    });

    if (!evolutions || evolutions.length === 0) {
      throw new AppError(
        "Données d'évolution non trouvées",
        404,
        "EVOLUTION_NOT_FOUND"
      );
    }

    // Formatage des données pour faciliter l'utilisation côté client
    const formattedEvolutions = evolutions.map((evolution) => ({
      date: evolution.date,
      weight: parseFloat(evolution.poids),
      height: parseFloat(evolution.taille),
      bmi: calculationService
        .calculateBMI(parseFloat(evolution.poids), parseFloat(evolution.taille))
        .toFixed(1),
    }));

    res
      .status(200)
      .json(
        success(
          formattedEvolutions,
          "Données d'évolution récupérées avec succès"
        )
      );
  } catch (err) {
    next(err);
  }
};
