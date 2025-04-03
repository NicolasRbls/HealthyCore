const express = require("express");
const foodController = require("./foods.controller");
console.log(foodController);
const { isAdmin } = require("../../auth/auth.middleware");

const router = express.Router();

/**
 *  @route GET /api/admin/foods
 * @desc Récupérer tous les aliments avec pagination    
 *  @access Private (Admin)
 */
router.get("/", foodController.getAllTheFood)

module.exports = router;