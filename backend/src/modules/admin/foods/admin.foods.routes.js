const express = require("express");
const adminFoodsController = require("./admin.foods.controller");
const { isAdmin } = require("../../auth/auth.middleware");
const { checkAuth } = require("../../auth/auth.middleware");

const router = express.Router();

router.get("/stats", checkAuth, isAdmin, adminFoodsController.getFoodStats);
router.get("/", checkAuth, isAdmin, adminFoodsController.getFoods);
router.post("/", checkAuth, isAdmin, adminFoodsController.createFood);

router.get("/:foodId", checkAuth, isAdmin, adminFoodsController.getFoodById);
router.put("/:foodId", checkAuth, isAdmin, adminFoodsController.updateFood);
router.delete("/:foodId", checkAuth, isAdmin, adminFoodsController.deleteFood);

module.exports = router;
