const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Récupérer toutes les séances avec pagination, recherche et filtre par tag
 */
const getAllSessions = async ({ page = 1, limit = 20, search = '', tagId = null }) => {
  const where = {};

  if (search) {
    where.nom = { contains: search, mode: 'insensitive' };
  }

  if (tagId) {
    where.seances_tags = {
      some: { id_tag: parseInt(tagId) }
    };
  }

  const skip = (page - 1) * limit;

  const [sessions, total] = await Promise.all([
    prisma.seances.findMany({
      where,
      skip,
      take: limit,
      orderBy: { nom: 'asc' },
      select: {
        id_seance: true,
        nom: true,
        id_user: true,
        users: {
          select: {
            id_user: true,
            prenom: true,
            nom: true
          }
        },
        exercices_seances: {
          select: { id_exercice_seance: true }
        },
        seances_tags: {
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
    prisma.seances.count({ where })
  ]);

  const formatted = sessions.map(seance => ({
    id: seance.id_seance,
    name: seance.nom,
    createdBy: {
      id: seance.users?.id_user,
      name: seance.users ? `${seance.users.prenom}` : null
    },
    exerciseCount: seance.exercices_seances.length,
    tags: seance.seances_tags.map(st => ({
      id: st.tags.id_tag,
      name: st.tags.nom
    }))
  }));

  const totalPages = Math.ceil(total / limit);

  return {
    sessions: formatted,
    pagination: {
      total,
      totalPages,
      currentPage: page,
      limit
    }
  };
};

const getSessionByIdWithExercises = async (id) => {
  const session = await prisma.seances.findUnique({
    where: { id_seance: id },
    include: {
      users: {
        select: {
          id_user: true,
          prenom: true,
          nom: true
        }
      },
      exercices_seances: {
        include: {
          exercices: {
            select: {
              id_exercice: true,
              nom: true,
              description: true,
              gif: true
            }
          }
        }
      },
      seances_tags: {
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

  if (!session) return null;

  return session;
};

const createSession = async (userId, { name, tagIds, exercises }) => {
  // 1. Créer la séance
  const session = await prisma.seances.create({
    data: {
      nom: name,
      id_user: userId
    }
  });

  // 2. Associer les tags
  if (Array.isArray(tagIds) && tagIds.length > 0) {
    await prisma.seances_tags.createMany({
      data: tagIds.map(id_tag => ({
        id_seance: session.id_seance,
        id_tag
      }))
    });
  }

  // 3. Associer les exercices à la séance
  if (Array.isArray(exercises) && exercises.length > 0) {
    await prisma.exercices_seances.createMany({
      data: exercises.map(ex => ({
        id_seance: session.id_seance,
        id_exercice: ex.exerciseId,
        ordre_exercice: ex.order,
        repetitions: ex.repetitions,
        series: ex.sets,
        duree: ex.duration
      }))
    });
  }

  // 4. Récupérer la séance complète pour le retour
  const createdSession = await prisma.seances.findUnique({
    where: { id_seance: session.id_seance },
    include: {
      seances_tags: {
        select: {
          tags: { select: { id_tag: true, nom: true } }
        }
      },
      exercices_seances: {
        include: {
          exercices: { select: { id_exercice: true, nom: true } }
        }
      }
    }
  });

  return {
    id: createdSession.id_seance,
    name: createdSession.nom,
    tags: createdSession.seances_tags.map(st => ({
      id: st.tags.id_tag,
      name: st.tags.nom
    })),
    exercises: createdSession.exercices_seances.map(es => ({
      id: es.exercices.id_exercice,
      orderInSession: es.ordre_exercice,
      name: es.exercices.nom,
      repetitions: es.repetitions,
      sets: es.series,
      duration: es.duree
    }))
  };
};

const updateSession = async (sessionId, { name, tagIds, exercises }) => {
  // 1. Mettre à jour le nom de la séance
  await prisma.seances.update({
    where: { id_seance: sessionId },
    data: { nom: name }
  });

  // 2. Mettre à jour les tags (supprimer puis recréer)
  await prisma.seances_tags.deleteMany({ where: { id_seance: sessionId } });
  if (Array.isArray(tagIds) && tagIds.length > 0) {
    await prisma.seances_tags.createMany({
      data: tagIds.map(id_tag => ({
        id_seance: sessionId,
        id_tag
      }))
    });
  }

  // 3. Mettre à jour les exercices (supprimer puis recréer)
  await prisma.exercices_seances.deleteMany({ where: { id_seance: sessionId } });
  if (Array.isArray(exercises) && exercises.length > 0) {
    await prisma.exercices_seances.createMany({
      data: exercises.map(ex => ({
        id_seance: sessionId,
        id_exercice: ex.exerciseId,
        ordre_exercice: ex.order,
        repetitions: ex.repetitions,
        series: ex.sets,
        duree: ex.duration
      }))
    });
  }

  // 4. Récupérer la séance complète pour le retour
  const updatedSession = await prisma.seances.findUnique({
    where: { id_seance: sessionId },
    include: {
      seances_tags: {
        select: {
          tags: { select: { id_tag: true, nom: true } }
        }
      },
      exercices_seances: {
        include: {
          exercices: { select: { id_exercice: true, nom: true } }
        }
      }
    }
  });

  return {
    id: updatedSession.id_seance,
    name: updatedSession.nom,
    tags: updatedSession.seances_tags.map(st => ({
      id: st.tags.id_tag,
      name: st.tags.nom
    })),
    exercises: updatedSession.exercices_seances.map(es => ({
      id: es.exercices.id_exercice,
      orderInSession: es.ordre_exercice,
      name: es.exercices.nom,
      repetitions: es.repetitions,
      sets: es.series,
      duration: es.duree
    }))
  };
};

const deleteSession = async (sessionId) => {
  // Supprimer les associations d'exercices
  await prisma.exercices_seances.deleteMany({ where: { id_seance: sessionId } });
  
  // Supprimer les associations de tags
  await prisma.seances_tags.deleteMany({ where: { id_seance: sessionId } });

  // Supprimer la séance
  await prisma.seances.delete({
    where: { id_seance: sessionId }
  });
}

module.exports = {
  getAllSessions,
  getSessionByIdWithExercises,
  createSession,
  updateSession,
  deleteSession
};