const express = require("express");
const adminController = require("./admin.controller");
const { isAdmin } = require("../../middleware/auth.middleware");

const router = express.Router();

// Middleware pour vérifier si l'utilisateur est administrateur
const isAdmin = [authMiddleware.verifyToken, authMiddleware.isAdmin];

/**
 * Routes Admin
 */

// Récupérer tous les utilisateurs
router.get("/users", isAdmin, adminController.getAllUsers);

// Récupérer un utilisateur par ID
router.get("/users/:id", isAdmin, adminController.getUserById);

// Mettre à jour un utilisateur
router.put("/users/:id", isAdmin, adminController.updateUser);

// Supprimer un utilisateur
router.delete("/users/:id", isAdmin, adminController.deleteUser);

module.exports = router;