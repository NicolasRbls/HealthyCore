const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { AppError } = require("../../../utils/response.utils");

/**
 * 
 * @param {*} userId 
 * @param {*} page 
 * @param {*} limit 
 * @param {*} tagId 
 * @returns 
 */
const getUserPrograms = async (userId, page = 1, limit = 10, tagId = null) => {
  const skip = (page - 1) * limit;

  const userPreferences = await prisma.preferences.findFirst({
    where: { id_user: userId },
    include: {
      preferences_activites: {
        include: {
          activites: true,
        },
      },
    },
  });

  const userActivePrograms = await prisma.programmes_utilisateurs.findMany({
    where: {
      id_user: userId,
      date_fin: {
        gte: new Date(),
      },
    },
    select: {
      id_programme: true,
    },
  });

  const activeProgramIds = userActivePrograms.map(p => p.id_programme);

  let whereClause = {};
  if (tagId) {
    whereClause = {
      programmes_tags: {
        some: {
          id_tag: parseInt(tagId),
        },
      },
    };
  }

  const [programs, total] = await Promise.all([
    prisma.programmes.findMany({
      where: whereClause,
      include: {
        programmes_tags: {
          include: {
            tags: true,
          },
        },
        seances_programmes: true,
      },
      skip,
      take: limit,
      orderBy: { nom: "asc" },
    }),
    prisma.programmes.count({ where: whereClause }),
  ]);

  const transformedPrograms = programs.map(program => ({
    id: program.id_programme,
    name: program.nom,
    image: program.image,
    duration: program.duree,
    sessionCount: program.seances_programmes.length,
    tags: program.programmes_tags.map(pt => ({
      id: pt.tags.id_tag,
      name: pt.tags.nom,
    })),
    inProgress: activeProgramIds.includes(program.id_programme),
  }));

  let recommendedPrograms = [];

  if (userPreferences) {
    const userActivityIds = userPreferences.preferences_activites.map(pa => pa.id_activite);

    const allPrograms = await prisma.programmes.findMany({
      include: {
        programmes_tags: {
          include: {
            tags: true,
          },
        },
        seances_programmes: true,
      },
    });

    recommendedPrograms = allPrograms
      .map(program => {
        let matchScore = 0;
        const programTags = program.programmes_tags.map(pt => pt.tags.nom.toLowerCase());

        userPreferences.preferences_activites.forEach(pa => {
          const activity = pa.activites.nom.toLowerCase();
          if (programTags.some(tag => tag.includes(activity) || activity.includes(tag))) {
            matchScore += 30;
          }
        });

        const userSessionsPerWeek = userPreferences.seances_par_semaines;
        const programSessionsPerWeek = Math.ceil(program.seances_programmes.length / (program.duree / 7));

        if (programSessionsPerWeek <= userSessionsPerWeek) {
          matchScore += 20;
        } else {
          matchScore -= 10;
        }

        if (!activeProgramIds.includes(program.id_programme)) {
          matchScore += 15;
        }

        matchScore = Math.min(Math.max(matchScore, 0), 100);

        return {
          id: program.id_programme,
          name: program.nom,
          image: program.image,
          duration: program.duree,
          sessionCount: program.seances_programmes.length,
          tags: program.programmes_tags.map(pt => ({
            id: pt.tags.id_tag,
            name: pt.tags.nom,
          })),
          inProgress: activeProgramIds.includes(program.id_programme),
          matchScore,
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 3);
  }

  const totalPages = Math.ceil(total / limit);

  return {
    recommendedPrograms,
    programs: transformedPrograms,
    pagination: {
      total,
      totalPages,
      currentPage: page,
      limit,
    },
  };
};


/**
 * Récupérer les détails d'un programme spécifique
 * @param {number} userId - ID de l'utilisateur
 * @param {number} programId - ID du programme
 * @return {Promise<Object>} - Détails du programme
 */
const getProgramDetails = async (userId, programId) => {
    const program = await prisma.programmes.findUnique({
      where: { id_programme: programId },
      include: {
        programmes_tags: { include: { tags: true } },
        seances_programmes: {
          orderBy: { ordre_seance: "asc" },
          include: {
            seances: {
              include: {
                exercices_seances: {
                  orderBy: { ordre_exercice: "asc" },
                  include: { exercices: true },
                },
              },
            },
          },
        },
      },
    });
  
    if (!program) {
      throw new AppError("Programme non trouvé", 404, "PROGRAM_NOT_FOUND");
    }
  
    const userProgram = await prisma.programmes_utilisateurs.findFirst({
      where: {
        id_user: userId,
        id_programme: programId,
        date_fin: { gte: new Date() },
      },
    });
  
    const inProgress = !!userProgram;
    let userProgress = null;
  
    if (inProgress) {
      const completedSessions = await prisma.suivis_sportifs.count({
        where: {
          id_user: userId,
          seances: {
            seances_programmes: {
              some: { id_programme: programId },
            },
          },
          date: {
            gte: userProgram.date_debut,
            lte: new Date(),
          },
        },
      });
  
      const daysSinceStart = Math.floor((new Date() - new Date(userProgram.date_debut)) / (1000 * 60 * 60 * 24));
      const totalSessions = program.seances_programmes.length;
      const expectedSessions = Math.min(
        Math.ceil((daysSinceStart / program.duree) * totalSessions),
        totalSessions
      );
  
      userProgress = {
        startDate: userProgram.date_debut,
        endDate: userProgram.date_fin,
        completedSessions,
        totalSessions: expectedSessions,
        progressPercentage: expectedSessions > 0
          ? Math.round((completedSessions / expectedSessions) * 100)
          : 0,
      };
    }
  
    return {
      id: program.id_programme,
      name: program.nom,
      image: program.image,
      duration: program.duree,
      description: program.description || "Programme détaillé pour améliorer votre condition physique.",
      tags: program.programmes_tags.map(pt => ({
        id: pt.tags.id_tag,
        name: pt.tags.nom,
      })),
      sessions: program.seances_programmes.map(sp => ({
        id: sp.seances.id_seance,
        name: sp.seances.nom,
        order: sp.ordre_seance,
        exerciseCount: sp.seances.exercices_seances.length,
        exercises: sp.seances.exercices_seances.map(es => ({
          id: es.exercices.id_exercice,
          name: es.exercices.nom,
          order: es.ordre_exercice,
          sets: es.series,
          repetitions: es.repetitions,
          duration: es.duree,
        })),
      })),
      inProgress,
      userProgress,
    };
  };
  

module.exports = {
    getUserPrograms,
    getProgramDetails, 
};

