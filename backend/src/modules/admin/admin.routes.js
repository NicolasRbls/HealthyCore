const express = require("express");
const { getAllUsers } = require("./admin.controller");
const { isAdmin } = require("../../middleware/auth.middleware");

const router = express.Router();

router.get("/users", isAdmin, getAllUsers);

module.exports = router;