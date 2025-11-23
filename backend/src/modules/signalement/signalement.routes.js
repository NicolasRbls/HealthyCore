const express = require("express");
const router = express.Router();
const signalementController = require("./signalement.controller");
const authMiddleware = require("../auth/auth.middleware");
const { check } = require("express-validator");

// Public routes (authenticated users)
router.get(
    "/types",
    authMiddleware.checkAuth,
    signalementController.getSignalementTypes
);

router.post(
    "/",
    authMiddleware.checkAuth,
    [
        check("id_signalement").isInt().withMessage("ID signalement invalide"),
        check("id_aliment").isInt().withMessage("ID aliment invalide"),
        check("description").optional().isString(),
    ],
    signalementController.createSignalement
);

// Admin routes
router.get(
    "/",
    authMiddleware.checkAuth,
    authMiddleware.isAdmin,
    signalementController.getAllSignalements
);

router.put(
    "/:id",
    authMiddleware.checkAuth,
    authMiddleware.isAdmin,
    [check("statut").isIn(["non_revue", "traite", "ignore"])],
    signalementController.updateSignalementStatus
);

module.exports = router;
