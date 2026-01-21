const express = require("express");
const router = express.Router();
const signalementController = require("./signalement.controller");
const authMiddleware = require("../auth/auth.middleware");
const { check } = require("express-validator");

/**
 * @swagger
 * tags:
 *   name: Signalement
 *   description: Reporting management
 */

/**
 * @swagger
 * /api/signalements/types:
 *   get:
 *     summary: Get signalement types
 *     tags: [Signalement]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of signalement types
 */
router.get(
    "/types",
    authMiddleware.checkAuth,
    signalementController.getSignalementTypes
);

/**
 * @swagger
 * /api/signalements:
 *   post:
 *     summary: Create a new signalement
 *     tags: [Signalement]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_signalement
 *               - id_aliment
 *             properties:
 *               id_signalement:
 *                 type: integer
 *               id_aliment:
 *                 type: integer
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Signalement created successfully
 *       400:
 *         description: Validation error
 */
router.post(
    "/",
    authMiddleware.checkAuth,
    [
        check("id_signalement").isInt().withMessage("ID signalement invalide"),
        check("id_aliment").isInt().withMessage("ID aliment invalide"),
        check("description").optional().isString(),
    ],
    signalementController.createSignalement
);

/**
 * @swagger
 * /api/signalements:
 *   get:
 *     summary: Get all signalements (Admin)
 *     tags: [Signalement]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all signalements
 *       403:
 *         description: Forbidden (Admin only)
 */
router.get(
    "/",
    authMiddleware.checkAuth,
    authMiddleware.isAdmin,
    signalementController.getAllSignalements
);

/**
 * @swagger
 * /api/signalements/{id}:
 *   put:
 *     summary: Update signalement status (Admin)
 *     tags: [Signalement]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Signalement ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - statut
 *             properties:
 *               statut:
 *                 type: string
 *                 enum: [non_revue, traite, ignore]
 *     responses:
 *       200:
 *         description: Signalement updated successfully
 *       403:
 *         description: Forbidden (Admin only)
 */
router.put(
    "/:id",
    authMiddleware.checkAuth,
    authMiddleware.isAdmin,
    [check("statut").isIn(["non_revue", "traite", "ignore"])],
    signalementController.updateSignalementStatus
);

module.exports = router;
