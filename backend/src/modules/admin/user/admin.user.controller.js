const adminUserService = require('./admin.user.service');
const { catchAsync } = require('../../../utils/catcherror.utils');
const { AppError } = require('../../../utils/response.utils');
const userService  = require('../../user/user.service');
const e = require('express');

exports.getTotalUserCount = catchAsync(async (req, res) => {
    const totalCount = await adminUserService.getUserCount();
    res.status(200).json({
        status: 'success',
        data: {
        totalCount
        },
        message: 'Nombre total d\'utilisateurs récupéré avec succès'
    })

    if (!totalCount) {
        return next(new AppError('Aucun utilisateur trouvé', 404));
    }
});

exports.getAllUsers = catchAsync(async (req, res) => {
    const { page = 1, limit = 10, search = '', sortBy = 'createdAt', order = 'desc' } = req.query;
    const users = await adminUserService.getPaginatedUsers({
        page,
        limit,
        search,
        sortBy,
        order
    });
    
    const total = await adminUserService.getUserCount();
    const totalPages = Math.ceil(total / limit);
    
    res.status(200).json({
        status: 'success',
        data: {
            users,
            pagination: {
                total,
                totalPages,
                currentPage: page,
                perPage: limit,
                hasMore: page < totalPages
            }
        },
        message: 'Liste des utilisateurs récupérée avec succès'
    });
});

exports.getUserById = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    if (!user) {
        return next(new AppError('Utilisateur non trouvé', 404));
    }
    
    const user = await userService.getUserProfile(parseInt(id));
    res.status(200).json({
        status: 'success',
        data: {
            user
        },
        message: 'Utilisateur récupéré avec succès'
    });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { password } = req.body;
    const adminId = req.user.id_user;

    if (!password) {
        throw new AppError('Mot de passe manquant', 400, 'PASSWORD_MISSING');
    }

    const isPasswordValid = await adminUserService.checkAdminPassword(adminId, password);
    if (!isPasswordValid) {
        throw new AppError('Mot de passe incorrect', 401, 'INVALID_PASSWORD');
    }

    if (!id) {
        throw new AppError('ID d\'utilisateur manquant', 400, 'USER_ID_MISSING');
    }

    const user = await adminUserService.deleteUser(id);
    if (!user) {
        throw new AppError('Utilisateur non trouvé', 404, 'USER_NOT_FOUND');
    }
    res.status(200).json({
        status: 'success',
        data: {
            user
        },
        message: 'Utilisateur supprimé avec succès'
    });
});