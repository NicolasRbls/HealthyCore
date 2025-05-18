const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Récupérer tous les programmes avec pagination, recherche et filtre par tag
 */
const getAllPrograms = async ({ page = 1, limit = 20, search = '', tagId = null }) => {
  const where = {};

  if (search) {
    where.nom = { contains: search, mode: 'insensitive' };
  }

  if (tagId) {
    where.programmes_tags = {
      some: { id_tag: parseInt(tagId) }
    };
  }

  const skip = (page - 1) * limit;

  const [programs, total] = await Promise.all([
    prisma.programmes.findMany({
      where,
      skip,
      take: limit,
      orderBy: { nom: 'asc' },
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
            nom: true
          }
        },
        seances_programmes: {
          select: { id_seance_programme: true }
        },
        programmes_tags: {
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
    prisma.programmes.count({ where })
  ]);

  const formatted = programs.map(program => ({
    id: program.id_programme,
    name: program.nom,
    image: program.image,
    duration: program.duree,
    createdBy: {
      id: program.users?.id_user,
      name: program.users ? `${program.users.prenom} ${program.users.nom}` : null
    },
    sessionCount: program.seances_programmes.length,
    tags: program.programmes_tags.map(pt => ({
      id: pt.tags.id_tag,
      name: pt.tags.nom
    }))
  }));

  const totalPages = Math.ceil(total / limit);

  return {
    programs: formatted,
    pagination: {
      total,
      totalPages,
      currentPage: page,
      limit
    }
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
          nom: true
        }
      },
      seances_programmes: {
        select: {
            id_seance_programme: true,
            id_seance: true,
            ordre_seance: true,
        }
      },
      programmes_tags: {
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

  return program;
}

const createProgram = async (userId, { name, image, duration, tagIds, sessions }) => {
  // 1. Créer le programme
  const program = await prisma.programmes.create({
    data: {
      nom: name,
      image,
      duree: duration,
      id_user: userId
    }
  });

  // 2. Associer les tags
  if (Array.isArray(tagIds) && tagIds.length > 0) {
    await prisma.programmes_tags.createMany({
      data: tagIds.map(id_tag => ({
        id_programme: program.id_programme,
        id_tag
      }))
    });
  }
  
  const sessionIds = sessions.map(sess => sess.sessionId);
  const existingSessions = await prisma.seances.findMany({
    where: { id_seance: { in: sessionIds } },
    select: { id_seance: true }
  });
  if (existingSessions.length !== sessionIds.length) {
    throw new Error("Une ou plusieurs séances n'existent pas");
  }

  // 3. Associer les séances au programme
  if (Array.isArray(sessions) && sessions.length > 0) {
    await prisma.seances_programmes.createMany({
      data: sessions.map(sess => ({
        id_programme: program.id_programme,
        id_seance: sess.sessionId,
        ordre_seance: sess.order
      }))
    });
  }

  // 4. Récupérer le programme complet pour le retour
  const createdProgram = await prisma.programmes.findUnique({
    where: { id_programme: program.id_programme },
    include: {
      programmes_tags: {
        select: {
          tags: { select: { id_tag: true, nom: true } }
        }
      },
      seances_programmes: {
        orderBy: { ordre_seance: 'asc' },
        include: {
          seances: {
            select: {
              id_seance: true,
              nom: true,
              exercices_seances: { select: { id_exercice_seance: true } }
            }
          }
        }
      }
    }
  });

  return {
    id: createdProgram.id_programme,
    name: createdProgram.nom,
    image: createdProgram.image,
    duration: createdProgram.duree,
    tags: createdProgram.programmes_tags.map(pt => ({
      id: pt.tags.id_tag,
      name: pt.tags.nom
    })),
    sessions: createdProgram.seances_programmes.map(sp => ({
      id: sp.seances.id_seance,
      orderInProgram: sp.ordre_seance,
      name: sp.seances.nom,
      exerciseCount: sp.seances.exercices_seances.length
    }))
  };
};

const updateProgram = async (id, data) => {
  const { name, image, duration, tagIds, sessions } = data;

  // Update the program
  const updatedProgram = await prisma.programmes.update({
    where: { id_programme: parseInt(id) },
    data: {
      nom: name,
      image,
      duree: duration
    }
  });

    if (Array.isArray(tagIds) && tagIds.length > 0) {
        await prisma.programmes_tags.deleteMany({
        where: { id_programme: updatedProgram.id_programme }
        });
    
        await prisma.programmes_tags.createMany({
        data: tagIds.map(id_tag => ({
            id_programme: updatedProgram.id_programme,
            id_tag
        }))
        });
    }

    if (Array.isArray(sessions) && sessions.length > 0) {
        await prisma.seances_programmes.deleteMany({
        where: { id_programme: updatedProgram.id_programme }
        });
    
        await prisma.seances_programmes.createMany({
        data: sessions.map(sess => ({
            id_programme: updatedProgram.id_programme,
            id_seance: sess.sessionId,
            ordre_seance: sess.order
        }))
        });
    }

  return updatedProgram;
};

const deleteProgram = async (id) => {

  await prisma.seances_programmes.deleteMany({
    where: { id_programme: parseInt(id) }
  });
  await prisma.programmes_tags.deleteMany({
    where: { id_programme: parseInt(id) }
  });
  await prisma.programmes_utilisateurs.deleteMany({
    where: { id_programme: parseInt(id) }
  });

  const deletedProgram = await prisma.programmes.delete({
    where: { id_programme: parseInt(id) }
  });

  return deletedProgram;
};

module.exports = {
  getAllPrograms,
  getProgramById,
  createProgram,
  updateProgram,
  deleteProgram
};