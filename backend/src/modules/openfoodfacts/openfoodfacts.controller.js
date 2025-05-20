const OpenFoodFactsService = require("./openfoodfacts.service");
const { catchAsync } = require("../../utils/catcherror.utils");
const { AppError } = require("../../utils/response.utils");

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
};

module.exports = OpenFoodFactsController;
