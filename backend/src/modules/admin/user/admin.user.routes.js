const express = require("express");
const adminUserController = require("./admin.user.controller");
const { isAdmin } = require("../../auth/auth.middleware");

const router = express.Router();

/**
 * @route GET /api/admin/user/count
 * @desc Récupérer le nombre total d'utilisateurs
 * @access Private (Admin)
 */
router.get("/count", isAdmin, adminUserController.getTotalUserCount);

/**
 * @route GET /api/admin/users 
 * @desc Récupérer tous les utilisateurs avec pagination
 * @access Private (Admin)
 */
router.get("/", isAdmin, adminUserController.getAllUsers);

/**
 * @route GET /api/admin/users/:id
 * @desc Récupérer un utilisateur par son ID
 * @access Private (Admin)
 */
router.get("/:id", isAdmin, adminUserController.getUserById);

module.exports = router;