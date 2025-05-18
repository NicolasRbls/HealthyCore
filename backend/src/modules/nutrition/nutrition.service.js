const axios = require("axios");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const OpenFoodFactsService = require("../openfoodfacts/openfoodfacts.service");

/**
 * Service pour la gestion des aliments et du suivi nutritionnel
 */
const NutritionService = {
  /**
   * Récupère tous les aliments avec filtrage et pagination
   * @param {Object} options - Options de recherche et pagination
   * @returns {Object} Aliments filtrés et informations de pagination
   */
  async getAllFoods({
    page = 1,
    limit = 20,
    search = "",
    type = null,
    tagId = null,
    source = null,
  }) {
    try {
      // Construire les conditions de filtrage
      const where = {};

      // Recherche par nom
      if (search) {
        where.nom = {
          contains: search,
          mode: "insensitive", // Recherche insensible à la casse
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
            id_tag: parseInt(tagId),
          },
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
                    nom: true,
                  },
                },
              },
            },
          },
          orderBy: {
            nom: "asc",
          },
        }),
        prisma.aliments.count({ where }),
      ]);

      let fullTotal = total; // Total d'aliments trouvés

      // Si la recherche est active et qu'on a peu de résultats (moins de 5),
      // on essaie de chercher via l'API OpenFoodFacts
      let apiResults = [];

      if (search && foods.length < 5 && (!type || type === "produit")) {
        try {
          apiResults = await OpenFoodFactsService.searchProducts(search, 5);
          fullTotal = apiResults.length + total; // Ajouter le nombre de résultats API au total
        } catch (error) {
          console.error(
            "Erreur lors de la recherche OpenFoodFacts:",
            error.message
          );
          // Continuer avec les résultats locaux en cas d'erreur
        }
      }

      // Formatage des résultats de la base de données
      const formattedFoods = foods.map((food) => ({
        id: food.id_aliment,
        name: food.nom,
        image: food.image,
        type: food.type,
        source: food.source,
        calories: Number(food.calories),
        proteins: Number(food.proteines),
        carbs: Number(food.glucides),
        fats: Number(food.lipides),
        preparationTime: food.temps_preparation,
        barcode: food.code_barres,
        tags: food.aliments_tags.map((tag) => ({
          id: tag.tags.id_tag,
          name: tag.tags.nom,
        })),
      }));

      // Combiner les résultats locaux et API
      const allFoods = [...formattedFoods, ...apiResults];

      // Calculer le nombre total de pages
      const totalPages = Math.ceil(fullTotal / limit);

      return {
        foods: allFoods,
        total: fullTotal,
        totalPages,
      };
    } catch (error) {
      console.error(
        `Erreur lors de la récupération des aliments: ${error.message}`
      );
      throw error;
    }
  },

  /**
   * Récupère un aliment par son identifiant
   * @param {number} id - Identifiant de l'aliment
   * @returns {Object} Détails de l'aliment
   */
  async getFoodById(id) {
    try {
      const food = await prisma.aliments.findUnique({
        where: { id_aliment: Number(id) },
        include: {
          aliments_tags: {
            include: {
              tags: true,
            },
          },
        },
      });

      if (!food) {
        throw new Error(`Aliment avec ID ${id} non trouvé`);
      }

      // Formater la réponse
      return {
        id: food.id_aliment,
        name: food.nom,
        image: food.image,
        type: food.type,
        source: food.source,
        calories: Number(food.calories),
        proteins: Number(food.proteines),
        carbs: Number(food.glucides),
        fats: Number(food.lipides),
        preparationTime: food.temps_preparation,
        barcode: food.code_barres,
        ingredients: food.ingredients,
        description: food.description,
        tags: food.aliments_tags.map((tag) => ({
          id: tag.tags.id_tag,
          name: tag.tags.nom,
        })),
      };
    } catch (error) {
      console.error(
        `Erreur lors de la récupération de l'aliment: ${error.message}`
      );
      throw error;
    }
  },

  /**
   * Récupère les informations nutritionnelles de l'utilisateur
   * @param {number} userId - Identifiant de l'utilisateur
   * @returns {Object} Résumé nutritionnel
   */
  async getNutritionSummary(userId) {
    try {
      // Récupérer la préférence active de l'utilisateur
      const preference = await prisma.preferences.findFirst({
        where: { id_user: userId },
        include: {
          repartitions_nutritionnelles: true,
        },
      });

      if (!preference) {
        throw new Error(
          "Préférences nutritionnelles non définies pour cet utilisateur"
        );
      }

      // Objectifs
      const calorieGoal = Number(preference.calories_quotidiennes);
      const rep = preference.repartitions_nutritionnelles;
      const proteinGoal = Math.round(
        (calorieGoal * Number(rep.pourcentage_proteines)) / 4 / 100
      );
      const carbGoal = Math.round(
        (calorieGoal * Number(rep.pourcentage_glucides)) / 4 / 100
      );
      const fatGoal = Math.round(
        (calorieGoal * Number(rep.pourcentage_lipides)) / 9 / 100
      );

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
            lte: endOfDay,
          },
        },
        include: {
          aliments: true,
        },
      });

      // Calculer les totaux
      let caloriesConsumed = 0,
        proteins = 0,
        carbs = 0,
        fats = 0;
      for (const suivi of suivis) {
        const quantity = suivi.quantite || 1;
        const aliment = suivi.aliments;
        if (!aliment) continue;

        // Ne pas diviser par 100 pour les recettes
        if (aliment.type === "recette") {
          caloriesConsumed += Number(aliment.calories) * quantity;
          proteins += Number(aliment.proteines) * quantity;
          carbs += Number(aliment.glucides) * quantity;
          fats += Number(aliment.lipides) * quantity;
        } else {
          // Pour les produits, continuer à diviser par 100
          caloriesConsumed += (Number(aliment.calories) * quantity) / 100;
          proteins += (Number(aliment.proteines) * quantity) / 100;
          carbs += (Number(aliment.glucides) * quantity) / 100;
          fats += (Number(aliment.lipides) * quantity) / 100;
        }
      }

      // Calculer les pourcentages
      const percentCompleted = (value, goal) =>
        goal > 0 ? Math.min(100, Math.round((value / goal) * 100)) : 0;

      return {
        calorieGoal,
        caloriesConsumed: Math.round(caloriesConsumed),
        caloriesRemaining: Math.max(
          0,
          calorieGoal - Math.round(caloriesConsumed)
        ),
        percentCompleted: percentCompleted(caloriesConsumed, calorieGoal),
        macronutrients: {
          proteins: {
            goal: proteinGoal,
            consumed: Math.round(proteins),
            remaining: Math.max(0, proteinGoal - Math.round(proteins)),
            unit: "g",
            percentCompleted: percentCompleted(proteins, proteinGoal),
          },
          carbs: {
            goal: carbGoal,
            consumed: Math.round(carbs),
            remaining: Math.max(0, carbGoal - Math.round(carbs)),
            unit: "g",
            percentCompleted: percentCompleted(carbs, carbGoal),
          },
          fats: {
            goal: fatGoal,
            consumed: Math.round(fats),
            remaining: Math.max(0, fatGoal - Math.round(fats)),
            unit: "g",
            percentCompleted: percentCompleted(fats, fatGoal),
          },
        },
      };
    } catch (error) {
      console.error(
        `Erreur lors de la récupération du résumé nutritionnel: ${error.message}`
      );
      throw error;
    }
  },

  /**
   * Récupère les données nutritionnelles de la journée
   * @param {number} userId - Identifiant de l'utilisateur
   * @returns {Object} Suivi nutritionnel du jour
   */
  async getTodayNutrition(userId) {
    try {
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
            lte: endOfDay,
          },
        },
        include: {
          aliments: true,
        },
        orderBy: { id_suivi_nutritionnel: "asc" },
      });

      const meals = {};

      // Totaux
      let totalCalories = 0,
        totalProteins = 0,
        totalCarbs = 0,
        totalFats = 0;

      // Répartir les suivis par repas
      for (const suivi of suivis) {
        const mealKey = (suivi.repas || "").toLowerCase();
        const quantity = suivi.quantite || 1;

        if (!meals[mealKey]) {
          meals[mealKey] = [];
        }

        const aliment = suivi.aliments;
        if (!aliment) continue;

        let caloriesForQuantity,
          proteinsForQuantity,
          carbsForQuantity,
          fatsForQuantity;

        // Ne pas diviser par 100 pour les recettes
        if (aliment.type === "recette") {
          caloriesForQuantity = Number(aliment.calories) * quantity;
          proteinsForQuantity = Number(aliment.proteines) * quantity;
          carbsForQuantity = Number(aliment.glucides) * quantity;
          fatsForQuantity = Number(aliment.lipides) * quantity;
        } else {
          // Pour les produits, continuer à diviser par 100
          caloriesForQuantity = (Number(aliment.calories) * quantity) / 100;
          proteinsForQuantity = (Number(aliment.proteines) * quantity) / 100;
          carbsForQuantity = (Number(aliment.glucides) * quantity) / 100;
          fatsForQuantity = (Number(aliment.lipides) * quantity) / 100;
        }

        const foodData = {
          id: suivi.id_suivi_nutritionnel,
          foodId: aliment.id_aliment,
          name: aliment.nom,
          quantity: quantity,
          calories: Math.round(caloriesForQuantity),
          proteins: proteinsForQuantity,
          carbs: carbsForQuantity,
          fats: fatsForQuantity,
          image: aliment.image,
          type: aliment.type,
        };

        meals[mealKey].push(foodData);
        totalCalories += caloriesForQuantity;
        totalProteins += proteinsForQuantity;
        totalCarbs += carbsForQuantity;
        totalFats += fatsForQuantity;
      }

      return {
        date: dateStr,
        meals,
        totals: {
          calories: Math.round(totalCalories),
          proteins: Math.round(totalProteins * 10) / 10,
          carbs: Math.round(totalCarbs * 10) / 10,
          fats: Math.round(totalFats * 10) / 10,
        },
      };
    } catch (error) {
      console.error(
        `Erreur lors de la récupération du suivi nutritionnel: ${error.message}`
      );
      throw error;
    }
  },

  /**
   * Ajoute un aliment au suivi nutritionnel
   * @param {number} userId - Identifiant de l'utilisateur
   * @param {Object} data - Données du suivi nutritionnel
   * @returns {Object} Entrée nutritionnelle créée
   */
  async logNutrition(userId, { foodId, quantity, meal, date }) {
    try {
      // Vérifier que l'aliment existe
      const food = await prisma.aliments.findUnique({
        where: { id_aliment: Number(foodId) },
      });

      if (!food) {
        throw new Error("Aliment introuvable");
      }

      // Date du suivi (aujourd'hui par défaut)
      const logDate = date ? new Date(date) : new Date();

      // Créer le suivi nutritionnel
      const suivi = await prisma.suivis_nutritionnels.create({
        data: {
          id_user: userId,
          id_aliment: Number(foodId),
          quantite: quantity,
          repas: meal,
          date: logDate,
        },
      });

      // Récupérer les informations pour l'objectif calorique
      const dailyNutrition = await this.getNutritionSummary(userId);
      const calorieGoal = dailyNutrition.calorieGoal;
      const caloriesConsumed = dailyNutrition.caloriesConsumed;
      const completed =
        calorieGoal > 0 ? caloriesConsumed >= calorieGoal : false;

      return {
        nutritionEntry: {
          id: suivi.id_suivi_nutritionnel,
          food: {
            id: food.id_aliment,
            name: food.nom,
            calories: Number(food.calories),
            proteins: Number(food.proteines),
            carbs: Number(food.glucides),
            fats: Number(food.lipides),
          },
          meal,
          quantity,
          date: logDate.toISOString().slice(0, 10),
        },
        dailyObjective: {
          completed,
          calorieGoal,
          caloriesConsumed,
        },
      };
    } catch (error) {
      console.error(
        `Erreur lors de l'ajout d'un aliment au suivi: ${error.message}`
      );
      throw error;
    }
  },

  /**
   * Supprime une entrée du suivi nutritionnel
   * @param {number} userId - Identifiant de l'utilisateur
   * @param {number} entryId - Identifiant de l'entrée
   */
  async deleteNutritionEntry(userId, entryId) {
    try {
      // Vérifier que l'entrée existe et appartient à l'utilisateur
      const entry = await prisma.suivis_nutritionnels.findUnique({
        where: { id_suivi_nutritionnel: Number(entryId) },
      });

      if (!entry) {
        throw new Error("Entrée non trouvée");
      }

      if (entry.id_user !== userId) {
        throw new Error("Vous n'êtes pas autorisé à supprimer cette entrée");
      }

      await prisma.suivis_nutritionnels.delete({
        where: { id_suivi_nutritionnel: Number(entryId) },
      });
    } catch (error) {
      console.error(
        `Erreur lors de la suppression de l'entrée: ${error.message}`
      );
      throw error;
    }
  },

  /**
   * Récupère l'historique nutritionnel d'un utilisateur
   * @param {number} userId - Identifiant de l'utilisateur
   * @param {Object} options - Options de filtrage
   * @returns {Object} Historique nutritionnel
   */
  async getNutritionHistory(userId, { startDate, endDate }) {
    try {
      // Définir les dates par défaut
      const today = new Date();
      const defaultEnd = new Date(today.setHours(23, 59, 59, 999));
      const defaultStart = new Date(defaultEnd);
      defaultStart.setDate(defaultEnd.getDate() - 6); // 7 jours par défaut

      const start = startDate ? new Date(startDate) : defaultStart;
      const end = endDate ? new Date(endDate) : defaultEnd;

      // Récupérer les suivis dans la période
      const suivis = await prisma.suivis_nutritionnels.findMany({
        where: {
          id_user: userId,
          date: {
            gte: start,
            lte: end,
          },
        },
        include: { aliments: true },
        orderBy: { date: "desc" },
      });

      // Récupérer l'objectif calorique de l'utilisateur
      const preference = await prisma.preferences.findFirst({
        where: { id_user: userId },
      });
      const calorieGoal = preference
        ? Number(preference.calories_quotidiennes)
        : 0;

      // Grouper par jour
      const grouped = {};
      for (const suivi of suivis) {
        const dateStr = suivi.date.toISOString().slice(0, 10);
        if (!grouped[dateStr]) {
          grouped[dateStr] = {
            calories: 0,
            proteins: 0,
            carbs: 0,
            fats: 0,
            entries: [],
          };
        }

        const quantity = suivi.quantite || 1;
        const aliment = suivi.aliments;
        if (!aliment) continue;

        let caloriesForQuantity,
          proteinsForQuantity,
          carbsForQuantity,
          fatsForQuantity;

        // Ne pas diviser par 100 pour les recettes
        if (aliment.type === "recette") {
          caloriesForQuantity = Number(aliment.calories) * quantity;
          proteinsForQuantity = Number(aliment.proteines) * quantity;
          carbsForQuantity = Number(aliment.glucides) * quantity;
          fatsForQuantity = Number(aliment.lipides) * quantity;
        } else {
          // Pour les produits, continuer à diviser par 100
          caloriesForQuantity = (Number(aliment.calories) * quantity) / 100;
          proteinsForQuantity = (Number(aliment.proteines) * quantity) / 100;
          carbsForQuantity = (Number(aliment.glucides) * quantity) / 100;
          fatsForQuantity = (Number(aliment.lipides) * quantity) / 100;
        }

        grouped[dateStr].calories += caloriesForQuantity;
        grouped[dateStr].proteins += proteinsForQuantity;
        grouped[dateStr].carbs += carbsForQuantity;
        grouped[dateStr].fats += fatsForQuantity;

        // Ajouter l'entrée pour référence avec le type d'aliment
        grouped[dateStr].entries.push({
          id: suivi.id_suivi_nutritionnel,
          foodId: aliment.id_aliment,
          name: aliment.nom,
          meal: suivi.repas,
          quantity: quantity,
          calories: Math.round(caloriesForQuantity),
          type: aliment.type, // Ajout du type d'aliment
        });
      }

      // Formater l'historique
      const history = Object.entries(grouped)
        .sort((a, b) => b[0].localeCompare(a[0])) // du plus récent au plus ancien
        .map(([date, vals]) => ({
          date,
          calories: Math.round(vals.calories),
          proteins: Math.round(vals.proteins * 10) / 10,
          carbs: Math.round(vals.carbs * 10) / 10,
          fats: Math.round(vals.fats * 10) / 10,
          goalCompleted: calorieGoal > 0 ? vals.calories >= calorieGoal : false,
          entries: vals.entries,
        }));

      return {
        history,
        summary: {
          totalDays: history.length,
          daysCompleted: history.filter((day) => day.goalCompleted).length,
          calorieGoal,
        },
      };
    } catch (error) {
      console.error(
        `Erreur lors de la récupération de l'historique: ${error.message}`
      );
      throw error;
    }
  },
};

module.exports = NutritionService;
