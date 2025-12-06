const express = require("express");
const router = express.Router();
const dataController = require("./data.controller");
const { checkAuth } = require("../auth/auth.middleware");
const programsRoutes = require("./programs/programs.routes");


/**
 * @swagger
 * tags:
 *   name: Data
 *   description: Static data and reference values
 */

/**
 * @swagger
 * /api/data/sedentary-levels:
 *   get:
 *     summary: Get sedentary levels
 *     tags: [Data]
 *     responses:
 *       200:
 *         description: List of sedentary levels
 */
router.get("/sedentary-levels", dataController.getSedentaryLevels);

/**
 * @swagger
 * /api/data/nutritional-plans:
 *   get:
 *     summary: Get nutritional plans
 *     tags: [Data]
 *     responses:
 *       200:
 *         description: List of nutritional plans
 */
router.get("/nutritional-plans", dataController.getNutritionalPlans);

/**
 * @swagger
 * /api/data/diets:
 *   get:
 *     summary: Get diets
 *     tags: [Data]
 *     responses:
 *       200:
 *         description: List of diets
 */
router.get("/diets", dataController.getDiets);

/**
 * @swagger
 * /api/data/activities:
 *   get:
 *     summary: Get activities
 *     tags: [Data]
 *     responses:
 *       200:
 *         description: List of activities
 */
router.get("/activities", dataController.getActivities);

/**
 * @swagger
 * /api/data/weekly-sessions:
 *   get:
 *     summary: Get weekly sessions options
 *     tags: [Data]
 *     responses:
 *       200:
 *         description: List of weekly sessions options
 */
router.get("/weekly-sessions", dataController.getWeeklySessions);

/**
 * @swagger
 * /api/data/user-preferences:
 *   get:
 *     summary: Get user preferences data
 *     tags: [Data]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User preferences data
 */
router.get("/user-preferences", checkAuth, dataController.getUserPreferences);

/**
 * @swagger
 * /api/data/user-evolution:
 *   get:
 *     summary: Get user evolution data (deprecated?)
 *     tags: [Data]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User evolution data
 */
router.get("/user-evolution", checkAuth, dataController.getUserEvolution);
router.use("/programs", programsRoutes);


module.exports = router;
