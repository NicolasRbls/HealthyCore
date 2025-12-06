const express = require("express");
const adminFoodsController = require("./admin.foods.controller");
const { isAdmin } = require("../../auth/auth.middleware");
const { checkAuth } = require("../../auth/auth.middleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: AdminFood
 *   description: Admin food management
 */

/**
 * @swagger
 * /api/admin/foods/stats:
 *   get:
 *     summary: Get food statistics
 *     tags: [AdminFood]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Food statistics
 *       403:
 *         description: Forbidden (Admin only)
 */
router.get("/stats", checkAuth, isAdmin, adminFoodsController.getFoodStats);

/**
 * @swagger
 * /api/admin/foods:
 *   get:
 *     summary: Get all foods with pagination
 *     tags: [AdminFood]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of foods
 *       403:
 *         description: Forbidden (Admin only)
 */
router.get("/", checkAuth, isAdmin, adminFoodsController.getFoods);

/**
 * @swagger
 * /api/admin/foods:
 *   post:
 *     summary: Create a new food item
 *     tags: [AdminFood]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - calories
 *             properties:
 *               name:
 *                 type: string
 *               calories:
 *                 type: number
 *     responses:
 *       201:
 *         description: Food created successfully
 *       403:
 *         description: Forbidden (Admin only)
 */
router.post("/", checkAuth, isAdmin, adminFoodsController.createFood);

/**
 * @swagger
 * /api/admin/foods/{foodId}:
 *   get:
 *     summary: Get food by ID
 *     tags: [AdminFood]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: foodId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Food ID
 *     responses:
 *       200:
 *         description: Food details
 *       403:
 *         description: Forbidden (Admin only)
 */
router.get("/:foodId", checkAuth, isAdmin, adminFoodsController.getFoodById);

/**
 * @swagger
 * /api/admin/foods/{foodId}:
 *   put:
 *     summary: Update a food item
 *     tags: [AdminFood]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: foodId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Food ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Food updated successfully
 *       403:
 *         description: Forbidden (Admin only)
 */
router.put("/:foodId", checkAuth, isAdmin, adminFoodsController.updateFood);

/**
 * @swagger
 * /api/admin/foods/{foodId}:
 *   delete:
 *     summary: Delete a food item
 *     tags: [AdminFood]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: foodId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Food ID
 *     responses:
 *       200:
 *         description: Food deleted successfully
 *       403:
 *         description: Forbidden (Admin only)
 */
router.delete("/:foodId", checkAuth, isAdmin, adminFoodsController.deleteFood);

module.exports = router;
