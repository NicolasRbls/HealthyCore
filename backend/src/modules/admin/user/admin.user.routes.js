const express = require("express");
const adminUserController = require("./admin.user.controller");
const { isAdmin } = require("../../auth/auth.middleware");
const { checkAuth } = require("../../auth/auth.middleware");

const router = express.Router();

/**
 * @route GET /api/admin/user/count
 * @desc Récupérer le nombre total d'utilisateurs
 * @access Private (Admin)
 */
router.get("/count", checkAuth, isAdmin, adminUserController.getTotalUserCount);

/**
 * @route GET /api/admin/users
 * @desc Récupérer tous les utilisateurs avec pagination
 * @access Private (Admin)
 */
router.get("/", checkAuth, isAdmin, adminUserController.getAllUsers);

/**
 * @route GET /api/admin/users/:id
 * @desc Récupérer un utilisateur par son ID
 * @access Private (Admin)
 */
router.get("/:id", checkAuth, isAdmin, adminUserController.getUserById);

/**
 * @route DELETE /api/admin/users/:id
 * @desc Supprimer un utilisateur par son ID
 * @access Private (Admin)
 */
router.delete("/:id", checkAuth, isAdmin, adminUserController.deleteUser);

module.exports = router;
