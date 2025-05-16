const express = require("express");
const adminTagController = require("./admin.tag.controller");
const { isAdmin } = require("../../auth/auth.middleware");

const router = express.Router();

router.get("/", isAdmin, adminTagController.getAllTags);
router.put("/:id_tag", isAdmin, adminTagController.updateTag);
router.post("/", isAdmin, adminTagController.createTag);
router.delete("/:id_tag", isAdmin, adminTagController.deleteTag);
router.get("/:id_tag", isAdmin, adminTagController.getTagById);

module.exports = router;