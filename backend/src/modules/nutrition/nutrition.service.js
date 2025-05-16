const axios = require('axios');
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();


/**
 * Récupère tous les aliments avec filtrage et pagination
 */
const getAllFoods = async ({
  page = 1,
  limit = 20,
  search = '',
  type = null,
  tagId = null,
  source = null
}) => {
  // Construire les conditions de filtrage
  const where = {};
  
  // Recherche par nom
  if (search) {
    where.nom = {
      contains: search,
      mode: 'insensitive'  // Recherche insensible à la casse
    };
  }
  
  // Filtrage par type (produit ou recette)
  if (type) {
    where.type = type;
  }
  
  // Filtrage par source
  if (source) {
    where.source = source;
  }
  
  // Filtrage par tag
  if (tagId) {
    where.aliments_tags = {
      some: {
        id_tag: parseInt(tagId)
      }
    };
  }
  
  // Calcul de l'offset pour la pagination
  const skip = (page - 1) * limit;
  
  // Effectuer la requête avec compte total
  const [foods, total] = await Promise.all([
    prisma.aliments.findMany({
      where,
      skip,
      take: limit,
      select: {
        id_aliment: true,
        nom: true,
        image: true,
        type: true,
        source: true,
        calories: true,
        proteines: true,
        glucides: true,
        lipides: true,
        temps_preparation: true,
        code_barres: true,
        aliments_tags: {
          select: {
            tags: {
              select: {
                id_tag: true,
                nom: true
              }
            }
          }
        }
      },
      orderBy: {
        nom: 'asc'
      }
    }),
    prisma.aliments.count({ where })
  ]);
  
  // Si la recherche est active et qu'aucun résultat n'est trouvé, 
  // on essaie de chercher via l'API OpenFoodFacts
  let apiResults = [];
  
  if (search && foods.length === 0 && (!type || type === 'produit')) {
    apiResults = await searchFoodInOpenFoodFactsAndSave(search);
    fullTotal = apiResults.length+total; // Ajouter le nombre de résultats API au total
  }
  
  // Formatage des résultats
  const formattedFoods = [
    ...foods.map(food => ({
      id: food.id_aliment,
      name: food.nom,
      image: food.image,
      type: food.type,
      source: food.source,
      calories: food.calories,
      proteins: Number(food.proteines),
      carbs: Number(food.glucides),
      fats: Number(food.lipides),
      preparationTime: food.temps_preparation,
      barcode: food.code_barres,
      tags: food.aliments_tags.map(tag => ({
        id: tag.tags.id_tag,
        name: tag.tags.nom
      }))
    })),
    ...apiResults // Ajout des résultats de l'API si présents
  ];
  
  // Calculer le nombre total de pages
  const totalPages = Math.ceil(total / limit);
  
  return {
    foods: formattedFoods,
    fullTotal,
    totalPages
  };
}

/**
 * Recherche un aliment dans OpenFoodFacts, l'ajoute en base si trouvé
 */
const searchFoodInOpenFoodFactsAndSave = async (searchTerm) => {
  console.log(searchTerm);
  try {
    // Recherche par nom dans OpenFoodFacts
    const response = await axios.get(`https://world.openfoodfacts.org/cgi/search.pl`, {
      params: {
        search_terms: searchTerm,
        search_simple: 1,
        action: 'process',
        json: 1,
        page_size: 5 // Limiter à 5 résultats
      }
    });
    
    if (!response.data.products || response.data.products.length === 0) {
      return [];
    }
    
    // Transformer et sauvegarder les résultats
    const savedProducts = [];
    
    for (const product of response.data.products) {
      // Extraire les données nutritionnelles
      const nutrients = product.nutriments || {};
      
      // Créer l'objet aliment
      const newFood = {
        nom: product.product_name || searchTerm,
        image: product.image_url || null,
        source: 'api',
        type: 'produit',
        ingredients: product.ingredients_text || null,
        description: product.generic_name || null,
        calories: nutrients['energy-kcal_100g'] || nutrients['energy_100g'] || 0,
        proteines: nutrients.proteins_100g || 0,
        glucides: nutrients.carbohydrates_100g || 0,
        lipides: nutrients.fat_100g || 0,
        code_barres: product.code || null,
        temps_preparation: 0, // N/A pour les produits
      };
      
      // Vérifier si l'aliment avec ce code-barres existe déjà
      let existingFood = null;
      if (newFood.code_barres) {
        existingFood = await prisma.aliments.findFirst({
          where: { code_barres: newFood.code_barres }
        });
      }
      
      // Si l'aliment n'existe pas encore, l'ajouter à la base
      if (!existingFood) {
        const savedFood = await prisma.aliments.create({
          data: newFood
        });
        
        // Ajouter un tag "OpenFoodFacts" si disponible
        const openFoodFactsTag = await prisma.tags.findFirst({
          where: { nom: 'OpenFoodFacts' }
        });
        
        if (openFoodFactsTag) {
          await prisma.aliments_tags.create({
            data: {
              id_aliment: savedFood.id_aliment,
              id_tag: openFoodFactsTag.id_tag
            }
          });
        }
        
        // Formater le résultat pour correspondre au format de réponse
        savedProducts.push({
          id: savedFood.id_aliment,
          name: savedFood.nom,
          image: savedFood.image,
          type: savedFood.type,
          source: savedFood.source,
          calories: Number(savedFood.calories),
          proteins: Number(savedFood.proteines),
          carbs: Number(savedFood.glucides),
          fats: Number(savedFood.lipides),
          preparationTime: savedFood.temps_preparation,
          barcode: savedFood.code_barres,
          tags: openFoodFactsTag ? [{ id: openFoodFactsTag.id_tag, name: 'OpenFoodFacts' }] : []
        });
      } else {
        // Si l'aliment existe déjà, l'ajouter aux résultats
        savedProducts.push({
          id: existingFood.id_aliment,
          name: existingFood.nom,
          image: existingFood.image,
          type: existingFood.type,
          source: existingFood.source,
          calories: existingFood.calories,
          proteins: Number(existingFood.proteines),
          carbs: Number(existingFood.glucides),
          fats: Number(existingFood.lipides),
          preparationTime: existingFood.temps_preparation,
          barcode: existingFood.code_barres,
          tags: [] // Il faudrait ici récupérer les tags existants
        });
      }
    }
    
    return savedProducts;
    
  } catch (error) {
    console.error('Erreur lors de la recherche OpenFoodFacts:', error);
    return []; // En cas d'erreur, retourner un tableau vide
  }
}

