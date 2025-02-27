const axios = require("axios");

const OpenFoodFactsService = {
  /**
   * Recherche un produit par code-barres
   * @param {string} barcode - Code-barres du produit
   */
  async getProductByBarcode(barcode) {
    try {
      const response = await axios.get(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`);

      if (response.data.status === 0) {
        return { error: "Produit non trouvé" };
      }

      return response.data.product; // Retourne les données du produit
    } catch (error) {
      console.error("Erreur lors de la récupération du produit:", error);
      throw new Error("Impossible de récupérer les informations du produit");
    }
  },

  /**
   * Recherche des produits par nom
   * @param {string} query - Nom ou description du produit
   */
  async searchProducts(query) {
    try {
      const response = await axios.get(`https://world.openfoodfacts.org/cgi/search.pl`, {
        params: {
          search_terms: query,
          json: 1,
        },
      });

      return response.data.products; // Retourne la liste des produits trouvés
    } catch (error) {
      console.error("Erreur lors de la recherche de produits:", error);
      throw new Error("Impossible de récupérer les résultats de recherche");
    }
  },
};

module.exports = OpenFoodFactsService;
