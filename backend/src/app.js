const express = require("express");
const cors = require("cors");
const config = require("./config/config");
const errorMiddleware = require("./middleware/error.middleware");

// Import routes from modules
const authRoutes = require("./modules/auth/auth.routes");
// const userRoutes = require("./modules/user/user.routes");
// const adminRoutes = require("./modules/admin/admin.routes");
const dataRoutes = require("./modules/data/data.routes");
const validationRoutes = require("./modules/validation/validation.routes");
const adminRoutes = require("./modules/admin/admin.routes");

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
// app.use("/api/user", userRoutes);
//app.use("/api/admin", adminRoutes);
app.use("/api/data", dataRoutes);
app.use("/api/validation", validationRoutes);

// Error handling middleware (should be last)
app.use(errorMiddleware);

// Admin routes
app.use("/api/admin", adminRoutes);

// Add OpenFoodFacts routes
app.use("/api/openfoodfacts", openFoodFactsRoutes);

module.exports = app;
