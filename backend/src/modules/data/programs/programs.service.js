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

/**
 * Démarrer un programme pour l'utilisateur
 * @param {number} userId - ID de l'utilisateur
 * @param {number} programId - ID du programme
 * @param {string|null} startDate - Date de début (au format ISO 8601)
 * @return {Promise<Object>} - Détails du programme démarré
 */
const startProgram = async (userId, programId, startDate = null) => {
    try {
      const program = await prisma.programmes.findUnique({
        where: { id_programme: programId },
        include: {
          seances_programmes: {
            include: { seances: true },
            orderBy: { ordre_seance: "asc" },
          },
        },
      });
  
      if (!program) throw new AppError("Programme non trouvé", 404, "PROGRAM_NOT_FOUND");
  
      const existing = await prisma.programmes_utilisateurs.findFirst({
        where: {
          id_user: userId,
          id_programme: programId,
          date_fin: { gte: new Date() },
        },
      });
  
      if (existing)
        throw new AppError("Vous suivez déjà ce programme", 409, "PROGRAM_ALREADY_STARTED");
  
      const actualStartDate = startDate ? new Date(startDate) : new Date();
      actualStartDate.setHours(0, 0, 0, 0);
  
      const endDate = new Date(actualStartDate);
      endDate.setDate(endDate.getDate() + program.duree);
  
      const userProgram = await prisma.programmes_utilisateurs.create({
        data: {
          id_user: userId,
          id_programme: programId,
          date_debut: actualStartDate,
          date_fin: endDate,
        },
      });
  
      let nextSession = null;
      if (program.seances_programmes.length > 0) {
        const now = new Date();
        const firstSessionDate = new Date(actualStartDate);
        if (now.getHours() >= 18) firstSessionDate.setDate(firstSessionDate.getDate() + 1);
  
        nextSession = {
          id: program.seances_programmes[0].seances.id_seance,
          name: program.seances_programmes[0].seances.nom,
          date: firstSessionDate,
        };
      }
  
      return {
        id: userProgram.id_programme_utilisateur,
        programId: program.id_programme,
        programName: program.nom,
        startDate: userProgram.date_debut,
        endDate: userProgram.date_fin,
        progressPercentage: 0,
        nextSession,
      };
    } catch (err) {
      throw err;
    }
  };
  
/**
 * Récupérer les séances de l'utilisateur
 * @param {number} page - Numéro de la page
 * @param {number} limit - Nombre d'éléments par page
 * @param {number|null} tagId - ID du tag (optionnel)
 * @return {Promise<Object>} - Détails des séances de l'utilisateur
 * @throws {Error} - Si une erreur se produit lors de la récupération des séances
 */
  const getUserSessions = async (page = 1, limit = 10, tagId = null) => {
    try {
      const skip = (page - 1) * limit;
  
      let whereClause = {};
      if (tagId) {
        whereClause = {
          seances_tags: {
            some: {
              id_tag: parseInt(tagId)
            }
          }
        };
      }
  
      const [sessions, total] = await Promise.all([
        prisma.seances.findMany({
          where: whereClause,
          include: {
            exercices_seances: {
              include: { exercices: true }
            },
            seances_tags: {
              include: { tags: true }
            }
          },
          skip,
          take: limit,
          orderBy: { nom: "asc" }
        }),
        prisma.seances.count({ where: whereClause })
      ]);
  
      const transformedSessions = sessions.map(session => {
        let estimatedDuration = 0;
        session.exercices_seances.forEach(es => {
          if (es.duree > 0) {
            estimatedDuration += es.duree;
          } else {
            estimatedDuration += (es.series || 1) * 1; // 1 min/série
          }
        });
  
        let level = "Intermédiaire";
        const tags = session.seances_tags.map(st => st.tags.nom.toLowerCase());
        if (tags.some(tag => tag.includes("débutant"))) level = "Débutant";
        else if (tags.some(tag => tag.includes("avancé"))) level = "Avancé";
  
        return {
          id: session.id_seance,
          name: session.nom,
          exerciseCount: session.exercices_seances.length,
          estimatedDuration,
          level,
          tags: session.seances_tags.map(st => ({
            id: st.tags.id_tag,
            name: st.tags.nom
          }))
        };
      });
  
      const totalPages = Math.ceil(total / limit);
  
      return {
        sessions: transformedSessions,
        pagination: {
          total,
          totalPages,
          currentPage: page,
          limit
        }
      };
    } catch (error) {
      throw error;
    }
  };


