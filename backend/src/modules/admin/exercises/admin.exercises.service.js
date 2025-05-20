const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Récupérer les statistiques d'utilisation d'un exercice
 */
const getExerciseUsageStats = async (exerciseId) => {
  const exerciseId_int = parseInt(exerciseId);

  // Requête pour compter les utilisations dans les séances
  const sessionsCount = await prisma.exercices_seances.count({
    where: { id_exercice: exerciseId_int },
  });

  // Requête pour compter les programmes qui contiennent cet exercice
  const programsCount = await prisma.programmes.count({
    where: {
      seances_programmes: {
        some: {
          seances: {
            exercices_seances: {
              some: {
                id_exercice: exerciseId_int,
              },
            },
          },
        },
      },
    },
  });

  return {
    sessions: sessionsCount,
    programs: programsCount,
  };
};

/**
 * Récupérer tous les exercices avec pagination, recherche et filtre par tag
 */
const getAllExercises = async ({
  page = 1,
  limit = 20,
  search = "",
  tagId = null,
}) => {
  const where = {};

  if (search) {
    where.OR = [
      { nom: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  if (tagId) {
    where.exercices_tags = {
      some: { id_tag: parseInt(tagId) },
    };
  }

  const skip = (page - 1) * limit;

  const [exercises, total] = await Promise.all([
    prisma.exercices.findMany({
      where,
      skip,
      take: limit,
      orderBy: { id_exercice: "desc" },
      select: {
        id_exercice: true,
        nom: true,
        description: true,
        equipement: true,
        gif: true,
        exercices_tags: {
          select: {
            tags: {
              select: {
                id_tag: true,
                nom: true,
              },
            },
          },
        },
      },
    }),
    prisma.exercices.count({ where }),
  ]);

  const formatted = exercises.map((ex) => ({
    id: ex.id_exercice,
    name: ex.nom,
    description: ex.description,
    equipment: ex.equipement,
    gif: ex.gif,
    tags: ex.exercices_tags.map((et) => ({
      id: et.tags.id_tag,
      name: et.tags.nom,
    })),
  }));

  const totalPages = Math.ceil(total / limit);

  return {
    exercises: formatted,
    pagination: {
      total,
      totalPages,
      currentPage: page,
      limit,
    },
  };
};

/**
 * Récupérer un exercice par son ID
 */
const getExerciseById = async (id) => {
  const exercise = await prisma.exercices.findUnique({
    where: { id_exercice: parseInt(id) },
    select: {
      id_exercice: true,
      nom: true,
      description: true,
      equipement: true,
      gif: true,
      exercices_tags: {
        select: {
          tags: {
            select: {
              id_tag: true,
              nom: true,
            },
          },
        },
      },
    },
  });

  if (!exercise) return null;

  // Récupérer les statistiques d'utilisation
  const usageStats = await getExerciseUsageStats(id);

  const formattedExercise = {
    id: exercise.id_exercice,
    name: exercise.nom,
    description: exercise.description,
    equipment: exercise.equipement,
    gif: exercise.gif,
    tags: exercise.exercices_tags.map((et) => ({
      id: et.tags.id_tag,
      name: et.tags.nom,
    })),
    usageStats,
  };

  return {
    exercise: formattedExercise, // Imbriquer l'exercice pour correspondre à l'interface ExerciseResponse
  };
};

/**
 * Créer un nouvel exercice
 */
const createExercise = async ({
  name,
  description,
  equipment,
  gif,
  tagIds,
}) => {
  const newExercise = await prisma.exercices.create({
    data: {
      nom: name,
      description,
      equipement: equipment,
      gif,
      exercices_tags: {
        create: tagIds.map((tagId) => ({
          id_tag: parseInt(tagId),
        })),
      },
    },
    include: {
      exercices_tags: {
        include: {
          tags: true,
        },
      },
    },
  });

  // Format the response to match frontend expectations
  const formattedExercise = {
    id: newExercise.id_exercice,
    name: newExercise.nom,
    description: newExercise.description,
    equipment: newExercise.equipement,
    gif: newExercise.gif,
    tags: newExercise.exercices_tags.map((et) => ({
      id: et.tags.id_tag,
      name: et.tags.nom,
    })),
    usageStats: {
      sessions: 0,
      programs: 0,
    },
  };

  return {
    exercise: formattedExercise,
  };
};

/**
 * Mettre à jour un exercice existant
 */
const updateExercise = async (
  id,
  { name, description, equipment, gif, tagIds }
) => {
  const updatedExercise = await prisma.exercices.update({
    where: { id_exercice: parseInt(id) },
    data: {
      nom: name,
      description,
      equipement: equipment,
      gif,
      exercices_tags: {
        deleteMany: {},
        create: tagIds.map((tagId) => ({
          id_tag: parseInt(tagId),
        })),
      },
    },
    include: {
      exercices_tags: {
        include: {
          tags: true,
        },
      },
    },
  });

  // Format the response to match frontend expectations
  const formattedExercise = {
    id: updatedExercise.id_exercice,
    name: updatedExercise.nom,
    description: updatedExercise.description,
    equipment: updatedExercise.equipement,
    gif: updatedExercise.gif,
    tags: updatedExercise.exercices_tags.map((et) => ({
      id: et.tags.id_tag,
      name: et.tags.nom,
    })),
  };

  // Récupérer les statistiques d'utilisation
  const usageStats = await getExerciseUsageStats(id);
  formattedExercise.usageStats = usageStats;

  return {
    exercise: formattedExercise,
  };
};

/**
 * Supprimer un exercice
 */
const deleteExercise = async (id) => {
  const exerciseId = parseInt(id);

  // Vérifier si l'exercice est utilisé dans des séances
  const usageInSessions = await prisma.exercices_seances.count({
    where: { id_exercice: exerciseId },
  });

  // Si l'exercice est utilisé, ne pas autoriser la suppression
  if (usageInSessions > 0) {
    return {
      success: false,
      error: "EXERCISE_IN_USE",
      message: `Impossible de supprimer cet exercice car il est utilisé dans ${usageInSessions} séance(s)`,
      usageStats: {
        sessions: usageInSessions,
      },
    };
  }

  // D'abord supprimer les relations dans exercices_tags
  await prisma.exercices_tags.deleteMany({
    where: { id_exercice: exerciseId },
  });

  // Ensuite supprimer l'exercice
  const deletedExercise = await prisma.exercices.delete({
    where: { id_exercice: exerciseId },
  });

  return {
    success: true,
    deletedExercise,
  };
};

module.exports = {
  getAllExercises,
  getExerciseById,
  createExercise,
  updateExercise,
  deleteExercise,
};
