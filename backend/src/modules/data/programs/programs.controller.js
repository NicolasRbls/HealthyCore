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

/**
 * Inscrire un utilisateur à un programme
 */
exports.enrollProgram = async (req, res, next) => {
  try {
      const userId = req.user.id_user;
      const { programId, startDate } = req.body;

      if (!programId || !startDate) {
          throw new AppError("Le programme ID et la date de début sont requis", 400, "MISSING_PARAMETERS");
      }

      // Vérifier le format de la date
      const parsedDate = new Date(startDate);
      if (isNaN(parsedDate.getTime())) {
          throw new AppError("Format de date invalide", 400, "INVALID_DATE_FORMAT");
      }

      const result = await programsService.enrollUserInProgram(userId, programId, parsedDate);

      res.status(201).json(success(result, "Inscription réussie"));
  } catch (error) {
      next(error);
  }
};