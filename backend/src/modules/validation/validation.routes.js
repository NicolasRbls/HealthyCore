const express = require("express");
const router = express.Router();
const validationController = require("./validation.controller");
const {
  validatePhysical,
  validateTargetWeight,
} = require("../../middleware/validation.middleware");
const validationValidators = require("./validation.validators");

/**
 * @route POST /api/validation/check-email
 * @desc Vérifier la disponibilité d'un email
 * @access Public
 */
router.post(
  "/check-email",
  validationValidators.validateEmailCheck,
  validationController.checkEmail
);

/**
 * @route POST /api/validation/validate-profile
 * @desc Valider les données du profil (nom, prénom, email, mot de passe)
 * @access Public
 */
router.post(
  "/validate-profile",
  validationValidators.validateProfileData,
  validationController.validateProfile
);

/**
 * @route POST /api/validation/validate-physical
 * @desc Valider les attributs physiques (genre, date de naissance, poids, taille)
 * @access Public
 */
router.post(
  "/validate-physical",
  validatePhysical, // Middleware existant du dossier middleware
  validationController.validatePhysical
);

/**
 * @route POST /api/validation/validate-target-weight
 * @desc Valider le poids cible et calculer l'estimation
 * @access Public
 */
router.post(
  "/validate-target-weight",
  validateTargetWeight, // Middleware existant du dossier middleware
  validationController.validateTargetWeight
);

module.exports = router;
