const express = require("express");
const router = express.Router();
const validationController = require("./validation.controller");
const {
  validatePhysical,
  validateTargetWeight,
} = require("../../middleware/validation.middleware");
const validationValidators = require("./validation.validators");

/**
 * @swagger
 * tags:
 *   name: Validation
 *   description: Input validation endpoints
 */

/**
 * @swagger
 * /api/validation/check-email:
 *   post:
 *     summary: Check email availability
 *     tags: [Validation]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email is available
 *       400:
 *         description: Email already exists or invalid
 */
router.post(
  "/check-email",
  validationValidators.validateEmailCheck,
  validationController.checkEmail
);

/**
 * @swagger
 * /api/validation/validate-profile:
 *   post:
 *     summary: Validate profile data
 *     tags: [Validation]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile data is valid
 *       400:
 *         description: Validation error
 */
router.post(
  "/validate-profile",
  validationValidators.validateProfileData,
  validationController.validateProfile
);

/**
 * @swagger
 * /api/validation/validate-physical:
 *   post:
 *     summary: Validate physical attributes
 *     tags: [Validation]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - gender
 *               - birthDate
 *               - weight
 *               - height
 *             properties:
 *               gender:
 *                 type: string
 *               birthDate:
 *                 type: string
 *                 format: date
 *               weight:
 *                 type: number
 *               height:
 *                 type: number
 *     responses:
 *       200:
 *         description: Physical attributes are valid
 *       400:
 *         description: Validation error
 */
router.post(
  "/validate-physical",
  validatePhysical, // Middleware existant du dossier middleware
  validationController.validatePhysical
);

/**
 * @swagger
 * /api/validation/validate-target-weight:
 *   post:
 *     summary: Validate target weight
 *     tags: [Validation]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - targetWeight
 *               - currentWeight
 *               - height
 *             properties:
 *               targetWeight:
 *                 type: number
 *               currentWeight:
 *                 type: number
 *               height:
 *                 type: number
 *     responses:
 *       200:
 *         description: Target weight is valid
 *       400:
 *         description: Validation error
 */
router.post(
  "/validate-target-weight",
  validateTargetWeight, // Middleware existant du dossier middleware
  validationController.validateTargetWeight
);

module.exports = router;
