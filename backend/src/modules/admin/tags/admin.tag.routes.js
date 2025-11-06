const express = require("express");
const adminTagController = require("./admin.tag.controller");
const { isAdmin } = require("../../auth/auth.middleware");
const { checkAuth } = require("../../auth/auth.middleware");

const router = express.Router();

router.get("/", checkAuth, isAdmin, adminTagController.getAllTags);
router.put("/:id_tag", checkAuth, isAdmin, adminTagController.updateTag);
router.post("/", checkAuth, isAdmin, adminTagController.createTag);
router.delete("/:id_tag", checkAuth, isAdmin, adminTagController.deleteTag);
router.get("/:id_tag", checkAuth, isAdmin, adminTagController.getTagById);

module.exports = router;
