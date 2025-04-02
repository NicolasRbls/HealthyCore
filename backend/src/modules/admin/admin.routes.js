const express = require("express");
const adminController = require("./admin.controller");
const { isAdmin } = require("../auth/auth.middleware");

const router = express.Router();

// Middleware pour vérifier si l'utilisateur est administrateur

/**
 * Routes Admin
 */

/**
 * @route GET /api/admin/users/count
 * @desc Récupérer le nombre total d'utilisateurs
 * @access Private (Admin)
 */
router.get("/users/count", isAdmin, adminController.getTotalUserCount);

/**
 * @route GET /api/admin/users 
 * @desc Récupérer tous les utilisateurs avec pagination
 * @access Private (Admin)
 */
router.get("/users", isAdmin, adminController.getUsers);

/**
 * @route GET /api/admin/users/:id

 */
router.get("/users/:id", isAdmin, adminController.getUserById);

// Mettre à jour un utilisateur
router.put("/users/:id", isAdmin, adminController.updateUser);

// Supprimer un utilisateur
router.delete("/users/:id", isAdmin, adminController.deleteUser);

module.exports = router;
