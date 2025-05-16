const OpenFoodFactsService = require("./openfoodfacts.service");

const OpenFoodFactsController = {
  /**
   * Récupère un produit par code-barres
   */
  async getProduct(req, res) {
    const { barcode } = req.params;

    if (!barcode) {
      return res.status(400).json({ error: "Code-barres requis" });
    }

    try {
      const product = await OpenFoodFactsService.getProductByBarcode(barcode);
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * Recherche des produits par mot-clé
   */
  async search(req, res) {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ error: "Requête de recherche requise" });
    }

    try {
      const products = await OpenFoodFactsService.searchProducts(query);
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = OpenFoodFactsController;