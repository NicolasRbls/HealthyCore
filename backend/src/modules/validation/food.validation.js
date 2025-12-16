const { isFrenchText, validateNutritionalData } = require("../../utils/language.utils");

/**
 * Middleware de validation des données alimentaires
 */
const validateFoodData = (req, res, next) => {
  const { nom, description, ingredients, type } = req.body;

  // 1. Nom obligatoire et en français
  if (!nom || nom.trim() === "") {
    return res.status(400).json({ error: "Le nom est obligatoire" });
  }

  if (!isFrenchText(nom)) {
    return res.status(400).json({ 
      error: "Le nom doit être en français",
      value: nom 
    });
  }

  // 2. Description en français (si présente)
  if (description && description.length > 10 && !isFrenchText(description)) {
    return res.status(400).json({ 
      error: "La description doit être en français" 
    });
  }

  // 3. Ingrédients en français (si présents)
  if (ingredients && ingredients.length > 10 && !isFrenchText(ingredients)) {
    return res.status(400).json({ 
      error: "Les ingrédients doivent être en français" 
    });
  }

  // 4. Validation nutritionnelle
  if (!validateNutritionalData(req.body)) {
    return res.status(400).json({ 
      error: "Données nutritionnelles incohérentes ou invalides" 
    });
  }

  next();
};

module.exports = { validateFoodData };