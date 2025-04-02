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

/**
 * Récupérer les détails d'un programme spécifique
 * @param {Object} req - Requête HTTP
 * @param {Object} res - Réponse HTTP
 * @param {Function} next - Fonction middleware pour passer au prochain middleware
 */
exports.getProgramDetails = async (req, res, next) => {
  try {
    const userId = req.user.id_user;
    const programId = parseInt(req.params.programId);

    if (isNaN(programId)) {
      throw new AppError("ID de programme invalide", 400, "INVALID_PROGRAM_ID");
    }

    const program = await programsService.getProgramDetails(userId, programId);

    res.status(200).json(success({ program }, "Détails du programme récupérés avec succès"));
  } catch (err) {
    next(err);
  }
};

/**
 * Démarrer un programme pour l'utilisateur
 * @param {Object} req - Requête HTTP
 * @param {Object} res - Réponse HTTP
 * @param {Function} next - Fonction middleware pour passer au prochain middleware
 */
exports.startProgram = async (req, res, next) => {
  try {
    const userId = req.user.id_user;
    const programId = parseInt(req.params.programId);
    const { startDate } = req.body;

    if (isNaN(programId)) {
      throw new AppError("ID de programme invalide", 400, "INVALID_PROGRAM_ID");
    }

    const userProgram = await programsService.startProgram(userId, programId, startDate);

    res.status(201).json(
      success(
        { userProgram },
        "Programme commencé avec succès"
      )
    );
  } catch (err) {
    next(err);
  }
};

/**
 * Récupérer toutes les séances de l'utilisateur
 * @param {Object} req - Requête HTTP
 * @param {Object} res - Réponse HTTP
 * @param {Function} next - Fonction middleware pour passer au prochain middleware
 */
exports.getSessions = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const tagId = req.query.tagId || null;

    const result = await programsService.getUserSessions(page, limit, tagId);

    res.status(200).json(success(result, "Séances récupérées avec succès"));
  } catch (err) {
    next(err);
  }
};


/**
 * Récupérer les détails d'une séance spécifique
 * @param {Object} req - Requête HTTP
 * @param {Object} res - Réponse HTTP
 * @param {Function} next - Fonction middleware pour passer au prochain middleware
 */
exports.getSessionDetails = async (req, res, next) => {
  try {
    const sessionId = parseInt(req.params.sessionId);
    if (isNaN(sessionId)) {
      throw new AppError("ID de séance invalide", 400, "INVALID_SESSION_ID");
    }

    const session = await programsService.getSessionDetails(sessionId);
    res.status(200).json(
      success(
        { session },
        "Détails de la séance récupérés avec succès"
      )
    );
  } catch (err) {
    next(err);
  }
};

/**
 * Récupérer le suivi sportif de l'utilisateur
 * @param {Object} req - Requête HTTP
 * @param {Object} res - Réponse HTTP
 * @param {Function} next - Fonction middleware pour passer au prochain middleware
 */
exports.getSportProgress = async (req, res, next) => {
  try {
    const userId = req.user.id_user;
    const result = await programsService.getSportProgress(userId);

    res.status(200).json(
      success(result, "Suivi sportif récupéré avec succès")
    );
  } catch (err) {
    next(err);
  }
};

/**
 * Marquer une séance comme terminée
 * @param {Object} req - Requête HTTP
 * @param {Object} res - Réponse HTTP
 * @param {Function} next - Fonction middleware pour passer au prochain middleware
 */
exports.completeSession = async (req, res, next) => {
  try {
    const userId = req.user.id_user;
    const sessionId = parseInt(req.params.sessionId);
    const { date } = req.body;

    if (isNaN(sessionId)) {
      throw new AppError("ID de séance invalide", 400, "INVALID_SESSION_ID");
    }

    const completedSession = await programsService.completeSession(userId, sessionId, date);

    res.status(200).json(
      success(
        { completedSession },
        "Séance marquée comme terminée"
      )
    );
  } catch (err) {
    next(err);
  }
};

/**
 * Récupérer la séance du jour de l'utilisateur
 * @param {Object} req - Requête HTTP
 * @param {Object} res - Réponse HTTP
 * @param {Function} next - Fonction middleware pour passer au prochain middleware
 */
exports.getTodaySession = async (req, res, next) => {
  try {
    const userId = req.user.id_user;

    const todaySession = await programsService.getTodaySession(userId);

    res.status(200).json(
      success(
        { todaySession },
        todaySession ? "Séance du jour récupérée avec succès" : "Aucune séance prévue aujourd'hui"
      )
    );
  } catch (err) {
    console.error("❌ Erreur dans getTodaySession:", err);
    next(err);
  }  
};


