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
    apiResults = await this.searchFoodInOpenFoodFactsAndSave(search);
    total += apiResults.length; // Ajouter le nombre de résultats API au total
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
    total,
    totalPages
  };
}

/**
 * Recherche un aliment dans OpenFoodFacts, l'ajoute en base si trouvé
 */
const searchFoodInOpenFoodFactsAndSave = async (searchTerm) => {
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
          calories: savedFood.calories,
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

module.exports = {
    getAllFoods,
};