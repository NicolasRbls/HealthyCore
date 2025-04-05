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

/**
* Route to get the user's badges.
* 
* @route GET /badges
* @middleware checkAuth - Middleware to verify user authentication.
* @controller userController.getBadgesController - Controller to handle fetching the user's badges data.
*/
router.get("/badges", checkAuth, userController.getBadgesController);

/**
 * Route to check the user's badges.
 * 
 * @route POST /badges/check
 * @middleware checkAuth - Middleware to verify user authentication.
 * @controller userController.checkBadgesController - Controller to handle checking the user's badges.
 */
router.post("/badges/check", checkAuth, userController.checkBadgesController);

/**
 * Route to get the user's evolution data.
 * 
 * @route GET /evolution
 * @middleware checkAuth - Middleware to verify user authentication.
 * @controller userController.getUserEvolutionController - Controller to handle fetching the user's evolution data.
 */
router.get("/evolution", checkAuth, userController.getUserEvolutionController);


module.exports = router;
