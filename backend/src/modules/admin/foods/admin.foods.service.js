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

module.exports = {
    getAllFoods,
    getFoodById
};