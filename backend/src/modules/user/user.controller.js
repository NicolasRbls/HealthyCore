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
