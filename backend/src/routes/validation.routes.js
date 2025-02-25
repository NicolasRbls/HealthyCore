const express = require("express");
const router = express.Router();
const validationController = require("../controllers/validation.controller");
const {
  validatePhysical,
  validateTargetWeight,
} = require("../middleware/validation.middleware");

// Routes de validation
router.post("/check-email", validationController.checkEmail);
router.post("/validate-profile", validationController.validateProfile);
router.post(
  "/validate-physical",
  validatePhysical,
  validationController.validatePhysical
);
router.post(
  "/validate-target-weight",
  validateTargetWeight,
  validationController.validateTargetWeight
);

module.exports = router;
