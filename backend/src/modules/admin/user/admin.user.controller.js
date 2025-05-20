const adminUserService = require("./admin.user.service");
const { catchAsync } = require("../../../utils/catcherror.utils");
const { AppError } = require("../../../utils/response.utils");
const userService = require("../../user/user.service");
const e = require("express");

exports.getTotalUserCount = catchAsync(async (req, res) => {
  const totalCount = await adminUserService.getUserCount();
  res.status(200).json({
    status: "success",
    data: {
      totalCount,
    },
    message: "Nombre total d'utilisateurs récupéré avec succès",
  });

  if (!totalCount) {
    return next(new AppError("Aucun utilisateur trouvé", 404));
  }
});

exports.getAllUsers = catchAsync(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    sortBy = "createdAt",
    order = "desc",
  } = req.query;
  const users = await adminUserService.getPaginatedUsers({
    page,
    limit,
    search,
    sortBy,
    order,
  });

  const total = await adminUserService.getUserCount();
  const totalPages = Math.ceil(total / limit);

  res.status(200).json({
    status: "success",
    data: {
      users,
      pagination: {
        total,
        totalPages,
        currentPage: page,
        perPage: limit,
        hasMore: page < totalPages,
      },
    },
    message: "Liste des utilisateurs récupérée avec succès",
  });
});

exports.getUserById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // Récupérer l'utilisateur avec tous les champs nécessaires
  const user = await adminUserService.getUserProfile(parseInt(id));

  if (!user) {
    return next(new AppError("Utilisateur non trouvé", 404));
  }

  // Calculer l'âge seulement si date_de_naissance existe
  let age = 0;
  if (user.date_de_naissance) {
    const birthDate = new Date(user.date_de_naissance);
    const today = new Date();
    age =
      today.getFullYear() -
      birthDate.getFullYear() -
      (today.getMonth() < birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() &&
        today.getDate() < birthDate.getDate())
        ? 1
        : 0);
  }

  // Récupérer la dernière évolution et les préférences
  const latestEvolution = await adminUserService.getLatestEvolution(
    parseInt(id)
  );
  const preferences = await adminUserService.getUserPreferences(parseInt(id));

  // Calculer l'IMC si possible
  const height = latestEvolution?.taille ? Number(latestEvolution.taille) : 0;
  const weight = latestEvolution?.poids ? Number(latestEvolution.poids) : 0;
  const bmi =
    height > 0 && weight > 0
      ? Number((weight / ((height / 100) * (height / 100))).toFixed(1))
      : 0;

  // Transformer les données pour correspondre au format attendu par le frontend
  const transformedUser = {
    id: user.id_user,
    firstName: user.prenom,
    lastName: user.nom,
    email: user.email,
    gender: user.sexe,
    birthDate: user.date_de_naissance
      ? user.date_de_naissance.toISOString().split("T")[0]
      : null,
    age: age,
    metrics: latestEvolution
      ? {
          currentWeight: Number(latestEvolution.poids),
          currentHeight: Number(latestEvolution.taille),
          bmi: bmi,
          targetWeight: preferences ? Number(preferences.objectif_poids) : 0,
          dailyCalories: preferences
            ? Number(preferences.calories_quotidiennes)
            : 0,
          sessionsPerWeek: preferences ? preferences.seances_par_semaines : 0,
        }
      : undefined,
    preferences: preferences || undefined,
  };

  res.status(200).json({
    status: "success",
    data: transformedUser,
    message: "Utilisateur récupéré avec succès",
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { password } = req.body;
  const adminId = req.user.id_user;

  if (!password) {
    throw new AppError("Mot de passe manquant", 400, "PASSWORD_MISSING");
  }

  const isPasswordValid = await adminUserService.checkAdminPassword(
    adminId,
    password
  );
  if (!isPasswordValid) {
    throw new AppError("Mot de passe incorrect", 401, "INVALID_PASSWORD");
  }

  if (!id) {
    throw new AppError("ID d'utilisateur manquant", 400, "USER_ID_MISSING");
  }

  const user = await adminUserService.deleteUser(id);
  if (!user) {
    throw new AppError("Utilisateur non trouvé", 404, "USER_NOT_FOUND");
  }
  res.status(200).json({
    status: "success",
    data: {
      user,
    },
    message: "Utilisateur supprimé avec succès",
  });
});
