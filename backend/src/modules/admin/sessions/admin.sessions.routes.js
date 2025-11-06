const express = require("express");
const adminSessionsController = require("./admin.sessions.controller");
const { isAdmin } = require("../../auth/auth.middleware");
const { checkAuth } = require("../../auth/auth.middleware");

const router = express.Router();

router.get("/", checkAuth, isAdmin, adminSessionsController.getAllSessions);
router.get("/:id", checkAuth, isAdmin, adminSessionsController.getSessionById);
router.post("/", checkAuth, isAdmin, adminSessionsController.createSession);
router.put(
  "/:sessionId",
  checkAuth,
  isAdmin,
  adminSessionsController.updateSession
);
router.delete(
  "/:sessionId",
  checkAuth,
  isAdmin,
  adminSessionsController.deleteSession
);

module.exports = router;
