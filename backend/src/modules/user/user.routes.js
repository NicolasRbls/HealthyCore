const express = require("express");
const router = express.Router();
const userController = require("./user.controller");
const { checkAuth } = require("../auth/auth.middleware");


/**
 * Route to get the user's profile.
 * 
 * @route GET /profile
 * @middleware checkAuth - Middleware to verify user authentication.
 * @controller userController.getUserProfile - Controller to handle fetching the user's profile data.
 */
router.get("/profile", checkAuth, userController.getUserProfile);


module.exports = router;
