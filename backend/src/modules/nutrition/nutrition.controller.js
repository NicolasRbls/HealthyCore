const foodService = require('./nutrition.service');
const { catchAsync } = require('../../utils/catcherror.utils');
const { AppError } = require('../../utils/response.utils');

/**
 * Contrôleur pour les routes d'administration
 */
const foodController = {

getAllTheFood: catchAsync(async (req, res) => {
    // Extraire les paramètres de requête
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const search = req.query.search || '';
    const type = req.query.type || null;
    const tagId = req.query.tagId || null;
    const source = req.query.source || null;
    
    // Valider les paramètres
    if (type && !['produit', 'recette'].includes(type)) {
      throw new AppError('Type invalide. Doit être "produit" ou "recette"', 400, 'INVALID_TYPE');
    }
    
    if (source && !['user', 'admin', 'api'].includes(source)) {
      throw new AppError('Source invalide. Doit être "user", "admin" ou "api"', 400, 'INVALID_SOURCE');
    }
    
    // Appeler le service
    const { foods, total, totalPages } = await foodService.getAllFoods({
      page,
      limit,
      search,
      type,
      tagId,
      source
    });
    
    // Renvoyer la réponse formatée
    res.status(200).json({
      status: 'success',
      data: {
        foods,
        pagination: {
          total,
          totalPages,
          currentPage: page,
          limit
        }
      },
      message: foods.length > 0 
        ? 'Aliments récupérés avec succès' 
        : 'Aucun aliment trouvé correspondant aux critères de recherche'
    });
  })
}

module.exports = foodController;