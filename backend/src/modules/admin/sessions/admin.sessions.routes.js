const express = require("express");
const adminSessionsController = require("./admin.sessions.controller");
const { isAdmin } = require("../../auth/auth.middleware");

const router = express.Router();

router.get("/", isAdmin, adminSessionsController.getAllSessions);
router.get("/:id", isAdmin, adminSessionsController.getSessionById);
router.post("/", isAdmin, adminSessionsController.createSession);
router.put("/:sessionId", isAdmin, adminSessionsController.updateSession);
router.delete("/:sessionId", isAdmin, adminSessionsController.deleteSession);

module.exports = router;