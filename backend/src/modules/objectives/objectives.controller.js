const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { success, AppError } = require("../../utils/response.utils");
const { catchAsync } = require("../../utils/catcherror.utils");

/**
 * Récupérer les objectifs quotidiens de l'utilisateur
 */
const getUserDailyObjectives = catchAsync(async (req, res) => {
  const userId = req.user.id_user;
  const today = new Date();

  // Récupérer tous les objectifs disponibles
  const allObjectives = await prisma.objectifs.findMany();

  // Récupérer les objectifs de l'utilisateur pour aujourd'hui
  const userObjectives = await prisma.objectifs_utilisateurs.findMany({
    where: {
      id_user: userId,
      date: today,
    },
    include: {
      objectifs: true,
    },
  });

  // Mapper les objectifs existants ou créer de nouveaux objectifs pour aujourd'hui
  const objectivesList = await Promise.all(
    allObjectives.map(async (objective) => {
      // Vérifier si l'objectif existe déjà pour aujourd'hui
      const existingObjective = userObjectives.find(
        (uo) => uo.id_objectif === objective.id_objectif
      );

      if (existingObjective) {
        return {
          id: existingObjective.id_objectif_utilisateur,
          objectiveId: objective.id_objectif,
          title: objective.titre,
          completed: existingObjective.statut === "done",
          date: existingObjective.date,
        };
      } else {
        // Créer l'objectif pour l'utilisateur aujourd'hui
        const newUserObjective = await prisma.objectifs_utilisateurs.create({
          data: {
            id_user: userId,
            id_objectif: objective.id_objectif,
            date: today,
            statut: "not_done",
          },
          include: {
            objectifs: true,
          },
        });

        return {
          id: newUserObjective.id_objectif_utilisateur,
          objectiveId: objective.id_objectif,
          title: newUserObjective.objectifs.titre,
          completed: false,
          date: newUserObjective.date,
        };
      }
    })
  );

  // Vérifier automatiquement si certains objectifs sont déjà complétés
  const verifiedObjectives = await checkObjectivesCompletion(
    userId,
    objectivesList
  );

  res
    .status(200)
    .json(
      success(
        { objectives: verifiedObjectives },
        "Objectifs quotidiens récupérés avec succès"
      )
    );
});

/**
 * Vérifier automatiquement les objectifs complétés
 */
const checkObjectivesCompletion = async (userId, objectives) => {
  const today = new Date();

  // Vérifier l'objectif "Ajouter un aliment à son suivi quotidien"
  const foodObjective = objectives.find((obj) =>
    obj.title.includes("Ajouter un aliment")
  );
  if (foodObjective) {
    const foodTracking = await prisma.suivis_nutritionnels.findFirst({
      where: {
        id_user: userId,
        date: today,
      },
    });

    if (foodTracking && !foodObjective.completed) {
      // Mettre à jour le statut de l'objectif en base de données
      await prisma.objectifs_utilisateurs.update({
        where: { id_objectif_utilisateur: foodObjective.id },
        data: { statut: "done" },
      });
      foodObjective.completed = true;
    }
  }

  // Vérifier l'objectif "Effectuer la séance du jour"
  const workoutObjective = objectives.find((obj) =>
    obj.title.includes("Effectuer la séance")
  );
  if (workoutObjective) {
    const workoutTracking = await prisma.suivis_sportifs.findFirst({
      where: {
        id_user: userId,
        date: today,
      },
    });

    if (workoutTracking && !workoutObjective.completed) {
      // Mettre à jour le statut de l'objectif en base de données
      await prisma.objectifs_utilisateurs.update({
        where: { id_objectif_utilisateur: workoutObjective.id },
        data: { statut: "done" },
      });
      workoutObjective.completed = true;
    }
  }

  return objectives;
};

/**
 * Marquer manuellement un objectif comme complété
 */
const completeObjective = catchAsync(async (req, res) => {
  const userId = req.user.id_user;
  const { objectiveId } = req.params;

  // Vérifier si l'objectif existe
  const userObjective = await prisma.objectifs_utilisateurs.findFirst({
    where: {
      id_objectif_utilisateur: parseInt(objectiveId),
      id_user: userId,
    },
    include: {
      objectifs: true,
    },
  });

  if (!userObjective) {
    throw new AppError("Objectif non trouvé", 404, "OBJECTIVE_NOT_FOUND");
  }

  // Mettre à jour le statut de l'objectif
  const updatedObjective = await prisma.objectifs_utilisateurs.update({
    where: { id_objectif_utilisateur: parseInt(objectiveId) },
    data: { statut: "done" },
    include: {
      objectifs: true,
    },
  });

  res.status(200).json(
    success(
      {
        objective: {
          id: updatedObjective.id_objectif_utilisateur,
          objectiveId: updatedObjective.id_objectif,
          title: updatedObjective.objectifs.titre,
          completed: true,
          date: updatedObjective.date,
        },
      },
      "Objectif marqué comme complété"
    )
  );
});

module.exports = {
  getUserDailyObjectives,
  checkObjectivesCompletion,
  completeObjective,
};
