const express = require("express");
const foodsController = require("./foods.controller");
const { isAdmin } = require("../auth/auth.middleware");

const router = express.Router();
/**
 * Routes Admin
 */
/**
 *  @route GET /api/admin/foods
 * @desc Récupérer tous les aliments avec pagination    
 *  @access Private (Admin)
 */
router.get("/", isAdmin, foodsController.getAllFoods);