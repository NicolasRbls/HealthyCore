const express = require("express");
const adminFoodsController = require("./admin.foods.controller");
const { isAdmin } = require("../../auth/auth.middleware");

const router = express.Router();

router.get("/", isAdmin, adminFoodsController.getFoods);
router.get("/:foodId", isAdmin, adminFoodsController.getFoodById);
router.post("/", isAdmin, adminFoodsController.createFood);
router.get("/stats", isAdmin, adminFoodsController.getFoodStats);
router.put("/:foodId", isAdmin, adminFoodsController.updateFood);
router.delete("/:foodId", isAdmin, adminFoodsController.deleteFood);

module.exports = router;