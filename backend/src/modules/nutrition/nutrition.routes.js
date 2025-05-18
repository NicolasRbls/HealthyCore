const express = require("express");
const NutritionController = require("./nutrition.controller");
const { checkAuth } = require("../auth/auth.middleware");

const router = express.Router();

/**
 * Routes publiques (accessibles sans authentification)
 */

/**
 * @route GET /api/nutrition
 * @desc Récupérer tous les aliments avec pagination et filtrage
 * @access Public
 */
router.get("/", NutritionController.getAllFoods);

/**
 * @route GET /api/nutrition/:id
 * @desc Récupérer un aliment par son identifiant
 * @access Public
 */
router.get("/:id", NutritionController.getFoodById);

/**
 * Routes utilisateur (nécessitent une authentification)
 */

/**
 * @route GET /api/nutrition/user/summary
 * @desc Obtenir le résumé nutritionnel de l'utilisateur
 * @access Private (User)
 */
router.get("/user/summary", checkAuth, NutritionController.getNutritionSummary);

/**
 * @route GET /api/nutrition/user/today
 * @desc Obtenir la nutrition d'aujourd'hui
 * @access Private (User)
 */
router.get("/user/today", checkAuth, NutritionController.getTodayNutrition);

/**
 * @route POST /api/nutrition/user/log
 * @desc Ajouter un aliment au suivi nutritionnel
 * @access Private (User)
 */
router.post("/user/log", checkAuth, NutritionController.logNutrition);

/**
 * @route DELETE /api/nutrition/user/log/:entryId
 * @desc Supprimer une entrée du suivi nutritionnel
 * @access Private (User)
 */
router.delete(
  "/user/log/:entryId",
  checkAuth,
  NutritionController.deleteNutritionEntry
);

/**
 * @route GET /api/nutrition/user/history
 * @desc Récupérer l'historique du suivi nutritionnel
 * @access Private (User)
 */
router.get("/user/history", checkAuth, NutritionController.getNutritionHistory);

module.exports = router;
