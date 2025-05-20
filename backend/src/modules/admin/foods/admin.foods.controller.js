const adminFoodsService = require("./admin.foods.service");
const { catchAsync } = require("../../../utils/catcherror.utils");
const { AppError } = require("../../../utils/response.utils");

const validTypes = ["produit", "recette"];
const validSources = ["user", "admin", "api"];
const numberedvalues = [
  "calories",
  "proteines",
  "glucides",
  "lipides",
  "temps_preparation",
];

exports.getFoods = catchAsync(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.max(1, parseInt(req.query.limit) || 20);
  const search = req.query.search?.trim() || undefined;
  const type = req.query.type?.trim() || undefined;
  const source = req.query.source?.trim() || undefined;
  const tagId = req.query.tagId ? parseInt(req.query.tagId) : undefined;

  if (type && !validTypes.includes(type)) {
    throw new AppError("Type d'aliment invalide", 400, "INVALID_FOOD_TYPE");
  }
  if (source && !validSources.includes(source)) {
    throw new AppError("Source d'aliment invalide", 400, "INVALID_FOOD_SOURCE");
  }
  if (tagId !== undefined && isNaN(tagId)) {
    throw new AppError("L'id du tag est invalide", 400, "INVALID_TAG_ID");
  }

  resFoods = await adminFoodsService.getAllFoods({
    page,
    limit,
    search,
    type,
    source,
    tagId,
  });
  if (!resFoods.foods || resFoods.foods.length === 0) {
    throw new AppError("Aucun aliment trouvé", 404, "FOOD_NOT_FOUND");
  }

  res.status(200).json({
    status: "success",
    data: {
      foods: resFoods.foods,
      pagination: {
        currentPage: page,
        limit,
        total: resFoods.fullTotal,
        totalPages: resFoods.totalPages,
      },
    },
    message: "Liste des aliments récupérée avec succès",
  });
});

exports.getFoodById = catchAsync(async (req, res) => {
  const foodId = parseInt(req.params.foodId);
  if (!foodId || isNaN(foodId)) {
    throw new AppError(
      "L'id de l'aliment est invalide",
      400,
      "INVALID_FOOD_ID"
    );
  }

  const food = await adminFoodsService.getFoodById(foodId);
  if (!food.id) {
    throw new AppError("Aliment non trouvé", 404, "FOOD_NOT_FOUND");
  }

  res.status(200).json({
    status: "success",
    data: food,
    message: "Aliment récupéré avec succès",
  });
});

exports.createFood = catchAsync(async (req, res) => {
  const aliment = req.method === "POST" ? req.body : req.query;

  // Gérer les tags correctement
  if (req.method === "POST" && aliment.tagIds) {
    aliment.tags = aliment.tagIds.join("-");
  } else if (aliment.tags && typeof aliment.tags === "string") {
    aliment.tags = aliment.tags.split("-").map((tag) => parseInt(tag));
  }

  if (
    aliment.tags &&
    aliment.tags.length > 0 &&
    typeof aliment.tags === "string"
  ) {
    aliment.tags = aliment.tags.split("-").map((tag) => parseInt(tag)) || [];
  }

  if (!aliment.userId) {
    throw new AppError(
      "L'id de l'utilisateur est requis",
      400,
      "MISSING_USER_ID"
    );
  }

  if (aliment.type == "produit" && !aliment.barcode) {
    throw new AppError(
      "Le code-barres est requis pour les aliments",
      400,
      "MISSING_BARCODE"
    );
  }

  if (!aliment.name || !aliment.type) {
    throw new AppError(
      "Nom et type de l'aliment sont requis",
      400,
      "MISSING_FOOD_INFO"
    );
  }

  if (aliment.type && !validTypes.includes(aliment.type)) {
    throw new AppError("Type d'aliment invalide", 400, "INVALID_FOOD_TYPE");
  }

  const food = await adminFoodsService.createFood({
    aliment,
  });

  if (food === "EXISTING_FOOD") {
    throw new AppError("L'aliment existe déjà", 409, "EXISTING_FOOD");
  }

  if (!food) {
    throw new AppError(
      "Erreur lors de la création de l'aliment",
      500,
      "FOOD_CREATION_ERROR"
    );
  }

  res.status(201).json({
    status: "success",
    data: food,
    message: "Aliment créé avec succès",
  });
});

exports.updateFood = catchAsync(async (req, res) => {
  const foodId = parseInt(req.params.foodId);

  const foodData = Object.keys(req.body).length > 0 ? req.body : req.query;

  if (!foodId || isNaN(foodId)) {
    throw new AppError(
      "L'id de l'aliment est invalide",
      400,
      "INVALID_FOOD_ID"
    );
  }

  if (!foodData || Object.keys(foodData).length === 0) {
    throw new AppError(
      "Les données de l'aliment sont requises",
      400,
      "MISSING_FOOD_DATA"
    );
  }

  // Formattage des types
  for (const key in foodData) {
    if (numberedvalues.includes(key)) {
      if (foodData[key] === "calories") {
        foodData[key] = parseInt(foodData[key]);
      } else {
        foodData[key] = parseFloat(foodData[key]);
      }
    }
  }
  const updatedFood = await adminFoodsService.updateFood(foodId, foodData);
  if (!updatedFood) {
    throw new AppError(
      "Erreur lors de la mise à jour de l'aliment",
      500,
      "FOOD_UPDATE_ERROR"
    );
  }

  // Formater la réponse pour le front-end
  const formattedFood = {
    id: updatedFood.id_aliment,
    name: updatedFood.nom,
    image: updatedFood.image,
    type: updatedFood.type,
    source: updatedFood.source,
    calories: updatedFood.calories,
    proteins: updatedFood.proteines,
    carbs: updatedFood.glucides,
    fats: updatedFood.lipides,
    preparationTime: updatedFood.temps_preparation,
    barcode: updatedFood.code_barres,
    ingredients: updatedFood.ingredients,
    description: updatedFood.description,
    tags: updatedFood.aliments_tags
      ? updatedFood.aliments_tags.map((relation) => ({
          id: relation.tags.id_tag,
          name: relation.tags.nom,
        }))
      : [],
  };

  res.status(200).json({
    status: "success",
    data: formattedFood,
    message: "Aliment mis à jour avec succès",
  });
});

exports.deleteFood = catchAsync(async (req, res) => {
  const foodId = parseInt(req.params.foodId);
  if (!foodId || isNaN(foodId)) {
    throw new AppError(
      "L'id de l'aliment est invalide",
      400,
      "INVALID_FOOD_ID"
    );
  }

  const deletedFood = await adminFoodsService.deleteFood(foodId);
  if (!deletedFood) {
    throw new AppError(
      "Erreur lors de la suppression de l'aliment",
      500,
      "FOOD_DELETION_ERROR"
    );
  }

  res.status(200).json({
    status: "success",
    data: deletedFood,
    message: "Aliment supprimé avec succès",
  });
});

exports.getFoodStats = catchAsync(async (req, res) => {
  const stats = await adminFoodsService.getFoodStats();
  if (!stats) {
    throw new AppError(
      "Erreur lors de la récupération des statistiques",
      500,
      "FOOD_STATS_ERROR"
    );
  }

  res.status(200).json({
    status: "success",
    data: stats,
    message: "Statistiques des aliments récupérées avec succès",
  });
});
