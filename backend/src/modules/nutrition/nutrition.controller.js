const NutritionService = require("./nutrition.service");
const { catchAsync } = require("../../utils/catcherror.utils");
const { AppError } = require("../../utils/response.utils");

/**
 * Contrôleur pour les opérations liées à la nutrition
 */
const NutritionController = {
  /**
   * Récupère tous les aliments avec filtrage et pagination
   */
  getAllFoods: catchAsync(async (req, res) => {
    // Extraire les paramètres de requête
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const search = req.query.search || "";
    const type = req.query.type || null;
    const tagId = req.query.tagId || null;
    const source = req.query.source || null;

    // Valider les paramètres
    if (type && !["produit", "recette"].includes(type)) {
      throw new AppError(
        'Type invalide. Doit être "produit" ou "recette"',
        400,
        "INVALID_TYPE"
      );
    }

    if (source && !["user", "admin", "api"].includes(source)) {
      throw new AppError(
        'Source invalide. Doit être "user", "admin" ou "api"',
        400,
        "INVALID_SOURCE"
      );
    }

    // Appeler le service
    const { foods, total, totalPages } = await NutritionService.getAllFoods({
      page,
      limit,
      search,
      type,
      tagId,
      source,
    });

    // Renvoyer la réponse formatée
    res.status(200).json({
      status: "success",
      data: {
        foods,
        pagination: {
          total,
          totalPages,
          currentPage: page,
          limit,
        },
      },
      message:
        foods.length > 0
          ? "Aliments récupérés avec succès"
          : "Aucun aliment trouvé correspondant aux critères de recherche",
    });
  }),

  /**
   * Récupère un aliment par son identifiant
   */
  getFoodById: catchAsync(async (req, res) => {
    const { id } = req.params;

    if (!id) {
      throw new AppError("Identifiant de l'aliment requis", 400, "MISSING_ID");
    }

    const food = await NutritionService.getFoodById(Number(id));

    res.status(200).json({
      status: "success",
      data: food,
      message: "Aliment récupéré avec succès",
    });
  }),

  /**
   * Récupère le résumé nutritionnel d'un utilisateur
   */
  getNutritionSummary: catchAsync(async (req, res) => {
    const userId = req.user.id_user;
    const summary = await NutritionService.getNutritionSummary(userId);

    res.status(200).json({
      status: "success",
      data: summary,
      message: "Résumé nutritionnel récupéré avec succès",
    });
  }),

  /**
   * Récupère le suivi nutritionnel du jour d'un utilisateur
   */
  getTodayNutrition: catchAsync(async (req, res) => {
    const userId = req.user.id_user;
    const data = await NutritionService.getTodayNutrition(userId);

    res.status(200).json({
      status: "success",
      data,
      message: "Suivi nutritionnel d'aujourd'hui récupéré avec succès",
    });
  }),

  /**
   * Ajoute un aliment au suivi nutritionnel
   */
  logNutrition: catchAsync(async (req, res) => {
    const userId = req.user.id_user;
    const { foodId, quantity, meal, date } = req.body;

    if (!foodId || !quantity || !meal) {
      throw new AppError(
        "foodId, quantity et meal sont obligatoires",
        400,
        "MISSING_FIELDS"
      );
    }

    const data = await NutritionService.logNutrition(userId, {
      foodId: Number(foodId),
      quantity: Number(quantity),
      meal,
      date,
    });

    res.status(201).json({
      status: "success",
      data,
      message: "Aliment ajouté au suivi nutritionnel",
    });
  }),

  /**
   * Supprime une entrée du suivi nutritionnel
   */
  deleteNutritionEntry: catchAsync(async (req, res) => {
    const userId = req.user.id_user;
    const entryId = req.params.entryId;

    if (!entryId) {
      throw new AppError(
        "Identifiant de l'entrée requis",
        400,
        "MISSING_ENTRY_ID"
      );
    }

    await NutritionService.deleteNutritionEntry(userId, Number(entryId));

    res.status(200).json({
      status: "success",
      message: "Entrée supprimée du suivi nutritionnel",
    });
  }),

  /**
   * Récupère l'historique nutritionnel d'un utilisateur
   */
  getNutritionHistory: catchAsync(async (req, res) => {
    const userId = req.user.id_user;
    const { startDate, endDate } = req.query;
    const data = await NutritionService.getNutritionHistory(userId, {
      startDate,
      endDate,
    });

    res.status(200).json({
      status: "success",
      data,
      message: "Historique nutritionnel récupéré avec succès",
    });
  }),
};

module.exports = NutritionController;
