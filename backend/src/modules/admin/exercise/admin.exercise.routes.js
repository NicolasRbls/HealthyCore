const express = require("express");
const adminExerciseController = require("./admin.exercise.controller");
const { isAdmin } = require("../../auth/auth.middleware");

const router = express.Router();



module.exports = router;
