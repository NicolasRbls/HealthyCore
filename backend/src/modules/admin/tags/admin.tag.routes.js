const express = require("express");
const adminTagController = require("./admin.tag.controller");
const { isAdmin } = require("../../auth/auth.middleware");

const router = express.Router();

router.get("/", adminTagController.getAllTags);
router.put("/:id_tag", adminTagController.updateTag);
router.post("/", adminTagController.createTag);
router.delete("/:id_tag", adminTagController.deleteTag);
router.get("/:id_tag", adminTagController.getTagById);

module.exports = router;