/**
 * Récupérer les détails d'une séance spécifique
 * @param {number} sessionId - ID de la séance
 * @return {Promise<Object>} - Détails de la séance
 * @throws {Error} - Si une erreur se produit lors de la récupération des détails
 */
  const getSessionDetails = async (sessionId) => {
    try {
      const session = await prisma.seances.findUnique({
        where: { id_seance: sessionId },
        include: {
          seances_tags: {
            include: {
              tags: true
            }
          },
          exercices_seances: {
            include: {
              exercices: true
            },
            orderBy: {
              ordre_exercice: 'asc'
            }
          }
        }
      });
  
      if (!session) {
        throw new AppError("Séance non trouvée", 404, "SESSION_NOT_FOUND");
      }
  
      let estimatedDuration = 0;
      session.exercices_seances.forEach(es => {
        if (es.duree > 0) {
          estimatedDuration += es.duree;
        } else {
          const setsCount = es.series || 1;
          estimatedDuration += setsCount * 1;
        }
      });
  
      let level = "Intermédiaire";
      const tags = session.seances_tags.map(st => st.tags.nom.toLowerCase());
      if (tags.some(tag => tag.includes("débutant"))) {
        level = "Débutant";
      } else if (tags.some(tag => tag.includes("avancé"))) {
        level = "Avancé";
      }
  
      return {
        id: session.id_seance,
        name: session.nom,
        description: "Une séance d'entraînement complète et efficace.",
        level,
        estimatedDuration,
        tags: session.seances_tags.map(st => ({
          id: st.tags.id_tag,
          name: st.tags.nom
        })),
        exercises: session.exercices_seances.map(es => ({
          id: es.exercices.id_exercice,
          name: es.exercices.nom,
          order: es.ordre_exercice,
          sets: es.series,
          repetitions: es.repetitions,
          duration: es.duree,
          description: es.exercices.description,
          equipment: es.exercices.equipement,
          gif: es.exercices.gif
        }))
      };
    } catch (error) {
      throw error;
    }
  };
  

/**
 * Récupérer les progrès sportifs de l'utilisateur
 * @param {number} userId - ID de l'utilisateur
 * @return {Promise<Object>} - Progrès sportifs de l'utilisateur
 * @throws {Error} - Si une erreur se produit lors de la récupération des progrès
 */
