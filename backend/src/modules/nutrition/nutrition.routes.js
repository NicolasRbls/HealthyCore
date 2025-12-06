const express = require("express");
const NutritionController = require("./nutrition.controller");
const { checkAuth } = require("../auth/auth.middleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Nutrition
 *   description: Nutrition and food management
 */

/**
 * @swagger
 * /api/nutrition:
 *   get:
 *     summary: Get all foods with pagination and filtering
 *     tags: [Nutrition]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term
 *     responses:
 *       200:
 *         description: List of foods
 */
router.get("/", NutritionController.getAllFoods);

/**
 * @swagger
 * /api/nutrition/{id}:
 *   get:
 *     summary: Get a food item by ID
 *     tags: [Nutrition]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Food ID
 *     responses:
 *       200:
 *         description: Food details
 *       404:
 *         description: Food not found
 */
router.get("/:id", NutritionController.getFoodById);

/**
 * @swagger
 * /api/nutrition/user/summary:
 *   get:
 *     summary: Get user nutrition summary
 *     tags: [Nutrition]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Nutrition summary
 */
router.get("/user/summary", checkAuth, NutritionController.getNutritionSummary);

/**
 * @swagger
 * /api/nutrition/user/today:
 *   get:
 *     summary: Get today's nutrition logs
 *     tags: [Nutrition]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Today's nutrition logs
 */
router.get("/user/today", checkAuth, NutritionController.getTodayNutrition);

/**
 * @swagger
 * /api/nutrition/user/log:
 *   post:
 *     summary: Log a food item
 *     tags: [Nutrition]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - foodId
 *               - quantity
 *               - meal
 *             properties:
 *               foodId:
 *                 type: integer
 *               quantity:
 *                 type: number
 *               meal:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Food logged successfully
 */
router.post("/user/log", checkAuth, NutritionController.logNutrition);

/**
 * @swagger
 * /api/nutrition/user/log/{entryId}:
 *   delete:
 *     summary: Delete a nutrition log entry
 *     tags: [Nutrition]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: entryId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Log entry ID
 *     responses:
 *       200:
 *         description: Entry deleted successfully
 */
router.delete(
  "/user/log/:entryId",
  checkAuth,
  NutritionController.deleteNutritionEntry
);

/**
 * @swagger
 * /api/nutrition/user/history:
 *   get:
 *     summary: Get nutrition history
 *     tags: [Nutrition]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Nutrition history
 */
router.get("/user/history", checkAuth, NutritionController.getNutritionHistory);

module.exports = router;
