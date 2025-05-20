const { catchAsync } = require("../../../utils/catcherror.utils");
const adminProgramService = require("./admin.programs.service");
const { AppError } = require("../../../utils/response.utils");

exports.getAllPrograms = catchAsync(async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const search = req.query.search || "";
    const tagId = req.query.tagId || null;

    const data = await adminProgramService.getAllPrograms({
      page,
      limit,
      search,
      tagId,
    });

    res.status(200).json({
      status: "success",
      data,
      message: "Programmes récupérés avec succès",
    });
  } catch (err) {
    next(err);
  }
});

exports.getProgramById = catchAsync(async (req, res, next) => {
  const { programId } = req.params;

  if (!programId) {
    throw new AppError("ID de programme manquant", 400, "PROGRAM_ID_MISSING");
  }

  const program = await adminProgramService.getProgramById(programId);

  if (!program) {
    throw new AppError("Programme non trouvé", 404, "PROGRAM_NOT_FOUND");
  }

  res.status(200).json({
    status: "success",
    data: program,
    message: "Programme récupéré avec succès",
  });
});

exports.createProgram = catchAsync(async (req, res, next) => {
  const userId = req.user.id_user;
  const { name, image, duration, tagIds, sessions } = req.body;

  if (
    !name ||
    !duration ||
    !Array.isArray(tagIds) ||
    !Array.isArray(sessions)
  ) {
    throw new AppError("Champs manquants ou invalides", 400, "INVALID_BODY");
  }

  const program = await adminProgramService.createProgram(userId, {
    name,
    image,
    duration,
    tagIds,
    sessions,
  });

  res.status(201).json({
    status: "success",
    data: program,
    message: "Programme créé avec succès",
  });
});

exports.updateProgram = catchAsync(async (req, res, next) => {
  const { programId } = req.params;
  const { name, image, duration, tagIds, sessions } = req.body;

  if (!programId) {
    throw new AppError("ID de programme manquant", 400, "PROGRAM_ID_MISSING");
  }

  if (
    !name ||
    !duration ||
    !Array.isArray(tagIds) ||
    !Array.isArray(sessions)
  ) {
    throw new AppError("Champs manquants ou invalides", 400, "INVALID_BODY");
  }

  const program = await adminProgramService.updateProgram(programId, {
    name,
    image,
    duration,
    tagIds,
    sessions,
  });

  if (!program) {
    throw new AppError("Programme non trouvé", 404, "PROGRAM_NOT_FOUND");
  }

  res.status(200).json({
    status: "success",
    data: program,
    message: "Programme mis à jour avec succès",
  });
});

exports.deleteProgram = catchAsync(async (req, res, next) => {
  const { programId } = req.params;

  if (!programId) {
    throw new AppError("ID de programme manquant", 400, "PROGRAM_ID_MISSING");
  }

  const deletedProgram = await adminProgramService.deleteProgram(programId);

  if (!deletedProgram) {
    throw new AppError("Programme non trouvé", 404, "PROGRAM_NOT_FOUND");
  }

  res.status(200).json({
    status: "success",
    data: {
      program: {
        id_programme: deletedProgram.id_programme,
        nom: deletedProgram.nom,
      },
    },
    message: "Programme supprimé avec succès",
  });
});