const getSportProgress = async (userId) => {
  try {
    const activeUserProgram = await prisma.programmes_utilisateurs.findFirst({
      where: {
        id_user: userId,
        date_fin: {
          gte: new Date(),
        },
      },
      include: {
        programmes: {
          include: {
            seances_programmes: {
              include: {
                seances: true,
              },
              orderBy: {
                ordre_seance: 'asc',
              },
            },
          },
        },
      },
      orderBy: {
        date_debut: 'desc',
      },
    });

    if (!activeUserProgram) {
      return {
        activeProgram: null,
        weeklySchedule: generateEmptyWeekSchedule(),
        recentSessions: [],
      };
    }

    const sportFollowUps = await prisma.suivis_sportifs.findMany({
      where: {
        id_user: userId,
        date: {
          gte: activeUserProgram.date_debut,
          lte: new Date(),
        },
        seances: {
          seances_programmes: {
            some: {
              id_programme: activeUserProgram.id_programme,
            },
          },
        },
      },
      include: {
        seances: true,
      },
      orderBy: {
        date: 'desc',
      },
      take: 10,
    });

    const today = new Date();
    const startDate = new Date(activeUserProgram.date_debut);
    const endDate = new Date(activeUserProgram.date_fin);
    const daysPassed = Math.floor((today - startDate) / 86400000);
    const totalDays = Math.floor((endDate - startDate) / 86400000);
    const totalSessions = activeUserProgram.programmes.seances_programmes.length;
    const completedSessions = sportFollowUps.length;

    const expectedSessions = Math.round((daysPassed / totalDays) * totalSessions);

    const sessionProgressPercentage = expectedSessions > 0
      ? Math.min(Math.round((completedSessions / expectedSessions) * 100), 100)
      : 0;

    const weeklySchedule = generateWeekSchedule(
      activeUserProgram.programmes.seances_programmes,
      sportFollowUps
    );

    const recentSessions = sportFollowUps.map(followUp => ({
      id: followUp.id_suivi_sportif,
      sessionId: followUp.id_seance,
      name: followUp.seances.nom,
      date: followUp.date,
      completed: true,
    }));

    return {
      activeProgram: {
        id: activeUserProgram.id_programme,
        name: activeUserProgram.programmes.nom,
        startDate: activeUserProgram.date_debut,
        endDate: activeUserProgram.date_fin,
        progressPercentage: sessionProgressPercentage,
        completedSessions,
        totalSessions: Math.min(expectedSessions, totalSessions),
      },
      weeklySchedule,
      recentSessions,
    };
  } catch (error) {
    throw error;
  }
};

const generateWeekSchedule = (programSessions, sportFollowUps) => {
  const daysOfWeek = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
  const today = new Date();
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);
  monday.setHours(0, 0, 0, 0);

  const weekSchedule = [];

  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(monday);
    currentDate.setDate(monday.getDate() + i);
    const dateString = currentDate.toISOString().split('T')[0];

    let sessionForDay = null;

    if (i % 2 === 0 && i < 6) {
      const sessionIndex = Math.floor(i / 2);

      if (sessionIndex < programSessions.length) {
        const programSession = programSessions[sessionIndex];

        const isCompleted = sportFollowUps.some(followUp => {
          const followUpDate = new Date(followUp.date);
          const followUpDateString = followUpDate.toISOString().split('T')[0];
          return followUpDateString === dateString && followUp.id_seance === programSession.id_seance;
        });

        sessionForDay = {
          id: programSession.seances.id_seance,
          name: programSession.seances.nom,
          order: programSession.ordre_seance,
          completed: isCompleted,
        };
      }
    }

    weekSchedule.push({
      day: daysOfWeek[i],
      date: dateString,
      session: sessionForDay,
    });
  }

  return weekSchedule;
};

const generateEmptyWeekSchedule = () => {
  const daysOfWeek = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
  const today = new Date();
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);
  monday.setHours(0, 0, 0, 0);

  const weekSchedule = [];

  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(monday);
    currentDate.setDate(monday.getDate() + i);
    const dateString = currentDate.toISOString().split('T')[0];

    weekSchedule.push({
      day: daysOfWeek[i],
      date: dateString,
      session: null,
    });
  }

  return weekSchedule;
};

/**
 * Marquer une séance comme terminée
 * @param {number} userId - ID de l'utilisateur
 * @param {number} sessionId - ID de la séance
 * @param {string|null} date - Date de la séance (au format ISO 8601)
 * @return {Promise<Object>} - Détails de la séance marquée comme terminée
 * @throws {Error} - Si une erreur se produit lors de la mise à jour de la séance
 */
