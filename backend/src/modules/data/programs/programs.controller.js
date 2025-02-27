const programsService = require("./programs.service");
const { success, AppError } = require("../../../utils/response.utils");


/**
 * Récupérer les programmes actifs de l'utilisateur connecté
 */
exports.getActivePrograms = async (req, res, next) => {
  try {
    const userId = req.user.id_user;

    const programs = await programsService.getActivePrograms(userId);

    res.status(200).json(success({ activePrograms: programs }, "Programmes actifs récupérés avec succès"));
  } catch (error) {
    next(error);
  }
};
