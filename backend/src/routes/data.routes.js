const express = require("express");
const router = express.Router();
const dataController = require("../controllers/data.controller");
const { checkAuth } = require("../middleware/auth.middleware");

// Routes publiques pour les données utilisées pendant l'inscription
router.get("/sedentary-levels", dataController.getSedentaryLevels);
router.get("/nutritional-plans", dataController.getNutritionalPlans);
router.get("/diets", dataController.getDiets);
router.get("/activities", dataController.getActivities);
router.get("/weekly-sessions", dataController.getWeeklySessions);

// Routes protégées nécessitant une authentification
router.get("/user-preferences", checkAuth, dataController.getUserPreferences);
router.get("/user-evolution", checkAuth, dataController.getUserEvolution);

module.exports = router;
