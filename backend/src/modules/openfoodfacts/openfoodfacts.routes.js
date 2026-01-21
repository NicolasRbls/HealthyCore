const express = require("express");
const OpenFoodFactsController = require("./openfoodfacts.controller");
const { checkAuth } = require("../auth/auth.middleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: OpenFoodFacts
 *   description: OpenFoodFacts integration
 */

/**
 * @swagger
 * /api/openfoodfacts/product/{barcode}:
 *   get:
 *     summary: Get product by barcode
 *     tags: [OpenFoodFacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: barcode
 *         required: true
 *         schema:
 *           type: string
 *         description: Product barcode
 *     responses:
 *       200:
 *         description: Product details
 *       404:
 *         description: Product not found
 */
router.get(
  "/product/:barcode",
  checkAuth,
  OpenFoodFactsController.getProductByBarcode
);

/**
 * @swagger
 * /api/openfoodfacts/search:
 *   get:
 *     summary: Search products
 *     tags: [OpenFoodFacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of results
 *     responses:
 *       200:
 *         description: Search results
 */
router.get("/search", checkAuth, OpenFoodFactsController.searchProducts);

module.exports = router;
