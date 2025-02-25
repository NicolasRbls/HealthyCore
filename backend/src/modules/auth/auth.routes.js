const express = require("express");
const router = express.Router();
const authController = require("./auth.controller");
const { checkAuth } = require("./auth.middleware");
const {
  validateRegistration,
} = require("../../middleware/validation.middleware");

/**
 * @route POST /api/auth/register
 * @desc Inscription d'un nouvel utilisateur
 * @access Public
 */
router.post("/register", validateRegistration, authController.register);

/**
 * @route POST /api/auth/login
 * @desc Connexion d'un utilisateur
 * @access Public
 */
router.post("/login", authController.login);

/**
 * @route GET /api/auth/verify-token
 * @desc Vérification de la validité d'un token JWT
 * @access Private
 */
router.get("/verify-token", checkAuth, authController.verifyToken);

/**
 * @route GET /api/auth/me
 * @desc Récupération des informations de l'utilisateur authentifié
 * @access Private
 */
router.get("/me", checkAuth, authController.getMe);

module.exports = router;
