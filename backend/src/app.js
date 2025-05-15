const express = require("express");
const cors = require("cors");
const config = require("./config/config");
const errorMiddleware = require("./middleware/error.middleware");

// Import routes from modules
const authRoutes = require("./modules/auth/auth.routes");
const userRoutes = require("./modules/user/user.routes");
const dataRoutes = require("./modules/data/data.routes");
const validationRoutes = require("./modules/validation/validation.routes");

// Admin routes
const adminUserRoutes = require("./modules/admin/user/admin.user.routes");
const adminTagRoutes = require("./modules/admin/tags/admin.tag.routes");
const adminExerciseRoutes = require("./modules/admin/exercise/admin.exercise.routes");
const adminFoodsRoutes = require("./modules/admin/foods/admin.foods.routes");

// openfoodfacts routes
const openFoodFactsRoutes = require("./modules/openfoodfacts/openfoodfacts.routes");

// Initialize Express app
const app = express();

// Configure middleware
app.use(
  cors({
    origin: config.CORS_ORIGIN,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// Logger middleware
app.use((req, res, next) => {
  if (config.NODE_ENV !== "test") {
    console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
  }
  next();
});

// Configure health check
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "healthy", version: config.VERSION });
});

// Configure API routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/data", dataRoutes);
app.use("/api/validation", validationRoutes);
app.use("/api/openfoodfacts", openFoodFactsRoutes);

// Configure Admin routes
app.use("/api/admin/user", adminUserRoutes);
app.use("/api/admin/tag", adminTagRoutes);
app.use("/api/admin/exercise", adminExerciseRoutes);
app.use("/api/admin/foods", adminFoodsRoutes);


// Error handling middleware (should be last)
app.use(errorMiddleware);

module.exports = app;
