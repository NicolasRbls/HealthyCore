const axios = require("axios");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Service pour l'interaction avec l'API OpenFoodFacts et la gestion des produits
 */
const OpenFoodFactsService = {
  /**
   * Tronque une chaîne de caractères si elle dépasse la longueur maximale
   * @param {string} str - Chaîne à tronquer
   * @param {number} maxLength - Longueur maximale
   * @returns {string} Chaîne tronquée
   */
  truncateString(str, maxLength) {
    if (!str) return str;
    return str.length > maxLength ? str.substring(0, maxLength) : str;
  },

  /**
   * Recherche un produit par code-barres dans la base de données ou sur OpenFoodFacts
   * @param {string} barcode - Code-barres du produit
   * @returns {Object} Le produit trouvé ou créé
   */
  async getProductByBarcode(barcode) {
    try {
      // Vérifier d'abord si le produit existe déjà en base
      const existingProduct = await prisma.aliments.findFirst({
        where: { code_barres: barcode },
        include: {
          aliments_tags: {
            include: {
              tags: true,
            },
          },
        },
      });

      if (existingProduct) {
        const formattedProduct = this.formatProductResponse(existingProduct);
        return {
          status: "success",
          data: formattedProduct,
        };
      }

      try {
        const response = await axios.get(
          `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`
        );

        // Vérifier si le produit est réellement trouvé
        if (
          !response.data ||
          !response.data.product ||
          response.data.status === 0
        ) {
          // Retourner un objet avec status fail
          return { status: "fail" };
        }

        // Transformer et sauvegarder le produit
        const newProduct = await this.saveProductFromOpenFoodFacts(
          response.data.product
        );
        const formattedProduct = this.formatProductResponse(newProduct);
        return {
          status: "success",
          data: formattedProduct,
        };
      } catch (apiError) {
        // Gérer spécifiquement les erreurs 404 (produit non trouvé)
        if (apiError.response && apiError.response.status === 404) {
          return { status: "fail" };
        }

        // Pour les autres erreurs d'API, les remonter
        console.error(`Erreur API OpenFoodFacts: ${apiError.message}`);
        throw new Error(
          `Erreur lors de la communication avec OpenFoodFacts: ${apiError.message}`
        );
      }
    } catch (error) {
      console.error(
        `Erreur lors de la recherche du produit par code-barres: ${error.message}`
      );
      throw error;
    }
  },

  /**
   * Recherche des produits par terme dans OpenFoodFacts et les sauvegarde en base
   * @param {string} searchTerm - Terme de recherche
   * @returns {Array} Liste des produits trouvés
   */
  async searchProducts(searchTerm, limit = 10) {
    try {
      // Préparation des termes de recherche individuels
      const searchTerms = searchTerm
        .toLowerCase()
        .split(/\s+/)
        .filter((term) => term.length > 0);

      // Recherche en base de données plus flexible (mot par mot)
      let localProducts = [];

      if (searchTerms.length > 0) {
        // Construction de la condition OR pour chaque mot
        const whereConditions = searchTerms.map((term) => ({
          nom: {
            contains: term,
            mode: "insensitive",
          },
        }));

        localProducts = await prisma.aliments.findMany({
          where: {
            AND: [{ type: "produit" }, { OR: whereConditions }],
          },
          take: limit,
          include: {
            aliments_tags: {
              include: {
                tags: true,
              },
            },
          },
        });
      }

      // Convertir les produits locaux au format attendu
      const formattedLocalProducts = localProducts.map((product) =>
        this.formatProductResponse(product)
      );

      // Si on a assez de résultats locaux, on peut s'arrêter là
      if (formattedLocalProducts.length >= 5) {
        return formattedLocalProducts.slice(0, limit);
      }

      // Sinon, on complète avec des résultats d'OpenFoodFacts
      // Pas de vérification de nombre minimum comme avant

      try {
        const response = await axios.get(
          "https://world.openfoodfacts.org/cgi/search.pl",
          {
            params: {
              search_terms: searchTerm,
              search_simple: 1,
              action: "process",
              json: 1,
              page_size: limit - formattedLocalProducts.length, // On complète jusqu'à la limite
              tagtype_0: "countries",
              tag_contains_0: "contains",
              tag_0: "france",
            },
          }
        );

        if (!response.data.products || response.data.products.length === 0) {
          return formattedLocalProducts; // On retourne les produits locaux même s'il n'y en a pas beaucoup
        }

        // Map pour suivre les produits déjà sauvegardés par code-barres
        const savedBarcodes = new Set();

        // Sauvegarder les produits et retourner la liste formatée
        const savedProducts = [];
        for (const product of response.data.products) {
          try {
            // Vérifier si on a déjà sauvegardé un produit avec ce code-barres dans cette session
            const barcode = product.code || "";
            if (barcode && savedBarcodes.has(barcode)) {
              continue;
            }

            // Ajouter le code-barres à la liste des codes traités
            if (barcode) {
              savedBarcodes.add(barcode);
            }

            const savedProduct = await this.saveProductFromOpenFoodFacts(
              product
            );
            savedProducts.push(this.formatProductResponse(savedProduct));

            // Si on atteint la limite, on s'arrête
            if (formattedLocalProducts.length + savedProducts.length >= limit) {
              break;
            }
          } catch (saveError) {
            console.error(
              `Erreur lors de la sauvegarde d'un produit: ${saveError.message}`
            );
            // Continuer avec les autres produits même en cas d'erreur
          }
        }

        // Combiner les résultats locaux et les résultats de l'API
        const combinedResults = [...formattedLocalProducts, ...savedProducts];
        return combinedResults.slice(0, limit);
      } catch (apiError) {
        console.error(`Erreur API OpenFoodFacts: ${apiError.message}`);
        // En cas d'erreur API, retourner quand même les résultats locaux
        return formattedLocalProducts;
      }
    } catch (error) {
      console.error(
        `Erreur lors de la recherche de produits: ${error.message}`
      );
      throw error;
    }
  },

  /**
   * Sauvegarde un produit de OpenFoodFacts dans la base de données
   * @param {Object} openFoodFactsProduct - Produit récupéré de l'API OpenFoodFacts
   * @returns {Object} Le produit sauvegardé
   */
  async saveProductFromOpenFoodFacts(openFoodFactsProduct) {
    try {
      const nutrients = openFoodFactsProduct.nutriments || {};
      const productName =
        openFoodFactsProduct.product_name || "Produit sans nom";
      const brandName = openFoodFactsProduct.brands || "";
      const quantity = openFoodFactsProduct.quantity || "";

      // Formater le nom selon le format de l'application (Nom - Marque - Quantité)
      let formattedName = productName;
      if (brandName) formattedName += ` - ${brandName}`;
      if (quantity) formattedName += ` - ${quantity}`;

      // Extraire les données nutritionnelles
      const calories = Math.round(
        nutrients["energy-kcal_100g"] || nutrients.energy_value || 0
      );
      const proteins = parseFloat(nutrients.proteins_100g || 0).toFixed(1);
      const carbs = parseFloat(nutrients.carbohydrates_100g || 0).toFixed(1);
      const fats = parseFloat(nutrients.fat_100g || 0).toFixed(1);

      // Définir les tailles maximales des colonnes (à ajuster selon votre schéma de base de données)
      const MAX_NAME_LENGTH = 500;
      const MAX_IMAGE_URL_LENGTH = 500;
      const MAX_INGREDIENTS_LENGTH = 2000;
      const MAX_DESCRIPTION_LENGTH = 1000;

      // Créer l'objet produit selon le schéma prisma avec troncature des valeurs trop longues
      const newProduct = {
        nom: this.truncateString(formattedName, MAX_NAME_LENGTH),
        image: this.truncateString(
          openFoodFactsProduct.image_url,
          MAX_IMAGE_URL_LENGTH
        ),
        type: "produit",
        source: "api",
        calories: calories,
        proteines: proteins,
        glucides: carbs,
        lipides: fats,
        code_barres: openFoodFactsProduct.code || null,
        ingredients: this.truncateString(
          openFoodFactsProduct.ingredients_text,
          MAX_INGREDIENTS_LENGTH
        ),
        description: this.truncateString(
          openFoodFactsProduct.generic_name,
          MAX_DESCRIPTION_LENGTH
        ),
        temps_preparation: 0, // Non applicable pour les produits
      };

      // Vérifier si le produit existe déjà avec ce code-barres
      let existingProduct = null;
      if (newProduct.code_barres) {
        existingProduct = await prisma.aliments.findFirst({
          where: { code_barres: newProduct.code_barres },
        });
      }

      // Si le produit existe déjà, le mettre à jour
      if (existingProduct) {
        const updatedProduct = await prisma.aliments.update({
          where: { id_aliment: existingProduct.id_aliment },
          data: newProduct,
        });
        return updatedProduct;
      }

      // Sinon, créer un nouveau produit
      const savedProduct = await prisma.aliments.create({
        data: newProduct,
      });

      // Ajouter des tags pertinents
      if (
        openFoodFactsProduct.categories_tags &&
        openFoodFactsProduct.categories_tags.length > 0
      ) {
        await this.addTagsToProduct(
          savedProduct.id_aliment,
          openFoodFactsProduct.categories_tags
        );
      }

      // Récupérer le produit complet avec ses tags
      return await prisma.aliments.findUnique({
        where: { id_aliment: savedProduct.id_aliment },
        include: {
          aliments_tags: {
            include: {
              tags: true,
            },
          },
        },
      });
    } catch (error) {
      console.error(
        `Erreur lors de la sauvegarde du produit: ${error.message}`
      );
      throw error;
    }
  },

  /**
   * Ajoute des tags à un produit à partir des catégories OpenFoodFacts
   * @param {number} productId - ID de l'aliment
   * @param {Array} categoryTags - Liste des tags de catégories OpenFoodFacts
   */
  async addTagsToProduct(productId, categoryTags) {
    try {
      // Définir la taille maximale pour les noms de tags
      const MAX_TAG_LENGTH = 50;

      // Filtrer et limiter les catégories (prendre les 5 premières pertinentes)
      const filteredCategories = categoryTags
        .filter((tag) => !tag.includes(":") && tag.length < 30)
        .map((tag) => tag.replace("en:", "").replace("fr:", ""))
        .slice(0, 5);

      // Pour chaque catégorie, créer ou récupérer le tag et l'associer au produit
      for (const category of filteredCategories) {
        // Tronquer le nom du tag si nécessaire
        const tagName = this.truncateString(
          category.toLowerCase().replace(/_/g, "-"),
          MAX_TAG_LENGTH
        );

        // Vérifier si le tag existe déjà
        let tag = await prisma.tags.findFirst({
          where: { nom: tagName },
        });

        // Si le tag n'existe pas, le créer
        if (!tag) {
          tag = await prisma.tags.create({
            data: {
              nom: tagName,
              type: "aliment",
            },
          });
        }

        // Associer le tag au produit (éviter les doublons)
        const existingAssociation = await prisma.aliments_tags.findFirst({
          where: {
            id_aliment: productId,
            id_tag: tag.id_tag,
          },
        });

        if (!existingAssociation) {
          await prisma.aliments_tags.create({
            data: {
              id_aliment: productId,
              id_tag: tag.id_tag,
            },
          });
        }
      }
    } catch (error) {
      console.error(`Erreur lors de l'ajout des tags: ${error.message}`);
      // Continuer même si l'ajout des tags échoue
    }
  },

  /**
   * Formate la réponse d'un produit selon l'API de l'application
   * @param {Object} product - Produit avec ses relations
   * @returns {Object} Produit formaté
   */
  formatProductResponse(product) {
    // Si le produit est null, retourner null
    if (!product) return null;

    // Extraire les tags s'ils sont disponibles
    const tags = product.aliments_tags
      ? product.aliments_tags.map((tag) => ({
          id: tag.tags.id_tag,
          name: tag.tags.nom,
        }))
      : [];

    return {
      id: product.id_aliment,
      name: product.nom,
      image: product.image,
      type: product.type,
      source: product.source,
      calories: Number(product.calories),
      proteins: Number(product.proteines),
      carbs: Number(product.glucides),
      fats: Number(product.lipides),
      barcode: product.code_barres,
      ingredients: product.ingredients,
      description: product.description,
      preparationTime: product.temps_preparation,
      tags: tags,
    };
  },
};

module.exports = OpenFoodFactsService;
