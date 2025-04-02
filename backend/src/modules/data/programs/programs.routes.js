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

/**
 * Récupérer les séances d'un programme spécifique
 * @param {Object} req - Requête HTTP
 * @param {Object} res - Réponse HTTP
 * @param {Function} next - Fonction middleware pour passer au prochain middleware
 */
router.get("/sessions", checkAuth, programsController.getSessions);

/**
 * Récupérer les détails d'un programme spécifique
 * @param {Object} req - Requête HTTP
 * @param {Object} res - Réponse HTTP
 * @param {Function} next - Fonction middleware pour passer au prochain middleware
 */
router.get("/:programId", checkAuth, programsController.getProgramDetails);

/**
 * Démarrer un programme pour l'utilisateur
 * @param {Object} req - Requête HTTP
 * @param {Object} res - Réponse HTTP
 * @param {Function} next - Fonction middleware pour passer au prochain middleware
 */
router.post("/:programId/start", checkAuth, programsController.startProgram);


module.exports = router;
