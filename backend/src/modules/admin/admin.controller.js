const adminService = require('./admin.service');
const { catchAsync } = require('../../utils/catcherror.utils');
const { AppError } = require('../../utils/response.utils');
const bcrypt = require('bcrypt');

/**
 * Contrôleur pour les routes d'administration
 */
const adminController = {
  /**
   * Récupérer la liste paginée de tous les utilisateurs
   */
  getAllUsers: catchAsync(async (req, res) => {
    // Paramètres de pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || '';
    const sortBy = req.query.sortBy || 'created_at';
    const order = req.query.order?.toLowerCase() === 'asc' ? 'asc' : 'desc';
    
    const { users, total, totalPages } = await adminService.getPaginatedUsers({
      page,
      limit,
      search,
      sortBy,
      order
    });
    
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
  }),

  getTotalUserCount: catchAsync(async (req, res) => {
    const totalCount = await adminService.getUserCount();
    
    res.status(200).json({
      status: 'success',
      data: {
        totalCount
      },
      message: 'Nombre total d\'utilisateurs récupéré avec succès'
    });
  }),

  getUserById: catchAsync(async (req, res) => {
    const { id } = req.params;
    
    const user = await adminService.getUserInfosById(id);
    
    if (!user) {
      throw new AppError('Utilisateur non trouvé', 404, 'USER_NOT_FOUND');
    }

    const evolution = await adminService.getLastEvolutionById(id);
    const preferences = await adminService.getUserPreferencesById(id);
    
    res.status(200).json({
      status: 'success',
      data: {
        user,
        evolution,
        preferences
      },
      message: 'Utilisateur récupéré avec succès'
    });
  }),


  /**
   * Supprimer un utilisateur et toutes ses données associées
   */
  deleteUser: catchAsync(async (req, res) => {
    const { userId } = req.params;
    const { adminPassword } = req.body;
    
    if (!adminPassword) {
      throw new AppError('Le mot de passe administrateur est requis', 400, 'MISSING_PASSWORD');
    }
    
    // Vérifier le mot de passe de l'administrateur
    const isPasswordValid = await adminService.verifyAdminPassword(req.user.id_user, adminPassword);
    
    if (!isPasswordValid) {
      throw new AppError('Mot de passe administrateur incorrect', 401, 'INVALID_PASSWORD');
    }
    
    await adminService.deleteUser(userId);
    
    res.status(200).json({
      status: 'success',
      message: 'Utilisateur supprimé avec succès'
    });
  }),

  /**
   * Récupérer les statistiques pour le tableau de bord administrateur
   */
  getDashboardStats: catchAsync(async (req, res) => {
    const stats = await adminService.getDashboardStats();
    
    res.status(200).json({
      status: 'success',
      data: stats,
      message: 'Statistiques du tableau de bord récupérées avec succès'
    });
  }),

  /**
   * Récupérer tout le contenu géré par l'administrateur
   */
  getAllContent: catchAsync(async (req, res) => {
    // Paramètres de filtrage et pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const contentType = req.query.type || null;
    
    const { content, total, totalPages } = await adminService.getAllContent({
      page,
      limit,
      contentType
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        content,
        pagination: {
          total,
          totalPages,
          currentPage: page,
          perPage: limit,
          hasMore: page < totalPages
        }
      },
      message: 'Contenu récupéré avec succès'
    });
  }),

  /**
   * Créer un nouveau contenu
   */
  createContent: catchAsync(async (req, res) => {
    const contentData = req.body;
    
    const newContent = await adminService.createContent(contentData);
    
    res.status(201).json({
      status: 'success',
      data: {
        content: newContent
      },
      message: 'Contenu créé avec succès'
    });
  }),

  /**
   * Mettre à jour un contenu existant
   */
  updateContent: catchAsync(async (req, res) => {
    const { contentId } = req.params;
    const contentData = req.body;
    
    const updatedContent = await adminService.updateContent(contentId, contentData);
    
    res.status(200).json({
      status: 'success',
      data: {
        content: updatedContent
      },
      message: 'Contenu mis à jour avec succès'
    });
  }),

  /**
   * Supprimer un contenu
   */
  deleteContent: catchAsync(async (req, res) => {
    const { contentId } = req.params;
    
    await adminService.deleteContent(contentId);
    
    res.status(200).json({
      status: 'success',
      message: 'Contenu supprimé avec succès'
    });
  }),

  /**
   * Envoyer une notification aux utilisateurs
   */
  sendNotification: catchAsync(async (req, res) => {
    const { title, message, targetUsers, notificationType } = req.body;
    
    if (!title || !message) {
      throw new AppError('Le titre et le message sont requis', 400, 'MISSING_FIELDS');
    }
    
    const result = await adminService.sendNotification({
      title,
      message, 
      targetUsers,
      notificationType,
      sentBy: req.user.id_user
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        notificationsSent: result.count
      },
      message: 'Notification envoyée avec succès'
    });
  }),

  /**
   * Récupérer les logs système
   */
  getSystemLogs: catchAsync(async (req, res) => {
    // Paramètres de filtrage
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : null;
    const logLevel = req.query.level || null; // error, warning, info, etc.
    const logType = req.query.type || null;
    
    const { logs, total, totalPages } = await adminService.getSystemLogs({
      page,
      limit,
      startDate,
      endDate,
      logLevel,
      logType
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        logs,
        pagination: {
          total,
          totalPages,
          currentPage: page,
          perPage: limit,
          hasMore: page < totalPages
        }
      },
      message: 'Logs système récupérés avec succès'
    });
  })

};

module.exports = adminController;
