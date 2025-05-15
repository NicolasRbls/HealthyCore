const express = require("express");
const adminFoodsController = require("./admin.foods.controller");
const { isAdmin } = require("../../auth/auth.middleware");

const router = express.Router();

router.get("/", adminFoodsController.getFoods);
router.get("/:foodId", adminFoodsController.getFoodById);
//router.get("/stats", adminFoodsController.getFoodStats);
router.post("/", adminFoodsController.createFood);
//router.put("/:foodId", adminFoodsController.updateFood);
//router.delete("/:foodId", adminFoodsController.deleteFood);

module.exports = router;