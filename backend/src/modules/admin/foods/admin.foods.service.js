const axios = require('axios');
const { PrismaClient } = require("@prisma/client");
const { get } = require('lodash');
const prisma = new PrismaClient();

const numberedvalues = ['calories', 'proteines', 'glucides', 'lipides', 'temps_preparation'];

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
    })),// Ajout des résultats de l'API si présents
  ];
  
  const totalPages = Math.ceil(total / limit);

  return {
    foods: formattedFoods,
    fullTotal: total,
    totalPages
  };
}

const getFoodById = async (foodId) => {
  const aliment = await prisma.aliments.findUnique({
    where: { id_aliment: foodId },
    include: {
      users: {
        select: { id_user: true, prenom: true, nom: true }
      },
      aliments_tags: {
        select: {
          tags: { select: { id_tag: true, nom: true } }
        }
      }
    }
  })

  const nutritionalFollowUps = await prisma.suivis_nutritionnels.count({
    where: { id_aliment: foodId }
  })

  const totalRatings = await prisma.evaluations_recettes.count({
    where: { id_aliment: foodId }
  })

  return {
    id: aliment.id_aliment,
    name: aliment.nom,
    image: aliment.image,
    type: aliment.type,
    source: aliment.source,
    creator: {
      id: aliment.users.id_user,
      name: `${aliment.users.prenom} ${aliment.users.nom}`
    },
    calories: aliment.calories,
    proteins: parseFloat(aliment.proteines.toString()),
    carbs: parseFloat(aliment.glucides.toString()),
    fats: parseFloat(aliment.lipides.toString()),
    barcode: aliment.code_barres,
    preparationTime: aliment.temps_preparation,
    description: aliment.description,
    ingredients: aliment.ingredients,
    tags: aliment.aliments_tags.map(at => ({
      id: at.tags.id_tag,
      name: at.tags.nom
    })),
    usageStats: {
      nutritionalFollowUps,
      ratings: {
        total: totalRatings,
      }
    }
  }
}

const createFood = async (foodData) => {
  const newAliment = foodData.aliment;
  const tagsAdded = newAliment.tags || [];

  if (newAliment.type == 'produit') {
    const existingFood = await prisma.aliments.findFirst({
      where: { code_barres: newAliment.barcode}
    });

    if (existingFood) {
      return "EXISTING_FOOD";
    }
  
  }

  // Création de l'aliment
  const newFood = await prisma.aliments.create({
    data: {
      nom: newAliment.name,
      type: newAliment.type,
      source: "admin",
      image: newAliment.image || "",
      calories: newAliment.calories || 0,
      proteines: newAliment.proteins || 0,
      glucides: newAliment.carbs || 0,
      lipides: newAliment.fats || 0,
      description: newAliment.description || null,
      ingredients: newAliment.ingredients || null,
      temps_preparation: newAliment.preparationTime || 0,
      code_barres: newAliment.barcode || null,
      aliments_tags: {
        create: tagsAdded.map(tagId => ({
          id_tag: tagId
        }))
      },
      id_user: parseInt(newAliment.userId)
    }
  });

  return newFood;
}

const updateFood = async (foodId, foodData) => {

  const updatedFood = await prisma.aliments.update({
    where: { id_aliment: foodId },
    data: foodData
  });

  return updatedFood;
}

const deleteFood = async (foodId) => {
  const deletedFood = await prisma.aliments.delete({
    where: { id_aliment: foodId }
  })
  await prisma.aliments_tags.deleteMany({
    where: { id_aliment: foodId }
  });
  await prisma.suivis_nutritionnels.deleteMany({
    where: { id_aliment: foodId }
  });
  return deletedFood;
}

const getFoodStats = async () => {
  const totalFoods = await prisma.aliments.count();
  const totalRecipes = await prisma.aliments.count({
    where: { type: 'recette' }
  });
  const totalProducts = await prisma.aliments.count({
    where: { type: 'produit' }
  });

  return {
    totalFoods,
    totalRecipes,
    totalProducts
  };
}

module.exports = {
    getAllFoods,
    getFoodById,
    createFood,
    updateFood,
    deleteFood,
    getFoodStats
};