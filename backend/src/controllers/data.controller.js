const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const calculationService = require("../services/calculation.service");

// Récupération des niveaux de sédentarité
exports.getSedentaryLevels = async (req, res) => {
  try {
    const levels = await prisma.niveaux_sedentarites.findMany();
    res.status(200).json(levels);
  } catch (error) {
    console.error("Error fetching sedentary levels:", error);
    res
      .status(500)
      .json({ message: "Error fetching data", error: error.message });
  }
};

// Récupération des plans nutritionnels
exports.getNutritionalPlans = async (req, res) => {
  try {
    const { type } = req.query; // type: perte_de_poids, prise_de_poids, maintien

    const plans = await prisma.repartitions_nutritionnelles.findMany({
      where: type ? { type } : undefined,
    });

    res.status(200).json(plans);
  } catch (error) {
    console.error("Error fetching nutritional plans:", error);
    res
      .status(500)
      .json({ message: "Error fetching data", error: error.message });
  }
};

// Récupération des régimes alimentaires
exports.getDiets = async (req, res) => {
  try {
    const diets = await prisma.regimes_alimentaires.findMany();
    res.status(200).json(diets);
  } catch (error) {
    console.error("Error fetching diets:", error);
    res
      .status(500)
      .json({ message: "Error fetching data", error: error.message });
  }
};

// Récupération des activités
exports.getActivities = async (req, res) => {
  try {
    const activities = await prisma.activites.findMany();
    res.status(200).json(activities);
  } catch (error) {
    console.error("Error fetching activities:", error);
    res
      .status(500)
      .json({ message: "Error fetching data", error: error.message });
  }
};

// Récupération des sessions hebdomadaires
exports.getWeeklySessions = async (req, res) => {
  try {
    // Les valeurs sont hardcodées car elles ne sont pas stockées en base de données
    const sessions = [
      { id: 1, value: "1 à 2 séances", label: "Débutant" },
      { id: 2, value: "3 à 4 séances", label: "Intermédiaire" },
      { id: 3, value: "5 à 6 séances", label: "Confirmé" },
      { id: 4, value: "7+ séances", label: "Expert" },
    ];

    res.status(200).json(sessions);
  } catch (error) {
    console.error("Error fetching weekly sessions:", error);
    res
      .status(500)
      .json({ message: "Error fetching data", error: error.message });
  }
};

// Récupération des préférences de l'utilisateur
exports.getUserPreferences = async (req, res) => {
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
      return res.status(404).json({ message: "User preferences not found" });
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
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching user preferences:", error);
    res
      .status(500)
      .json({ message: "Error fetching data", error: error.message });
  }
};

// Récupération de l'évolution de l'utilisateur
exports.getUserEvolution = async (req, res) => {
  try {
    const userId = req.user.id_user;

    const evolutions = await prisma.evolutions.findMany({
      where: { id_user: userId },
      orderBy: { date: "asc" },
    });

    if (!evolutions || evolutions.length === 0) {
      return res.status(404).json({ message: "User evolution data not found" });
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

    res.status(200).json(formattedEvolutions);
  } catch (error) {
    console.error("Error fetching user evolution:", error);
    res
      .status(500)
      .json({ message: "Error fetching data", error: error.message });
  }
};
