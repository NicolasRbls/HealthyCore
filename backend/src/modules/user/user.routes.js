const express = require("express");
const router = express.Router();
const userController = require("./user.controller");
const { checkAuth } = require("../auth/auth.middleware");


/**
 * @swagger
 * tags:
 *   name: User
 *   description: User profile and data management
 */

/**
 * @swagger
 * /api/user/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data
 *       401:
 *         description: Not authenticated
 */
router.get("/profile", checkAuth, userController.getUserProfile);

/**
 * @swagger
 * /api/user/badges:
 *   get:
 *     summary: Get user badges
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user badges
 */
router.get("/badges", checkAuth, userController.getBadgesController);

/**
 * @swagger
 * /api/user/badges/check:
 *   post:
 *     summary: Check for new badges
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of newly unlocked badges
 */
router.post("/badges/check", checkAuth, userController.checkBadgesController);

/**
 * @swagger
 * /api/user/evolution:
 *   get:
 *     summary: Get user evolution data
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for evolution data
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for evolution data
 *     responses:
 *       200:
 *         description: User evolution data
 */
router.get("/evolution", checkAuth, userController.getUserEvolutionController);

/**
 * @swagger
 * /api/user/evolution:
 *   post:
 *     summary: Add a new evolution entry
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - weight
 *               - height
 *               - date
 *             properties:
 *               weight:
 *                 type: number
 *               height:
 *                 type: number
 *               date:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Evolution entry added successfully
 */
router.post("/evolution", checkAuth, userController.addEvolutionController);

/**
 * @swagger
 * /api/user/progress/stats:
 *   get:
 *     summary: Get user progress statistics
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [week, month, year]
 *         description: Period for statistics
 *     responses:
 *       200:
 *         description: Progress statistics
 */
router.get("/progress/stats", checkAuth, userController.getProgressStatsController);

/**
 * @swagger
 * /api/user/edit-profile:
 *   put:
 *     summary: Update user profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               gender:
 *                 type: string
 *               birthDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.put("/edit-profile", checkAuth, userController.updateUserProfile);

/**
 * @swagger
 * /api/user/edit-preferences:
 *   put:
 *     summary: Update user preferences
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Preferences updated successfully
 */
router.put("/edit-preferences", checkAuth, userController.updatePreferencesController);

/**
 * @swagger
 * /api/user/weight-update-status:
 *   get:
 *     summary: Get weight update status
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Weight update status
 */
router.get("/weight-update-status", checkAuth, userController.getWeightUpdateStatusController);

module.exports = router;
