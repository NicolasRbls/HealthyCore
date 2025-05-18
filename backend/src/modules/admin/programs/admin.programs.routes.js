const express = require("express");
const adminProgramsController = require("./admin.programs.controller");
const { isAdmin } = require("../../auth/auth.middleware");

const router = express.Router();

router.get("/", isAdmin, adminProgramsController.getAllPrograms);
router.get("/:programId", isAdmin, adminProgramsController.getProgramById);
router.post("/", isAdmin, adminProgramsController.createProgram);
router.put("/:programId", isAdmin, adminProgramsController.updateProgram);
router.delete("/:programId", isAdmin, adminProgramsController.deleteProgram);

module.exports = router;