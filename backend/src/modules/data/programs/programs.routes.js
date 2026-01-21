const express = require("express");
const router = express.Router();
const programsController = require("./programs.controller");
const { checkAuth } = require("../../auth/auth.middleware");

/**
 * @swagger
 * tags:
 *   name: DataProgram
 *   description: User programs and sessions management
 */

/**
 * @swagger
 * /api/data/programs:
 *   get:
 *     summary: Get available programs
 *     tags: [DataProgram]
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
 *     responses:
 *       200:
 *         description: List of programs
 */
router.get("/", checkAuth, programsController.getPrograms);

/**
 * @swagger
 * /api/data/programs/today-session:
 *   get:
 *     summary: Get today's session
 *     tags: [DataProgram]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Today's session details
 */
router.get("/today-session", checkAuth, programsController.getTodaySession);

/**
 * @swagger
 * /api/data/programs/sport-progress:
 *   get:
 *     summary: Get user sport progress
 *     tags: [DataProgram]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sport progress data
 */
router.get("/sport-progress", checkAuth, programsController.getSportProgress);

/**
 * @swagger
 * /api/data/programs/sessions:
 *   get:
 *     summary: Get sessions for a specific program
 *     tags: [DataProgram]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: programId
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of sessions
 */
router.get("/sessions", checkAuth, programsController.getSessions);

/**
 * @swagger
 * /api/data/programs/sessions/{sessionId}:
 *   get:
 *     summary: Get session details
 *     tags: [DataProgram]
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
 *         description: Session details
 */
router.get("/sessions/:sessionId", checkAuth, programsController.getSessionDetails);

/**
 * @swagger
 * /api/data/programs/sessions/{sessionId}/complete:
 *   post:
 *     summary: Mark a session as complete
 *     tags: [DataProgram]
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
 *         description: Session marked as complete
 */
router.post("/sessions/:sessionId/complete", checkAuth, programsController.completeSession);

/**
 * @swagger
 * /api/data/programs/{programId}:
 *   get:
 *     summary: Get program details
 *     tags: [DataProgram]
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
 */
router.get("/:programId", checkAuth, programsController.getProgramDetails);

/**
 * @swagger
 * /api/data/programs/{programId}/start:
 *   post:
 *     summary: Start a program
 *     tags: [DataProgram]
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
 *         description: Program started successfully
 */
router.post("/:programId/start", checkAuth, programsController.startProgram);


module.exports = router;
