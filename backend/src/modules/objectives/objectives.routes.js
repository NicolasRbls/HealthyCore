const express = require("express");
const router = express.Router();
const objectivesController = require("./objectives.controller");
const { checkAuth } = require("../auth/auth.middleware");

/**
 * @swagger
 * tags:
 *   name: Objectives
 *   description: User objectives management
 */

/**
 * @swagger
 * /api/objectives/daily:
 *   get:
 *     summary: Get user daily objectives
 *     tags: [Objectives]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daily objectives list
 */
router.get("/daily", checkAuth, objectivesController.getUserDailyObjectives);

/**
 * @swagger
 * /api/objectives/{objectiveId}/complete:
 *   put:
 *     summary: Mark an objective as complete
 *     tags: [Objectives]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: objectiveId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Objective ID
 *     responses:
 *       200:
 *         description: Objective marked as complete
 */
router.put(
  "/:objectiveId/complete",
  checkAuth,
  objectivesController.completeObjective
);

module.exports = router;