const getNutritionSummary = async (userId) => {
  // Récupérer la préférence active de l'utilisateur (supposé 1 seule active)
  const preference = await prisma.preferences.findFirst({
    where: { id_user: userId },
    include: {
      repartitions_nutritionnelles: true
    }
  });

  if (!preference) {
    throw new Error('Préférences nutritionnelles non définies pour cet utilisateur');
  }

  // Objectifs
  const calorieGoal = Number(preference.calories_quotidiennes);
  const rep = preference.repartitions_nutritionnelles;
  const proteinGoal = Math.round(calorieGoal * Number(rep.pourcentage_proteines) / 4 / 100);
  const carbGoal = Math.round(calorieGoal * Number(rep.pourcentage_glucides) / 4 / 100);
  const fatGoal = Math.round(calorieGoal * Number(rep.pourcentage_lipides) / 9 / 100);

  // Début et fin de la journée
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  // Récupérer les suivis nutritionnels du jour
  const suivis = await prisma.suivis_nutritionnels.findMany({
    where: {
      id_user: userId,
      date: {
        gte: startOfDay,
        lte: endOfDay
      }
    },
    include: {
      aliments: true
    }
  });

  // Calcul des totaux consommés
  let caloriesConsumed = 0, proteins = 0, carbs = 0, fats = 0;
  for (const suivi of suivis) {
    const q = suivi.quantite || 1;
    const alim = suivi.aliments;
    if (!alim) continue;
    caloriesConsumed += Number(alim.calories) * q;
    proteins += Number(alim.proteines) * q;
    carbs += Number(alim.glucides) * q;
    fats += Number(alim.lipides) * q;
  }

  // Pourcentages
  const percentCompleted = (value, goal) => goal > 0 ? Math.round((value / goal) * 100) : 0;

  return {
    calorieGoal,
    caloriesConsumed,
    caloriesRemaining: calorieGoal - caloriesConsumed,
    percentCompleted: percentCompleted(caloriesConsumed, calorieGoal),
    macronutrients: {
      proteins: {
        goal: proteinGoal,
        consumed: Math.round(proteins),
        unit: "g",
        percentCompleted: percentCompleted(proteins, proteinGoal)
      },
      carbs: {
        goal: carbGoal,
        consumed: Math.round(carbs),
        unit: "g",
        percentCompleted: percentCompleted(carbs, carbGoal)
      },
      fats: {
        goal: fatGoal,
        consumed: Math.round(fats),
        unit: "g",
        percentCompleted: percentCompleted(fats, fatGoal)
      }
    }
  };
};

const getTodayNutrition = async (userId) => {
  // Début et fin de la journée
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10);
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  // Récupérer tous les suivis nutritionnels du jour
  const suivis = await prisma.suivis_nutritionnels.findMany({
    where: {
      id_user: userId,
      date: {
        gte: startOfDay,
        lte: endOfDay
      }
    },
    include: {
      aliments: true
    },
    orderBy: { id_suivi_nutritionnel: 'asc' }
  });

  const meals = {};

  // Totaux
  let totalCalories = 0, totalProteins = 0, totalCarbs = 0, totalFats = 0;

  // Répartir les suivis par repas
  for (const suivi of suivis) {
    const mealKey = (suivi.repas || '').toLowerCase();

    const quantity = suivi.quantite || 1;

    for (alim in suivi.aliments) {
      if (!meals[mealKey]) {
        meals[mealKey] = [];
      }
      const foodData = {
        id: suivi.id_suivi_nutritionnel,
        foodId: alim.id_aliment,
        name: alim.nom,
        quantity: quantity,
        calories: Math.round(Number(alim.calories) * quantity / 100),
        proteins: Number(alim.proteines) * quantity / 100,
        carbs: Number(alim.glucides) * quantity / 100,
        fats: Number(alim.lipides) * quantity / 100,
        image: alim.image
      };
      meals[mealKey].push(foodData);
      totalCalories += foodData.calories;
      totalProteins += foodData.proteins;
      totalCarbs += foodData.carbs;
      totalFats += foodData.fats;
    }
  }

  return {
    date: dateStr,
    meals,
    totals: {
      calories: Math.round(totalCalories),
      proteins: Math.round(totalProteins * 10) / 10,
      carbs: Math.round(totalCarbs * 10) / 10,
      fats: Math.round(totalFats * 10) / 10
    }
  };
};

module.exports = {
  getAllFoods,
  getNutritionSummary,
  getTodayNutrition
};