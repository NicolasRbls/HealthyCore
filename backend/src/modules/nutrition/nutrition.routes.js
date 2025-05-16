const express = require("express");
const foodController = require("./nutrition.controller");

const router = express.Router();

/**
 *  @route GET /api/admin/nutrition
 * @desc Récupérer tous les aliments avec pagination    
 *  @access Private (Admin)
 */
router.get("/", foodController.getAllTheFood)

module.exports = router;