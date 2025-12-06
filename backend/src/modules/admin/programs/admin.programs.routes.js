const express = require("express");
const adminProgramsController = require("./admin.programs.controller");
const { isAdmin } = require("../../auth/auth.middleware");
const { checkAuth } = require("../../auth/auth.middleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: AdminProgram
 *   description: Admin program management
 */

/**
 * @swagger
 * /api/admin/programs:
 *   get:
 *     summary: Get all programs
 *     tags: [AdminProgram]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of programs
 *       403:
 *         description: Forbidden (Admin only)
 */
router.get("/", checkAuth, isAdmin, adminProgramsController.getAllPrograms);

/**
 * @swagger
 * /api/admin/programs/{programId}:
 *   get:
 *     summary: Get program by ID
 *     tags: [AdminProgram]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: programId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Program ID
 *     responses:
 *       200:
 *         description: Program details
 *       403:
 *         description: Forbidden (Admin only)
 */
router.get(
  "/:programId",
  checkAuth,
  isAdmin,
  adminProgramsController.getProgramById
);

/**
 * @swagger
 * /api/admin/programs:
 *   post:
 *     summary: Create a new program
 *     tags: [AdminProgram]
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
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Program created successfully
 *       403:
 *         description: Forbidden (Admin only)
 */
router.post("/", checkAuth, isAdmin, adminProgramsController.createProgram);

/**
 * @swagger
 * /api/admin/programs/{programId}:
 *   put:
 *     summary: Update a program
 *     tags: [AdminProgram]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: programId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Program ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Program updated successfully
 *       403:
 *         description: Forbidden (Admin only)
 */
router.put(
  "/:programId",
  checkAuth,
  isAdmin,
  adminProgramsController.updateProgram
);

/**
 * @swagger
 * /api/admin/programs/{programId}:
 *   delete:
 *     summary: Delete a program
 *     tags: [AdminProgram]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: programId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Program ID
 *     responses:
 *       200:
 *         description: Program deleted successfully
 *       403:
 *         description: Forbidden (Admin only)
 */
router.delete(
  "/:programId",
  checkAuth,
  isAdmin,
  adminProgramsController.deleteProgram
);

module.exports = router;
