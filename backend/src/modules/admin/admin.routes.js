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
//router.get("/users/count", isAdmin, adminController.getTotalUserCount);

/**
 * @route GET /api/admin/users 
 * @desc Récupérer tous les utilisateurs avec pagination
 * @access Private (Admin)
 */
router.get("/users", adminController.getAllUsers);

/**
 * @route GET /api/admin/users/:id

 */
//router.get("/users/:id", adminController.getUserDetails);

// Mettre à jour un utilisateur
router.put("/users/:id", adminController.updateContent);

// Supprimer un utilisateur
router.delete("/users/:id", adminController.deleteUser);

module.exports = router;
