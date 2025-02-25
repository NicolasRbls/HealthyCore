const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { checkAuth } = require("../middleware/auth.middleware");
const { validateRegistration } = require("../middleware/validation.middleware");

// Routes d'authentification
router.post("/register", validateRegistration, authController.register);
router.post("/login", authController.login);
router.get("/verify-token", checkAuth, authController.verifyToken);

module.exports = router;
