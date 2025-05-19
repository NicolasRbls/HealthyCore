const adminExerciseService = require("./admin.exercises.service");
const { catchAsync } = require("../../../utils/catcherror.utils");
const { AppError } = require("../../../utils/response.utils");

exports.getAllExercises = catchAsync(async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const search = req.query.search || "";
    const tagId = req.query.tagId || null;

    const data = await adminExerciseService.getAllExercises({
      page,
      limit,
      search,
      tagId,
    });

    res.status(200).json({
      status: "success",
      data,
      message: "Exercices récupérés avec succès",
    });
  } catch (err) {
    next(err);
  }
});

exports.getExerciseById = catchAsync(async (req, res, next) => {
  try {
    const { id } = req.params;

    const data = await adminExerciseService.getExerciseById(id);

    if (!data) {
      throw new AppError("Aucun exercice trouvé", 404, "EXERCISE_NOT_FOUND");
    }

    res.status(200).json({
      status: "success",
      data, // data contient déjà { exercise: ... }
      message: "Exercice récupéré avec succès",
    });
  } catch (err) {
    next(err);
  }
});

exports.createExercise = catchAsync(async (req, res, next) => {
  try {
    const { name, description, equipment, gif, tagIds } = req.body;

    if (!name || !description) {
      throw new AppError(
        "Le nom et la description sont requis",
        400,
        "MISSING_FIELDS"
      );
    }

    const data = await adminExerciseService.createExercise({
      name,
      description,
      equipment,
      gif,
      tagIds,
    });

    res.status(201).json({
      status: "success",
      data,
      message: "Exercice créé avec succès",
    });
  } catch (err) {
    next(err);
  }
});

exports.updateExercise = catchAsync(async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, equipment, gif, tagIds } = req.body;

    if (!name || !description) {
      throw new AppError(
        "Le nom et la description sont requis",
        400,
        "MISSING_FIELDS"
      );
    }

    const data = await adminExerciseService.updateExercise(id, {
      name,
      description,
      equipment,
      gif,
      tagIds,
    });

    if (!data) {
      throw new AppError("Aucun exercice trouvé", 404, "EXERCISE_NOT_FOUND");
    }

    res.status(200).json({
      status: "success",
      data,
      message: "Exercice mis à jour avec succès",
    });
  } catch (err) {
    next(err);
  }
});

exports.deleteExercise = catchAsync(async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await adminExerciseService.deleteExercise(id);

    if (!result.success) {
      // Si l'exercice est utilisé, renvoyer un code d'erreur approprié
      return res.status(409).json({
        status: "error",
        error: result.error,
        message: result.message,
        usageStats: result.usageStats,
      });
    }

    // Si la suppression a réussi
    res.status(200).json({
      status: "success",
      message: "Exercice supprimé avec succès",
    });
  } catch (err) {
    next(err);
  }
});
