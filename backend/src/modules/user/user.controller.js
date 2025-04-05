const userService = require("./user.service");
const { success, AppError } = require("../../utils/response.utils");


/* * Récupérer le profil utilisateur
 * @param {Object} req - Requête HTTP
 * @param {Object} res - Réponse HTTP
 * @param {Function} next - Fonction middleware pour passer au prochain middleware
 */
exports.getUserProfile = async (req, res, next) => {
    try {
      const userId = req.user.id_user;
      const profile = await userService.getUserProfile(userId);
  
      res.status(200).json(success(profile, "Profil utilisateur récupéré avec succès"));
    } catch (err) {
      next(err);
    }
  };
  

/**
 * Récupérer les badges utilisateur (débloqués et non débloqués)
 * @param {Object} req - Requête HTTP
 * @param {Object} res - Réponse HTTP
 * @param {Function} next - Fonction middleware
 */
exports.getBadgesController = async (req, res, next) => {
  try {
    const userId = req.user.id_user;
    const badges = await userService.getUserBadges(userId);

    res.status(200).json(success(badges, "Badges récupérés avec succès"));
  } catch (err) {
    next(err);
  }
};


/* * Vérifier les nouveaux badges de l'utilisateur
 * @param {Object} req - Requête HTTP
 * @param {Object} res - Réponse HTTP
 * @param {Function} next - Fonction middleware
 */
exports.checkBadgesController = async (req, res, next) => {
  try {
    const userId = req.user.id_user;

    const newBadges = await userService.checkNewBadges(userId);

    res.status(200).json({
      status: "success",
      data: { newBadges },
      message: "Vérification des badges effectuée avec succès",
    });
  } catch (err) {
    console.error("❌ Erreur dans checkBadgesController :", err);
    next(err);
  }
};

/**
 * Récupérer l'évolution de l'utilisateur entre deux dates
 * @param {Object} req - Requête HTTP
 * @param {Object} res - Réponse HTTP
 * @param {Function} next - Fonction middleware
 */
exports.getUserEvolutionController = async (req, res, next) => {
  try {
    const userId = req.user.id_user;
    const { startDate, endDate } = req.query;

    const result = await userService.getUserEvolution(userId, startDate, endDate);

    res.status(200).json({
      status: "success",
      data: result,
      message: "Évolution récupérée avec succès"
    });
  } catch (err) {
    console.error("❌ Erreur dans getUserEvolutionController :", err);
    next(err);
  }
};


/**
 * Ajouter une évolution pour l'utilisateur
 * @param {Object} req - Requête HTTP
 * @param {Object} res - Réponse HTTP
 * @param {Function} next - Fonction middleware
 */
exports.addEvolutionController = async (req, res, next) => {
  try {
    const userId = req.user.id_user;
    const { weight, height, date } = req.body;

    const evolution = await userService.addEvolution(userId, { weight, height, date });

    res.status(200).json({
      status: "success",
      data: { evolution },
      message: "Évolution enregistrée avec succès"
    });
  } catch (err) {
    console.error("❌ Erreur dans addEvolutionController :", err);
    next(err);
  }
};

/**
 * Récupérer les statistiques de progression de l'utilisateur
 * @param {Object} req - Requête HTTP
 * @param {Object} res - Réponse HTTP
 * @param {Function} next - Fonction middleware
 */
exports.getProgressStatsController = async (req, res, next) => {
  try {
    const userId = req.user.id_user;
    const period = req.query.period || "month";

    const stats = await userService.getProgressStats(userId, period);

    res.status(200).json({
      status: "success",
      data: stats,
      message: "Statistiques de progression récupérées avec succès",
    });
  } catch (err) {
    console.error("❌ Erreur dans getProgressStatsController :", err);
    next(err);
  }
};
