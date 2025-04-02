const express = require("express");
const router = express.Router();
const programsController = require("./programs.controller");
const { checkAuth } = require("../../auth/auth.middleware");

/**
 * Routes protégées nécessitant une authentification
 * @param {Object} req - Requête HTTP
 * @param {Object} res - Réponse HTTP
 * @param {Function} next - Fonction middleware pour passer au prochain middleware
 */
router.get("/", checkAuth, programsController.getPrograms);

module.exports = router;
