const adminTagService = require("./admin.tag.service");
const { catchAsync } = require("../../../utils/catcherror.utils");
const { AppError } = require("../../../utils/response.utils");

const validTypes = ["sport", "aliment"];

exports.getAllTags = catchAsync(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.max(1, parseInt(req.query.limit) || 20);
  let type = req.query.type?.trim();

  // Gestion du type "all" - on le transforme en undefined pour ne pas filtrer
  if (type === "all") {
    type = undefined;
  }

  // Vérification du type seulement si défini et différent de "all"
  if (type && !validTypes.includes(type)) {
    throw new AppError("Type de tag invalide", 400, "INVALID_TAG_TYPE");
  }

  const totalTags = await adminTagService.getTagCountByType(type);
  if (totalTags === 0) {
    throw new AppError("Aucun tag trouvé", 404, "TAG_NOT_FOUND");
  }

  const tags = await adminTagService.getAllTags({ page, limit, type });
  if (!tags) {
    throw new AppError("Aucun tag de trouvé", 400, "PAGINATION_ERROR");
  }

  res.status(200).json({
    status: "success",
    data: {
      tags,
      pagination: {
        currentPage: page,
        limit,
        total: totalTags,
        totalPages: Math.ceil(totalTags / limit),
      },
    },
    message: "Liste des tags récupérée avec succès",
  });
});

exports.updateTag = catchAsync(async (req, res) => {
  const { id_tag } = req.params;
  const { name, type } = req.body; // Correction: utilisation de req.body au lieu de req.query

  if (isNaN(id_tag)) {
    throw new AppError("L'id du tag est invalide", 400, "INVALID_TAG_ID");
  }

  if (!name && !type) {
    throw new AppError(
      "Au moins un champ est obligatoire",
      400,
      "MISSING_FIELDS"
    );
  }

  // Vérifier le type seulement s'il est fourni
  if (type && !validTypes.includes(type)) {
    throw new AppError("Type de tag invalide", 400, "INVALID_TAG_TYPE");
  }

  const tag = await adminTagService.updateTag(parseInt(id_tag), { name, type });
  if (!tag) {
    throw new AppError(
      "Erreur lors de la mise à jour du tag",
      400,
      "UPDATE_TAG_ERROR"
    );
  }

  res.status(200).json({
    status: "success",
    data: tag,
    message: "Tag mis à jour avec succès",
  });
});

exports.createTag = catchAsync(async (req, res) => {
  const { name, type } = req.body; // Correction: utilisation de req.body au lieu de req.query

  if (!name || !type) {
    throw new AppError(
      "Tous les champs sont obligatoires",
      400,
      "MISSING_FIELDS"
    );
  }

  if (!validTypes.includes(type)) {
    throw new AppError("Type de tag invalide", 400, "INVALID_TAG_TYPE");
  }

  const tag = await adminTagService.createTag({ name, type });
  if (!tag) {
    throw new AppError(
      "Erreur lors de la création du tag",
      400,
      "CREATE_TAG_ERROR"
    );
  }

  res.status(201).json({
    status: "success",
    data: tag,
    message: "Tag créé avec succès",
  });
});

exports.deleteTag = catchAsync(async (req, res) => {
  const { id_tag } = req.params;

  if (isNaN(id_tag)) {
    throw new AppError("L'id du tag est invalide", 400, "INVALID_TAG_ID");
  }

  try {
    const tag = await adminTagService.deleteTag(parseInt(id_tag));
    if (!tag) {
      throw new AppError(
        "Erreur lors de la suppression du tag",
        400,
        "DELETE_TAG_ERROR"
      );
    }

    res.status(200).json({
      status: "success",
      data: tag,
      message: "Tag supprimé avec succès",
    });
  } catch (error) {
    if (error.message === "TAG_IN_USE") {
      throw new AppError(
        "Ce tag est utilisé dans des aliments, exercices, programmes ou séances et ne peut pas être supprimé",
        400,
        "TAG_IN_USE"
      );
    }
    throw error; // Laisser le catchAsync gérer les autres erreurs
  }
});

exports.getTagById = catchAsync(async (req, res) => {
  const { id_tag } = req.params;

  if (isNaN(id_tag)) {
    throw new AppError("L'id du tag est invalide", 400, "INVALID_TAG_ID");
  }

  const tag = await adminTagService.getTagById(parseInt(id_tag));
  if (!tag) {
    throw new AppError("Aucun tag trouvé", 404, "TAG_NOT_FOUND");
  }

  // Option: Ajouter les statistiques d'utilisation
  // Cette partie dépend de votre schéma de données et de votre logique
  const usageStats = await adminTagService.getTagUsageStats(parseInt(id_tag));

  const tagWithStats = {
    ...tag,
    ...(usageStats && { usageStats }), // Ajouter usageStats seulement si défini
  };

  res.status(200).json({
    status: "success",
    data: {
      tag: tagWithStats,
    },
    message: "Tag récupéré avec succès",
  });
});
