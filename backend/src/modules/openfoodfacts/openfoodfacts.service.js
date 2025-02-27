const axios = require("axios");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const OpenFoodFactsService = {
  /**
   * Recherche un produit par code-barres dans la base de données ou sur OpenFoodFacts
   * @param {string} barcode - Code-barres du produit
   */
  async getProductByBarcode(barcode) {
    // Vérifie d'abord si le produit est en base
    let product = await prisma.product.findUnique({
      where: { barcode },
    });

    if (!product) {
      // Si non, requête OpenFoodFacts
      const response = await axios.get(`https://world.openfoodfacts.org/api/v3/product/${barcode}.json`);

      if (!response.data || !response.data.product) {
        throw new Error("Produit introuvable");
      }

      // Sauvegarde en base
      product = await prisma.product.create({
        data: {
          barcode,
          name: response.data.product.product_name || "Nom inconnu",
          brands: response.data.product.brands || "Marque inconnue",
          categories: response.data.product.categories || "Non catégorisé",
          imageUrl: response.data.product.image_url || null,
        },
      });
    }

    return product;
  },

  /**
   * Recherche des produits par nom dans OpenFoodFacts
   * @param {string} query - Mot-clé de recherche
   */
  async searchProducts(query) {
    const response = await axios.get("https://world.openfoodfacts.org/cgi/search.pl", {
      params: { search_terms: query, json: 1 },
    });

    return response.data.products.map((product) => ({
      barcode: product.code,
      name: product.product_name,
      brands: product.brands,
      categories: product.categories,
      imageUrl: product.image_url,
    }));
  },
};

module.exports = OpenFoodFactsService;