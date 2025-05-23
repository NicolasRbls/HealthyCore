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

/**
 * Route to add a new evolution entry for the user.
 * 
 * @route POST /evolution
 * @middleware checkAuth - Middleware to verify user authentication.
 * @controller userController.addEvolutionController - Controller to handle adding a new evolution entry for the user.
 */
router.post("/evolution", checkAuth, userController.addEvolutionController);

/**
 * Route to get the user's progress statistics.
 * 
 * @route GET /progress/stats
 * @middleware checkAuth - Middleware to verify user authentication.
 * @controller userController.getProgressStatsController - Controller to handle fetching the user's progress statistics.
 */
router.get("/progress/stats", checkAuth, userController.getProgressStatsController);

/**
 * Route to edit the user's data.
 * 
 * @route GET /progress
 * @middleware checkAuth - Middleware to verify user authentication.
 * @controller userController.getProgressController - Controller to handle fetching the user's progress data.
 */
router.put("/edit-profile", checkAuth, userController.updateUserProfile);

/**
 * Route to edit the user's preferences.
 * 
 * @route GET /preferences
 * @middleware checkAuth - Middleware to verify user authentication.
 * @controller userController.getPreferencesController - Controller to handle fetching the user's preferences data.
 */
router.put("/edit-preferences", checkAuth, userController.updatePreferencesController);

/**
 * Route to get the user's weight update status.
 * 
 * @route GET /weight-update-status
 * @middleware checkAuth - Middleware to verify user authentication.
 * @controller userController.getWeightUpdateStatusController - Controller to handle fetching the user's weight update status.
 */
router.get("/weight-update-status", checkAuth, userController.getWeightUpdateStatusController);

module.exports = router;
