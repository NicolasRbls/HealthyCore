const express = require("express");
const adminExerciseController = require("./admin.exercises.controller");
const { isAdmin } = require("../../auth/auth.middleware");

const router = express.Router();

router.get("/", isAdmin, adminExerciseController.getAllExercises);
router.get("/:id", isAdmin, adminExerciseController.getExerciseById);
router.post("/", isAdmin, adminExerciseController.createExercise);
router.put("/:id", isAdmin, adminExerciseController.updateExercise);
router.delete("/:id", isAdmin, adminExerciseController.deleteExercise);

module.exports = router;