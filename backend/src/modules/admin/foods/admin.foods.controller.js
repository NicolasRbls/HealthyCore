const adminFoodsService = require('./admin.foods.service');
const { catchAsync } = require('../../../utils/catcherror.utils');
const { AppError } = require('../../../utils/response.utils');

const validTypes   = ['produit', 'recette']
const validSources = ['user', 'admin', 'api']


exports.getFoods = catchAsync(async (req, res) => {
    const page    = Math.max(1, parseInt(req.query.page) || 1)
    const limit   = Math.max(1, parseInt(req.query.limit) || 20)
    const search  = (req.query.search)?.trim() || undefined
    const type    = (req.query.type)?.trim() || undefined
    const source  = (req.query.source)?.trim() || undefined
    const tagId   = req.query.tagId ? parseInt(req.query.tagId) : undefined

    if (type && !validTypes.includes(type)) {
      throw new AppError('Type d\'aliment invalide', 400, 'INVALID_FOOD_TYPE');
    }
    if (source && !validSources.includes(source)) {
      throw new AppError('Source d\'aliment invalide', 400, 'INVALID_FOOD_SOURCE');
    }
    if (tagId !== undefined && isNaN(tagId)) {
      throw new AppError('L\'id du tag est invalide', 400, 'INVALID_TAG_ID');
    }

    resFoods = await adminFoodsService.getAllFoods({
        page,
        limit,
        search,
        type,
        source,
        tagId
    });
    if (!resFoods.foods || resFoods.foods.length === 0) {
        throw new AppError('Aucun aliment trouvé', 404, 'FOOD_NOT_FOUND');
    }
    
    res.status(200).json({
        status: 'success',
        data: {
            foods: resFoods.foods,
            pagination: {
                currentPage: page,
                limit,
                total: resFoods.fullTotal,
                totalPages: resFoods.totalPages
            }
        },
        message: 'Liste des aliments récupérée avec succès'
    });
});

exports.getFoodById = catchAsync(async (req, res) => {
    const foodId = parseInt(req.params.foodId);
    if (!foodId || isNaN(foodId)) {
        throw new AppError('L\'id de l\'aliment est invalide', 400, 'INVALID_FOOD_ID');
    }

    const food = await adminFoodsService.getFoodById(foodId);
    if (!food.id) {
        throw new AppError('Aliment non trouvé', 404, 'FOOD_NOT_FOUND');
    }

    res.status(200).json({
        status: 'success',
        data: food,
        message: 'Aliment récupéré avec succès'
    });
});

exports.createFood = catchAsync(async (req, res) => {
    const { name, type, source, image, preparationTime, barcode } = req.body;
    const tags = req.body.tags || [];

    if (!name || !type || !source) {
        throw new AppError('Nom, type et source de l\'aliment sont requis', 400, 'MISSING_FOOD_INFO');
    }

    if (type && !validTypes.includes(type)) {
      throw new AppError('Type d\'aliment invalide', 400, 'INVALID_FOOD_TYPE');
    }
    if (source && !validSources.includes(source)) {
      throw new AppError('Source d\'aliment invalide', 400, 'INVALID_FOOD_SOURCE');
    }

    const food = await adminFoodsService.createFood({
        name,
        type,
        source,
        image,
        preparationTime,
        barcode,
        tags
    });

    res.status(201).json({
        status: 'success',
        data: food,
        message: 'Aliment créé avec succès'
    });
});