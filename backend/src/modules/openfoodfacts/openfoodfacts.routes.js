const express = require("express");
const OpenFoodFactsController = require("./openfoodfacts.controller");
const { checkAuth } = require("../auth/auth.middleware");

const router = express.Router();

/**
 * @route GET /api/openfoodfacts/product/:barcode
 * @desc Récupère un produit par code-barres
 * @access Private
 */
router.get(
  "/product/:barcode",
  checkAuth,
  OpenFoodFactsController.getProductByBarcode
);

/**
 * @route GET /api/openfoodfacts/search
 * @desc Recherche de produits par mot-clé
 * @access Private
 */
router.get("/search", checkAuth, OpenFoodFactsController.searchProducts);

module.exports = router;
