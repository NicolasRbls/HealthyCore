const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Récupérer tous les exercices avec pagination, recherche et filtre par tag
 */
const getAllExercises = async ({ page = 1, limit = 20, search = '', tagId = null }) => {
  const where = {};

  if (search) {
    where.OR = [
      { nom: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } }
    ];
  }

  if (tagId) {
    where.exercices_tags = {
      some: { id_tag: parseInt(tagId) }
    };
  }

  const skip = (page - 1) * limit;

  const [exercises, total] = await Promise.all([
    prisma.exercices.findMany({
      where,
      skip,
      take: limit,
      orderBy: { nom: 'asc' },
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
                nom: true
              }
            }
          }
        }
      }
    }),
    prisma.exercices.count({ where })
  ]);

  const formatted = exercises.map(ex => ({
    id: ex.id_exercice,
    name: ex.nom,
    description: ex.description,
    equipment: ex.equipement,
    gif: ex.gif,
    tags: ex.exercices_tags.map(et => ({
      id: et.tags.id_tag,
      name: et.tags.nom
    }))
  }));

  const totalPages = Math.ceil(total / limit);

  return {
    exercises: formatted,
    pagination: {
      total,
      totalPages,
      currentPage: page,
      limit
    }
  };
};

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
              nom: true
            }
          }
        }
      }
    }
  });

  if (!exercise) return null;

  return {
    id: exercise.id_exercice,
    name: exercise.nom,
    description: exercise.description,
    equipment: exercise.equipement,
    gif: exercise.gif,
    tags: exercise.exercices_tags.map(et => ({
      id: et.tags.id_tag,
      name: et.tags.nom
    }))
  };
};

const createExercise = async ({ name, description, equipment, gif, tags }) => {
  const newExercise = await prisma.exercices.create({
    data: {
      nom: name,
      description,
      equipement: equipment,
      gif,
      exercices_tags: {
        create: tags.map(tagId => ({
          id_tag: parseInt(tagId)
        }))
      }
    }
  });

  return newExercise;
};

const updateExercise = async (id, { name, description, equipment, gif, tags }) => {
  const updatedExercise = await prisma.exercices.update({
    where: { id_exercice: parseInt(id) },
    data: {
      nom: name,
      description,
      equipement: equipment,
      gif,
      exercices_tags: {
        deleteMany: {},
        create: tags.map(tagId => ({
          id_tag: parseInt(tagId)
        }))
      }
    }
  });

  return updatedExercise;
};

const deleteExercise = async (id) => {
  const deletedExercise = await prisma.exercices.delete({
    where: { id_exercice: parseInt(id) }
  });

  return deletedExercise;
}

module.exports = { 
    getAllExercises,
    getExerciseById,
    createExercise,
    updateExercise,
    deleteExercise
};