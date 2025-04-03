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
  