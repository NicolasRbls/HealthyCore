const { catchAsync } = require("../../../utils/catcherror.utils");
const { AppError } = require("../../../utils/response.utils");
const adminSessionsService = require("./admin.sessions.service");

exports.getAllSessions = catchAsync(async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const search = req.query.search || '';
    const tagId = req.query.tagId || null;

    const data = await adminSessionsService.getAllSessions({ page, limit, search, tagId });

    res.status(200).json({
      status: "success",
      data,
      message: "Séances récupérées avec succès"
    });
  } catch (err) {
    next(err);
  }
});

exports.getSessionById = catchAsync(async (req, res, next) => {
  try {
    const sessionId = parseInt(req.params.id, 10);

    if (isNaN(sessionId)) {
      throw new AppError("ID de séance invalide", 400, "INVALID_ID");
    }

    const data = await adminSessionsService.getSessionByIdWithExercises(sessionId);

    if (!data) {
      throw new AppError("Séance non trouvée", 404, "SESSION_NOT_FOUND");
    }

    res.status(200).json({
      status: "success",
      data,
      message: "Séance récupérée avec succès"
    });
  } catch (err) {
    next(err);
  }
});

exports.createSession = catchAsync(async (req, res, next) => {
  const userId = req.user.id_user;

  const { name, tagIds, exercises } = req.body;

  if (!name || !Array.isArray(tagIds) || !Array.isArray(exercises)) {
    throw new AppError("Champs manquants ou invalides", 400, "INVALID_BODY");
  }

  const session = await adminSessionsService.createSession(userId, { name, tagIds, exercises });

  res.status(201).json({
    status: "success",
    data: { session },
    message: "Séance créée avec succès"
  });
});

exports.updateSession = catchAsync(async (req, res, next) => {
  const sessionId = parseInt(req.params.sessionId, 10);
  const { name, tagIds, exercises } = req.body;

  if (!name || !Array.isArray(tagIds) || !Array.isArray(exercises)) {
    throw new AppError("Champs manquants ou invalides", 400, "INVALID_BODY");
  }

  const session = await adminSessionsService.updateSession(sessionId, { name, tagIds, exercises });

  res.status(200).json({
    status: "success",
    data: { session },
    message: "Séance mise à jour avec succès"
  });
});

exports.deleteSession = catchAsync(async (req, res, next) => {
  const sessionId = parseInt(req.params.sessionId, 10);

  if (isNaN(sessionId)) {
    throw new AppError("ID de séance invalide", 400, "INVALID_ID");
  }

  await adminSessionsService.deleteSession(sessionId);

  res.status(200).json({
    status: "success",
    message: "Séance supprimée avec succès"
  });
});