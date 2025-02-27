const express = require("express");
const OpenFoodFactsController = require("./openfoodfacts.controller");

const router = express.Router();

/**
 * @route GET /api/openfoodfacts/product/:barcode
 * @desc Récupère un produit par code-barres
 */
router.get("/product/:barcode", OpenFoodFactsController.getProduct);

/**
 * @route GET /api/openfoodfacts/search
 * @desc Recherche de produits par mot-clé
 */
router.get("/search", OpenFoodFactsController.search);

module.exports = router;