const express = require("express");
const router = express.Router();
const programsController = require("./programs.controller");
const { checkAuth } = require("../../auth/auth.middleware");

/**
 * @route GET /api/data/programs/active
 * @desc Récupérer les programmes actifs de l'utilisateur
 * @access Private (Nécessite une authentification)
 */
router.get("/active", checkAuth, programsController.getActivePrograms);

/**
 * @route POST /api/data/programs/enroll
 * @desc Inscrire un utilisateur à un programme d'entraînement
 * @access Private (Nécessite une authentification)
 */
router.post("/enroll", checkAuth, programsController.enrollProgram);

module.exports = router;
