const express = require("express");
const router = express.Router();
const dataController = require("./data.controller");
const { checkAuth } = require("../auth/auth.middleware");
const programsRoutes = require("./programs/programs.routes");


/**
 * Routes publiques pour les données utilisées pendant l'inscription
 */
router.get("/sedentary-levels", dataController.getSedentaryLevels);
router.get("/nutritional-plans", dataController.getNutritionalPlans);
router.get("/diets", dataController.getDiets);
router.get("/activities", dataController.getActivities);
router.get("/weekly-sessions", dataController.getWeeklySessions);

/**
 * Routes protégées nécessitant une authentification
 */
router.get("/user-preferences", checkAuth, dataController.getUserPreferences);
router.get("/user-evolution", checkAuth, dataController.getUserEvolution);
router.use("/programs", programsRoutes);


module.exports = router;
