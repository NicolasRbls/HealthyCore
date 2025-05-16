const express = require("express");
const foodController = require("./nutrition.controller");
const { checkAuth } = require("../../auth/auth.middleware");

const router = express.Router();

/**
 *  @route GET /api/admin/nutrition
 *  @desc Récupérer tous les aliments avec pagination    
 *  @access Private (Admin)
 */
router.get("/", foodController.getAllTheFood);

/**
 *  @route GET /api/user/nutrition/summary
 *  @desc Obtenir le résumé nutritionnel de l'utilisateur
 *  @access Private (User)
 */
router.get("/summary", checkAuth, foodController.getNutritionSummary);

/**
 * @route GET /api/user/nutrition/today
 * @desc Obtenir la nutrition d'aujourd'hui
 * @access Private (User)
 */
router.get("/today", checkAuth, foodController.getTodayNutrition);

/**
 * @route POST /api/user/nutrition/log
 * @desc Ajouter un aliment au suivi nutritionnel
 * @access Private (User)
 */
router.post("/log", checkAuth, foodController.logNutrition);

/**
 * @route DELETE /api/user/nutrition/log/:entryId
 * @desc Supprimer une entrée du suivi nutritionnel
 * @access Private (User)
 */
router.delete("/log/:entryId", checkAuth, foodController.deleteNutritionEntry);

/**
 * @route GET /api/user/nutrition/history
 * @desc Récupérer l'historique du suivi nutritionnel
 * @access Private (User)
 */
router.get("/history", checkAuth, foodController.getNutritionHistory);

module.exports = router;