const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { AppError } = require("../../utils/response.utils");


/* 
 * Récupérer le profil utilisateur
 * @param {number} userId - ID de l'utilisateur
 * @returns {Object} - Profil utilisateur avec informations personnelles, métriques et préférences
 * @throws {AppError} - Erreur si l'utilisateur n'est pas trouvé ou si une autre erreur se produit
 */
const getUserProfile = async (userId) => {
    try {
    // 1. Infos utilisateur
    const user = await prisma.users.findUnique({
      where: { id_user: userId },
      select: {
        id_user: true,
        prenom: true,
        nom: true,
        email: true,
        sexe: true,
        date_de_naissance: true
      }
    });

    if (!user) throw new AppError("Utilisateur introuvable", 404, "USER_NOT_FOUND");

    const birthDate = new Date(user.date_de_naissance);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
    
    // 2. Dernière évolution
    const lastEvolution = await prisma.evolutions.findFirst({
      where: { id_user: userId },
      orderBy: { date: 'desc' }
    });

    // 3. Préférences
    const preferences = await prisma.preferences.findFirst({
      where: { id_user: userId },
      include: {
        repartitions_nutritionnelles: true,
        regimes_alimentaires: true,
        niveaux_sedentarites: true
      }
    });

    return {
      user: {
        id: user.id_user,
        firstName: user.prenom,
        lastName: user.nom,
        email: user.email,
        gender: user.sexe,
        birthDate: user.date_de_naissance,
        age
      },
      metrics: lastEvolution ? {
        currentWeight: parseFloat(lastEvolution.poids),
        currentHeight: parseFloat(lastEvolution.taille),
        bmi: Number((lastEvolution.poids / ((lastEvolution.taille / 100) ** 2)).toFixed(1)),
        targetWeight: parseFloat(preferences?.objectif_poids || 0),
        dailyCalories: parseInt(preferences?.calories_quotidiennes || 0),
        sessionsPerWeek: preferences?.seances_par_semaines || 0
      } : null,
      preferences: preferences ? {
        nutritionalPlan: {
          id: preferences.repartitions_nutritionnelles.id_repartition_nutritionnelle,
          name: preferences.repartitions_nutritionnelles.nom,
          type: preferences.repartitions_nutritionnelles.type
        },
        diet: {
          id: preferences.regimes_alimentaires.id_regime_alimentaire,
          name: preferences.regimes_alimentaires.nom
        },
        sedentaryLevel: {
          id: preferences.niveaux_sedentarites.id_niveau_sedentarite,
          name: preferences.niveaux_sedentarites.nom
        }
      } : null
    };
  } catch (error) {
    throw error;
  }
};


/**
 * Récupère tous les badges de l'utilisateur, débloqués et verrouillés
 * @param {number} userId - ID de l'utilisateur
 * @returns {Object} - unlockedBadges et lockedBadges
 */
const getUserBadges = async (userId) => {
  try {
    const allBadges = await prisma.badges.findMany();

    const unlocked = await prisma.badges_utilisateurs.findMany({
      where: { id_user: userId },
      include: { badges: true }
    });

    const unlockedBadges = unlocked.map((ub) => ({
      id: ub.badges.id_badge,
      name: ub.badges.nom,
      image: ub.badges.image,
      description: ub.badges.description,
      dateObtained: ub.date_obtention
    }));

    const unlockedIds = new Set(unlocked.map((ub) => ub.id_badge));

    const lockedBadges = allBadges
      .filter((b) => !unlockedIds.has(b.id_badge))
      .map((b) => ({
        id: b.id_badge,
        name: b.nom,
        image: b.image,
        description: b.description,
        condition: b.condition_obtention
      }));

    return { unlockedBadges, lockedBadges };
  } catch (error) {
    throw error;
  }
};
  

/**
 * Handlers pour les conditions de badge
 * @type {Object}
 */
const conditionHandlers = {
  DO_FIRST_SESSION: async (userId) => {
    const session = await prisma.suivis_sportifs.findFirst({ where: { id_user: userId } });
    return !!session;
  },

  FIRST_DAY_COMPLETED: async (userId) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // force à 00:00:00 pour matcher les dates
    const goals = await prisma.objectifs_utilisateurs.findMany({
      where: {
        id_user: userId,
        date: today,
        statut: "done"
      }
    });
    return goals.length >= 1;
  },

  SEVEN_DAYS_COMPLETED: async (userId) => {
    const past7 = await prisma.objectifs_utilisateurs.findMany({
      where: {
        id_user: userId,
        date: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        },
        statut: "done"
      }
    });
    const days = new Set(past7.map(o => o.date.toISOString().slice(0, 10)));
    return days.size >= 7;
  },

  ADD_FIRST_FOOD: async (userId) => {
    const food = await prisma.suivis_nutritionnels.findFirst({
      where: { id_user: userId },
    });
    return !!food;
  },


  // Ajouter les autres badges ici a la suite !!
};

/**
 * Vérifie si l'utilisateur a débloqué de nouveaux badges
 * @param {number} userId - ID de l'utilisateur
 * @returns {Array} - Liste des nouveaux badges débloqués
 */
const checkNewBadges = async (userId) => {
  const newBadges = [];

  const existing = await prisma.badges_utilisateurs.findMany({
    where: { id_user: userId },
    select: { id_badge: true },
  });
  const obtainedIds = new Set(existing.map(b => b.id_badge));

  const allBadges = await prisma.badges.findMany();

  for (const badge of allBadges) {
    if (obtainedIds.has(badge.id_badge)) continue;

    const handler = conditionHandlers[badge.condition_obtention];
    if (!handler) continue;

    const unlocked = await handler(userId);

    if (unlocked) {
      await prisma.badges_utilisateurs.create({
        data: {
          id_user: userId,
          id_badge: badge.id_badge,
        }
      });

      newBadges.push({
        id: badge.id_badge,
        name: badge.nom,
        image: badge.image,
        description: badge.description
      });
    }
  }

  return newBadges;
};


/**
 * Récupère l'évolution de l'utilisateur entre deux dates
 * @param {number} userId - ID de l'utilisateur
 * @param {string} startDate - Date de début (format YYYY-MM-DD)
 * @param {string} endDate - Date de fin (format YYYY-MM-DD)
 * @returns {Object} - Evolution et statistiques
 */
const getUserEvolution = async (userId, startDate, endDate) => {
  const start = startDate ? new Date(startDate) : new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000); // 6 mois avant
  const end = endDate ? new Date(endDate) : new Date(); // aujourd'hui

  const evolution = await prisma.evolutions.findMany({
    where: {
      id_user: userId,
      date: {
        gte: start,
        lte: end,
      },
    },
    orderBy: {
      date: 'asc',
    },
  });

  const formatted = evolution.map((e) => ({
    date: e.date.toISOString().slice(0, 10),
    weight: parseFloat(e.poids),
    height: parseFloat(e.taille),
    bmi: Number((e.poids / ((e.taille / 100) ** 2)).toFixed(1)),
  }));

  let statistics = null;
  if (formatted.length >= 2) {
    const first = formatted[0];
    const last = formatted[formatted.length - 1];
    const weightChange = last.weight - first.weight;
    const weightChangePercentage = Number(((weightChange / first.weight) * 100).toFixed(2));
    statistics = {
      initialWeight: first.weight,
      currentWeight: last.weight,
      weightChange,
      weightChangePercentage,
      initialBmi: first.bmi,
      currentBmi: last.bmi,
    };
  }

  return { evolution: formatted, statistics };
};



module.exports = {
    getUserProfile,
    getUserBadges,
    checkNewBadges,
    getUserEvolution,
  };
  