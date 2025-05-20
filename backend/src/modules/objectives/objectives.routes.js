const express = require("express");
const router = express.Router();
const objectivesController = require("./objectives.controller");
const { checkAuth } = require("../auth/auth.middleware");

/**
 * @route GET /api/objectives/daily
 * @desc Récupérer les objectifs quotidiens de l'utilisateur
 * @access Private
 */
router.get("/daily", checkAuth, objectivesController.getUserDailyObjectives);

/**
 * @route PUT /api/objectives/:objectiveId/complete
 * @desc Marquer un objectif comme complété
 * @access Private
 */
router.put(
  "/:objectiveId/complete",
  checkAuth,
  objectivesController.completeObjective
);

module.exports = router;