const completeSession = async (userId, sessionId, date = null) => {
    try {
      const session = await prisma.seances.findUnique({
        where: { id_seance: sessionId }
      });
  
      if (!session) {
        throw new AppError("Séance non trouvée", 404, "SESSION_NOT_FOUND");
      }
  
      const completionDate = date ? new Date(date) : new Date();
      completionDate.setHours(0, 0, 0, 0);
  
      const existingCompletion = await prisma.suivis_sportifs.findFirst({
        where: {
          id_user: userId,
          id_seance: sessionId,
          date: completionDate
        }
      });
  
      if (existingCompletion) {
        throw new AppError(
          "Cette séance a déjà été marquée comme terminée pour cette date",
          409,
          "SESSION_ALREADY_COMPLETED"
        );
      }
  
      const sportFollowUp = await prisma.suivis_sportifs.create({
        data: {
          id_user: userId,
          id_seance: sessionId,
          date: completionDate
        }
      });
  
      let dailyObjectiveCompleted = false;
      const sportObjective = await prisma.objectifs.findFirst({
        where: {
          titre: { contains: "séance de sport", mode: "insensitive" }
        }
      });
  
      if (sportObjective) {
        const existingObjective = await prisma.objectifs_utilisateurs.findFirst({
          where: {
            id_user: userId,
            id_objectif: sportObjective.id_objectif,
            date: completionDate
          }
        });
  
        if (existingObjective) {
          if (existingObjective.statut !== "done") {
            await prisma.objectifs_utilisateurs.update({
              where: { id_objectif_utilisateur: existingObjective.id_objectif_utilisateur },
              data: { statut: "done" }
            });
            dailyObjectiveCompleted = true;
          }
        } else {
          await prisma.objectifs_utilisateurs.create({
            data: {
              id_user: userId,
              id_objectif: sportObjective.id_objectif,
              date: completionDate,
              statut: "done"
            }
          });
          dailyObjectiveCompleted = true;
        }
      }
  
      return {
        id: sportFollowUp.id_suivi_sportif,
        sessionId: sessionId,
        date: completionDate,
        sessionName: session.nom,
        dailyObjective: {
          completed: dailyObjectiveCompleted
        }
      };
    } catch (error) {
      throw error;
    }
  };
  
/**
 * Récupérer la séance du jour pour un utilisateur
 * @param {number} userId - ID de l'utilisateur
 * @return {Promise<Object|null>} - Détails de la séance du jour ou null si aucune séance n'est prévue
 * @throws {Error} - Si une erreur se produit lors de la récupération de la séance
 */
const getTodaySession = async (userId) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
  
      // 1. Récupérer le programme actif
      const activeUserProgram = await prisma.programmes_utilisateurs.findFirst({
        where: {
          id_user: userId,
          date_debut: { lte: today },
          date_fin: { gte: today }
        },
        include: {
          programmes: {
            include: {
              seances_programmes: {
                include: {
                  seances: {
                    include: {
                      exercices_seances: {
                        include: { exercices: true },
                        orderBy: { ordre_exercice: "asc" }
                      }
                    }
                  }
                },
                orderBy: { ordre_seance: "asc" }
              }
            }
          }
        }
      });
  
      if (!activeUserProgram || activeUserProgram.programmes.seances_programmes.length === 0) {
        return null;
      }
  
      // 2. Toujours renvoyer la première séance (pas de mapping jour complexe)
      const todaySession = activeUserProgram.programmes.seances_programmes[0];
  
      return {
        id: todaySession.seances.id_seance,
        name: todaySession.seances.nom,
        program: {
          id: activeUserProgram.id_programme,
          name: activeUserProgram.programmes.nom
        },
        completed: false,
        exercises: todaySession.seances.exercices_seances.map(es => ({
          id: es.exercices.id_exercice,
          name: es.exercices.nom,
          order: es.ordre_exercice,
          sets: es.series,
          repetitions: es.repetitions,
          duration: es.duree,
          description: es.exercices.description,
          equipment: es.exercices.equipement,
          gif: es.exercices.gif
        }))
      };
    } catch (error) {
      console.error("❌ Erreur dans getTodaySession:", error);
      throw error;
    }
  };
  
module.exports = {
    getUserPrograms,
    getProgramDetails, 
    startProgram,
    getUserSessions,
    getSessionDetails,
    getSportProgress,
    completeSession,
    getTodaySession,
};

