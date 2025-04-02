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


module.exports = {
    getUserPrograms, 
};

