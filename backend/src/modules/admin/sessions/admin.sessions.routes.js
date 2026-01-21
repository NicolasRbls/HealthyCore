const express = require("express");
const adminSessionsController = require("./admin.sessions.controller");
const { isAdmin } = require("../../auth/auth.middleware");
const { checkAuth } = require("../../auth/auth.middleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: AdminSession
 *   description: Admin session management
 */

/**
 * @swagger
 * /api/admin/sessions:
 *   get:
 *     summary: Get all sessions
 *     tags: [AdminSession]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of sessions
 *       403:
 *         description: Forbidden (Admin only)
 */
router.get("/", checkAuth, isAdmin, adminSessionsController.getAllSessions);

/**
 * @swagger
 * /api/admin/sessions/{id}:
 *   get:
 *     summary: Get session by ID
 *     tags: [AdminSession]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Session ID
 *     responses:
 *       200:
 *         description: Session details
 *       403:
 *         description: Forbidden (Admin only)
 */
router.get("/:id", checkAuth, isAdmin, adminSessionsController.getSessionById);

/**
 * @swagger
 * /api/admin/sessions:
 *   post:
 *     summary: Create a new session
 *     tags: [AdminSession]
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
 *         description: Session created successfully
 *       403:
 *         description: Forbidden (Admin only)
 */
router.post("/", checkAuth, isAdmin, adminSessionsController.createSession);

/**
 * @swagger
 * /api/admin/sessions/{sessionId}:
 *   put:
 *     summary: Update a session
 *     tags: [AdminSession]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Session ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Session updated successfully
 *       403:
 *         description: Forbidden (Admin only)
 */
router.put(
  "/:sessionId",
  checkAuth,
  isAdmin,
  adminSessionsController.updateSession
);

/**
 * @swagger
 * /api/admin/sessions/{sessionId}:
 *   delete:
 *     summary: Delete a session
 *     tags: [AdminSession]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Session ID
 *     responses:
 *       200:
 *         description: Session deleted successfully
 *       403:
 *         description: Forbidden (Admin only)
 */
router.delete(
  "/:sessionId",
  checkAuth,
  isAdmin,
  adminSessionsController.deleteSession
);

module.exports = router;
