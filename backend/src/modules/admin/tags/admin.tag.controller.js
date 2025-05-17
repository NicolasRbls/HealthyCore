const adminTagService = require('./admin.tag.service');
const { catchAsync } = require('../../../utils/catcherror.utils');
const { AppError } = require('../../../utils/response.utils');

const validTypes = ['sport', 'aliment']

exports.getAllTags = catchAsync(async (req, res) => {
    const page  = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.max(1, parseInt(req.query.limit) || 20)
    const type  = (req.query.type)?.trim()
    
    if (type && !validTypes.includes(type)) {
        throw new AppError('Type de tag invalide', 400, 'INVALID_TAG_TYPE');    
    }

    totalTags = await adminTagService.getTagCountByType(type);
    if (totalTags === 0) {
        throw new AppError('Aucun tag trouvé', 404, 'TAG_NOT_FOUND');
    }

    const tags = await adminTagService.getAllTags({page, limit, type});
    if (!tags) {
        throw new AppError('Aucun tag de trouvé', 400, 'PAGINATION_ERROR');
    }
    
    res.status(200).json({
        status: 'success',
        data: {
            tags,
            pagination: {
                currentPage: page,
                limit,
                total: totalTags,
                totalPages: Math.ceil(totalTags / limit)
            }
        },
        message: 'Liste des tags récupérée avec succès'
    });
});

exports.updateTag = catchAsync(async (req, res) => {
    const { id_tag } = req.params;
    const { name, type } = req.query;

    if (isNaN(id_tag)) {
        throw new AppError('L\'id du tag est invalide', 400, 'INVALID_TAG_ID');
    }

    if (!name && !type) {
        throw new AppError('Tous les champs sont obligatoires', 400, 'MISSING_FIELDS');
    }

    if (!validTypes.includes(type)) {
        throw new AppError('Type de tag invalide', 400, 'INVALID_TAG_TYPE');    
    }

    const tag = await adminTagService.updateTag(parseInt(id_tag), { name, type });
    if (!tag) {
        throw new AppError('Erreur lors de la mise à jour du tag', 400, 'UPDATE_TAG_ERROR');
    }

    res.status(200).json({
        status: 'success',
        data: tag,
        message: 'Tag mis à jour avec succès'
    });
});

exports.createTag = catchAsync(async (req, res) => {
    const { name, type } = req.query;

    if (!name || !type) {
        throw new AppError('Tous les champs sont obligatoires', 400, 'MISSING_FIELDS');
    }

    console.log(validTypes, type)

    if (!validTypes.includes(type)) {
        throw new AppError('Type de tag invalide', 400, 'INVALID_TAG_TYPE');    
    }

    const tag = await adminTagService.createTag({ name, type });
    if (!tag) {
        throw new AppError('Erreur lors de la création du tag', 400, 'CREATE_TAG_ERROR');
    }

    res.status(201).json({
        status: 'success',
        data: tag,
        message: 'Tag créé avec succès'
    });
});

exports.deleteTag = catchAsync(async (req, res) => {
    const { id_tag } = req.params;

    if (isNaN(id_tag)) {
        throw new AppError('L\'id du tag est invalide', 400, 'INVALID_TAG_ID');
    }

    const tag = await adminTagService.deleteTag(parseInt(id_tag));
    if (!tag) {
        throw new AppError('Erreur lors de la suppression du tag', 400, 'DELETE_TAG_ERROR');
    }

    res.status(200).json({
        status: 'success',
        data: tag,
        message: 'Tag supprimé avec succès'
    });
});

exports.getTagById = catchAsync(async (req, res) => {
    const { id_tag } = req.params;

    if (isNaN(id_tag)) {
        throw new AppError('L\'id du tag est invalide', 400, 'INVALID_TAG_ID');
    }

    const tag = await adminTagService.getTagById(parseInt(id_tag));
    if (!tag) {
        throw new AppError('Aucun tag trouvé', 404, 'TAG_NOT_FOUND');
    }

    res.status(200).json({
        status: 'success',
        data: tag,
        message: 'Tag récupéré avec succès'
    });
});