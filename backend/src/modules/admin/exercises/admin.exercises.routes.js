const express = require("express");
const adminExerciseController = require("./admin.exercises.controller");
const { isAdmin } = require("../../auth/auth.middleware");
const { checkAuth } = require("../../auth/auth.middleware");

const router = express.Router();

router.get("/", checkAuth, isAdmin, adminExerciseController.getAllExercises);
router.get("/:id", checkAuth, isAdmin, adminExerciseController.getExerciseById);
router.post("/", checkAuth, isAdmin, adminExerciseController.createExercise);
router.put("/:id", checkAuth, isAdmin, adminExerciseController.updateExercise);
router.delete(
  "/:id",
  checkAuth,
  isAdmin,
  adminExerciseController.deleteExercise
);

module.exports = router;
