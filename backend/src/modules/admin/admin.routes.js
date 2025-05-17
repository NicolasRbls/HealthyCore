const express = require("express");
const adminController = require("./admin.controller");
const { isAdmin } = require("../auth/auth.middleware");

const router = express.Router();

// Mettre à jour un utilisateur
//router.put("/users/:id", adminController.updateContent);

// Supprimer un utilisateur
//router.delete("/users/:id", adminController.deleteUser);

module.exports = router;
