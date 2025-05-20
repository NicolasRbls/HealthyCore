const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Récupérer tous les programmes avec pagination, recherche et filtre par tag
 */
const getAllPrograms = async ({
  page = 1,
  limit = 20,
  search = "",
  tagId = null,
}) => {
  const where = {};

  if (search) {
    where.nom = { contains: search, mode: "insensitive" };
  }

  if (tagId) {
    where.programmes_tags = {
      some: { id_tag: parseInt(tagId) },
    };
  }

  const skip = (page - 1) * limit;

  const [programs, total] = await Promise.all([
    prisma.programmes.findMany({
      where,
      skip,
      take: limit,
      orderBy: { nom: "asc" },
      select: {
        id_programme: true,
        nom: true,
        image: true,
        duree: true,
        id_user: true,
        users: {
          select: {
            id_user: true,
            prenom: true,
            nom: true,
          },
        },
        seances_programmes: {
          select: { id_seance_programme: true },
        },
        programmes_tags: {
          select: {
            tags: {
              select: {
                id_tag: true,
                nom: true,
                type: true,
              },
            },
          },
        },
      },
    }),
    prisma.programmes.count({ where }),
  ]);

  // Format programs to match frontend expectations
  const formatted = programs.map((program) => ({
    id_programme: program.id_programme,
    nom: program.nom,
    image: program.image,
    duration: program.duree,
    createdBy: program.users
      ? {
          id: program.users.id_user,
          name: `${program.users.prenom} ${program.users.nom}`,
        }
      : undefined,
    sessionCount: program.seances_programmes.length,
    tags: program.programmes_tags.map((pt) => ({
      id_tag: pt.tags.id_tag,
      nom: pt.tags.nom,
      type: pt.tags.type,
    })),
  }));

  return {
    programs: formatted,
    pagination: {
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      limit,
    },
  };
};

const getProgramById = async (id) => {
  const program = await prisma.programmes.findUnique({
    where: { id_programme: parseInt(id) },
    select: {
      id_programme: true,
      nom: true,
      image: true,
      duree: true,
      id_user: true,
      users: {
        select: {
          id_user: true,
          prenom: true,
          nom: true,
        },
      },
      seances_programmes: {
        orderBy: { ordre_seance: "asc" },
        select: {
          id_seance_programme: true,
          id_seance: true,
          ordre_seance: true,
          seances: {
            select: {
              id_seance: true,
              nom: true,
              exercices_seances: {
                select: { id_exercice_seance: true },
              },
            },
          },
        },
      },
      programmes_tags: {
        select: {
          tags: {
            select: {
              id_tag: true,
              nom: true,
              type: true,
            },
          },
        },
      },
      programmes_utilisateurs: {
        select: { id_programme_utilisateur: true },
      },
    },
  });

  if (!program) return null;

  // Format to match frontend expectations
  return {
    program: {
      id_programme: program.id_programme,
      nom: program.nom,
      image: program.image,
      duration: program.duree,
      createdBy: program.users
        ? {
            id: program.users.id_user,
            name: `${program.users.prenom} ${program.users.nom}`,
          }
        : undefined,
      sessions: program.seances_programmes.map((sp) => ({
        id: sp.seances.id_seance,
        orderInProgram: sp.ordre_seance,
        name: sp.seances.nom,
        exerciseCount: sp.seances.exercices_seances.length,
      })),
      tags: program.programmes_tags.map((pt) => ({
        id_tag: pt.tags.id_tag,
        nom: pt.tags.nom,
        type: pt.tags.type,
      })),
      usageStats: {
        users: program.programmes_utilisateurs.length,
      },
    },
  };
};

const createProgram = async (
  userId,
  { name, image, duration, tagIds, sessions }
) => {
  // 1. Créer le programme
  const program = await prisma.programmes.create({
    data: {
      nom: name,
      image,
      duree: duration,
      id_user: userId,
    },
  });

  // 2. Associer les tags
  if (Array.isArray(tagIds) && tagIds.length > 0) {
    await prisma.programmes_tags.createMany({
      data: tagIds.map((id_tag) => ({
        id_programme: program.id_programme,
        id_tag,
      })),
    });
  }

  // 3. Vérifier que toutes les séances existent
  const sessionIds = sessions.map((sess) => sess.sessionId);
  const existingSessions = await prisma.seances.findMany({
    where: { id_seance: { in: sessionIds } },
    select: { id_seance: true },
  });

  if (existingSessions.length !== sessionIds.length) {
    throw new Error("Une ou plusieurs séances n'existent pas");
  }

  // 4. Associer les séances au programme
  if (Array.isArray(sessions) && sessions.length > 0) {
    await prisma.seances_programmes.createMany({
      data: sessions.map((sess) => ({
        id_programme: program.id_programme,
        id_seance: sess.sessionId,
        ordre_seance: sess.order,
      })),
    });
  }

  // 5. Récupérer le programme créé avec ses relations
  return await getProgramById(program.id_programme);
};

const updateProgram = async (
  id,
  { name, image, duration, tagIds, sessions }
) => {
  const programId = parseInt(id);

  // 1. Vérifier que le programme existe
  const existingProgram = await prisma.programmes.findUnique({
    where: { id_programme: programId },
  });

  if (!existingProgram) {
    return null;
  }

  // 2. Mise à jour du programme
  await prisma.programmes.update({
    where: { id_programme: programId },
    data: {
      nom: name,
      image,
      duree: duration,
    },
  });

  // 3. Mise à jour des tags
  if (Array.isArray(tagIds)) {
    // Supprimer les associations existantes
    await prisma.programmes_tags.deleteMany({
      where: { id_programme: programId },
    });

    // Créer les nouvelles associations
    if (tagIds.length > 0) {
      await prisma.programmes_tags.createMany({
        data: tagIds.map((id_tag) => ({
          id_programme: programId,
          id_tag,
        })),
      });
    }
  }

  // 4. Mise à jour des séances
  if (Array.isArray(sessions)) {
    // Supprimer les associations existantes
    await prisma.seances_programmes.deleteMany({
      where: { id_programme: programId },
    });

    // Créer les nouvelles associations
    if (sessions.length > 0) {
      await prisma.seances_programmes.createMany({
        data: sessions.map((sess) => ({
          id_programme: programId,
          id_seance: sess.sessionId,
          ordre_seance: sess.order,
        })),
      });
    }
  }

  // 5. Récupérer le programme mis à jour avec ses relations
  return await getProgramById(programId);
};

const deleteProgram = async (id) => {
  const programId = parseInt(id);

  // Supprimer toutes les associations avant de supprimer le programme
  await prisma.$transaction([
    prisma.seances_programmes.deleteMany({
      where: { id_programme: programId },
    }),
    prisma.programmes_tags.deleteMany({
      where: { id_programme: programId },
    }),
    prisma.programmes_utilisateurs.deleteMany({
      where: { id_programme: programId },
    }),
  ]);

  // Supprimer le programme
  const deletedProgram = await prisma.programmes.delete({
    where: { id_programme: programId },
  });

  return deletedProgram;
};

module.exports = {
  getAllPrograms,
  getProgramById,
  createProgram,
  updateProgram,
  deleteProgram,
};
