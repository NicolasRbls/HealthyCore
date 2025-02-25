const express = require("express");
const cors = require("cors");
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require("./routes/auth.routes");
const validationRoutes = require("./routes/validation.routes");
const dataRoutes = require("./routes/data.routes");

app.use("/api/auth", authRoutes);
app.use("/api/validation", validationRoutes);
app.use("/api/data", dataRoutes);

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ message: "Server error", error: err.message });
});

module.exports = app;
