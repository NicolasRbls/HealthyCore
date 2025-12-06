const express = require("express");
const adminExerciseController = require("./admin.exercises.controller");
const { isAdmin } = require("../../auth/auth.middleware");
const { checkAuth } = require("../../auth/auth.middleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: AdminExercise
 *   description: Admin exercise management
 */

/**
 * @swagger
 * /api/admin/exercises:
 *   get:
 *     summary: Get all exercises
 *     tags: [AdminExercise]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of exercises
 *       403:
 *         description: Forbidden (Admin only)
 */
router.get("/", checkAuth, isAdmin, adminExerciseController.getAllExercises);

/**
 * @swagger
 * /api/admin/exercises/{id}:
 *   get:
 *     summary: Get exercise by ID
 *     tags: [AdminExercise]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Exercise ID
 *     responses:
 *       200:
 *         description: Exercise details
 *       403:
 *         description: Forbidden (Admin only)
 */
router.get("/:id", checkAuth, isAdmin, adminExerciseController.getExerciseById);

/**
 * @swagger
 * /api/admin/exercises:
 *   post:
 *     summary: Create a new exercise
 *     tags: [AdminExercise]
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
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Exercise created successfully
 *       403:
 *         description: Forbidden (Admin only)
 */
router.post("/", checkAuth, isAdmin, adminExerciseController.createExercise);

/**
 * @swagger
 * /api/admin/exercises/{id}:
 *   put:
 *     summary: Update an exercise
 *     tags: [AdminExercise]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Exercise ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Exercise updated successfully
 *       403:
 *         description: Forbidden (Admin only)
 */
router.put("/:id", checkAuth, isAdmin, adminExerciseController.updateExercise);

/**
 * @swagger
 * /api/admin/exercises/{id}:
 *   delete:
 *     summary: Delete an exercise
 *     tags: [AdminExercise]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Exercise ID
 *     responses:
 *       200:
 *         description: Exercise deleted successfully
 *       403:
 *         description: Forbidden (Admin only)
 */
router.delete(
  "/:id",
  checkAuth,
  isAdmin,
  adminExerciseController.deleteExercise
);

module.exports = router;
