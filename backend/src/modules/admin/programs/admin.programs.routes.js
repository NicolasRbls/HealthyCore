const express = require("express");
const adminProgramsController = require("./admin.programs.controller");
const { isAdmin } = require("../../auth/auth.middleware");
const { checkAuth } = require("../../auth/auth.middleware");

const router = express.Router();

router.get("/", checkAuth, isAdmin, adminProgramsController.getAllPrograms);
router.get(
  "/:programId",
  checkAuth,
  isAdmin,
  adminProgramsController.getProgramById
);
router.post("/", checkAuth, isAdmin, adminProgramsController.createProgram);
router.put(
  "/:programId",
  checkAuth,
  isAdmin,
  adminProgramsController.updateProgram
);
router.delete(
  "/:programId",
  checkAuth,
  isAdmin,
  adminProgramsController.deleteProgram
);

module.exports = router;
