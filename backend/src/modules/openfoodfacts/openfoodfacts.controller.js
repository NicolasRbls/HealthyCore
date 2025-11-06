const OpenFoodFactsService = require("./openfoodfacts.service");
const { catchAsync } = require("../../utils/catcherror.utils");
const { AppError } = require("../../utils/response.utils");
const NutritionService = require("../nutrition/nutrition.service");

/**
 * Contrôleur pour les opérations liées à OpenFoodFacts
 */
const OpenFoodFactsController = {
  /**
   * Récupère un produit par code-barres
   */
  getProductByBarcode: catchAsync(async (req, res) => {
    const { barcode } = req.params;

    if (!barcode) {
      throw new AppError("Code-barres requis", 400, "MISSING_BARCODE");
    }

    const product = await OpenFoodFactsService.getProductByBarcode(barcode);

    // Si le produit n'est pas trouvé, retourner une réponse 404 appropriée
    if (!product) {
      return res.status(404).json({
        status: "fail",
        message: `Produit avec code-barres ${barcode} non trouvé`,
        code: "PRODUCT_NOT_FOUND",
        data: null,
      });
    }

    res.status(200).json({
      status: "success",
      data: product,
      message: "Produit récupéré avec succès",
    });
  }),

  /**
   * Recherche des produits par terme
   */
  searchProducts: catchAsync(async (req, res) => {
    const { query } = req.query;
    const limit = parseInt(req.query.limit) || 10;

    if (!query) {
      throw new AppError("Terme de recherche requis", 400, "MISSING_QUERY");
    }

    const products = await OpenFoodFactsService.searchProducts(query, limit);

    res.status(200).json({
      status: "success",
      data: products,
      message:
        products.length > 0
          ? "Produits trouvés avec succès"
          : "Aucun produit trouvé pour cette recherche",


    });
  }),

  /**
   * Recommande des aliments pour l'utilisateur en fonction de son profil sportif
   */
  /**
   * GET /recommendations/:userId
   */
  // openfoodfacts.controller.js
async getRecommendations(req, res) {
  try {
    const { userId } = req.params;
    console.log("userId reçu :", userId); // 🔹 debug

    if (!userId) {
      return res.status(400).json({ message: "userId manquant" });
    }

    const foods = await OpenFoodFactsService.getRecommendations(userId);
    res.status(200).json(foods);
  } catch (error) {
    console.error("Erreur recommandation:", error.message);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
}



};

module.exports = OpenFoodFactsController;
