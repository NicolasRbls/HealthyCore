const programsService = require("./programs.service");
const { success, AppError } = require("../../../utils/response.utils");

/**
 * Récupérer tous les programmes de l'utilisateur
 * @param {Object} req - Requête HTTP
 * @param {Object} res - Réponse HTTP
 * @param {Function} next - Fonction middleware pour passer au prochain middleware
 */
exports.getPrograms = async (req, res, next) => {
  try {
    const userId = req.user.id_user;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const tagId = req.query.tagId || null;

    const result = await programsService.getUserPrograms(userId, page, limit, tagId);

    res.status(200).json(
      success(result, "Programmes récupérés avec succès")
    );
  } catch (err) {
    next(err);
  }
};