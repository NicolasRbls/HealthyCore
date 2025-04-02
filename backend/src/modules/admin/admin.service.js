const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Récupérer le nombre total d'utilisateurs (hors admins)
 */
const getUserCount = async () => {
    return await prisma.users.count({
    where: { role: { not: "admin" } },
  });
};

/**
 * Récupérer une liste paginée d'utilisateurs avec recherche.
 * @param {Object} options - Contient la pagination et le filtre de recherche
 * @param {number} options.page - Numéro de la page
 * @param {number} options.limit - Nombre de résultats par page
 * @param {string} options.search - Termes de recherche
 */
const getPaginatedUsers = async ({ page, limit, search }) => {
  const searchFilter = search
    ? {
        OR: [
          { prenom: { contains: search, mode: "insensitive" } },
          { nom: { contains: search, mode: "insensitive" } },
        ],
      }
    : {};

  const users = await prisma.users.findMany({
    where: {
      role: { not: "admin" },
      ...searchFilter,
    },
    skip: (page - 1) * limit,
    take: limit,
    select: {
      id_user: true,
      prenom: true,
      nom: true,
      email: true,
    },
  });

  const totalUsers = await prisma.users.count({
    where: {
      role: { not: "admin" },
      ...searchFilter,
    },
  });

  return { users, total: totalUsers };
};

const getUserDetails = async (userId) =>{
  // Vérifier que l'utilisateur existe
  const user = await prisma.users.findUnique({
    where: { id_user: parseInt(userId) },
    select: {
      id_user: true,
      prenom: true,
      nom: true,
      email: true,
      genre: true,
      date_naissance: true,
      created_at: true,
      last_login: true,
    },
  });

  if (!user) {
    throw new AppError("Utilisateur non trouvé", 404, "USER_NOT_FOUND");
  }

  // Récupérer les informations de profil et de poids
  const profile = await prisma.profils.findUnique({
    where: { id_user: parseInt(userId) },
    select: {
      poids: true,
      taille: true,
      poids_initial: true,
      created_at: true,
    },
  });

  // Calculer l'IMC si les données nécessaires sont disponibles
  let bmi = null;
  if (profile && profile.poids && profile.taille) {
    // IMC = poids (kg) / (taille (m))²
    const heightInMeters = profile.taille / 100;
    bmi = parseFloat((profile.poids / (heightInMeters * heightInMeters)).toFixed(1));
  }

  // Calculer le temps passé sur la plateforme
  const timeOnPlatform = user.created_at 
    ? Math.round((new Date() - new Date(user.created_at)) / (1000 * 60 * 60 * 24)) + " jours"
    : "N/A";

  // Récupérer les informations nutritionnelles
  const nutrition = await prisma.objectifs_nutritionnels.findFirst({
    where: { id_user: parseInt(userId) },
    select: {
      calories_objectif: true,
      type_regime: true,
      repartition_glucides: true,
      repartition_proteines: true,
      repartition_lipides: true,
    },
  });

  // Compter les entrées nutritionnelles
  const nutritionEntriesCount = await prisma.journal_alimentaire.count({
    where: { id_user: parseInt(userId) },
  });

  // Récupérer les informations d'exercice
  const exerciseGoal = await prisma.objectifs_sportifs.findFirst({
    where: { id_user: parseInt(userId) },
    select: {
      frequence_hebdomadaire: true,
    },
  });

  // Compter les sessions d'entraînement terminées
  const completedSessions = await prisma.sessions_entrainement.count({
    where: { id_user: parseInt(userId), statut: "COMPLETE" },
  });

  // Trouver l'activité favorite
  const favoriteActivity = await prisma.$queryRaw`
    SELECT type_activite, COUNT(*) as count
    FROM sessions_entrainement 
    WHERE id_user = ${parseInt(userId)}
    GROUP BY type_activite
    ORDER BY count DESC
    LIMIT 1
  `;

  // Récupérer la date de la dernière session
  const lastSession = await prisma.sessions_entrainement.findFirst({
    where: { id_user: parseInt(userId) },
    orderBy: { date_session: 'desc' },
    select: { date_session: true },
  });

  // Compter les badges obtenus
  const badgeCount = await prisma.badges_utilisateurs.count({
    where: { id_user: parseInt(userId) },
  });

  // Formater la réponse
  return {
    user: {
      id: user.id_user,
      firstName: user.prenom,
      lastName: user.nom,
      email: user.email,
      gender: user.genre,
      birthDate: user.date_naissance,
      createdAt: user.created_at,
      lastLoginAt: user.last_login,
    },
    evolution: {
      currentWeight: profile?.poids || null,
      currentHeight: profile?.taille || null,
      currentBMI: bmi,
      startWeight: profile?.poids_initial || null,
      weightChange: profile?.poids && profile?.poids_initial 
        ? parseFloat((profile.poids - profile.poids_initial).toFixed(1))
        : null,
      timeOnPlatform,
    },
    nutritionSummary: {
      caloriesGoal: nutrition?.calories_objectif || null,
      diet: nutrition?.type_regime || "Standard",
      macroDistribution: {
        carbs: nutrition?.repartition_glucides || null,
        protein: nutrition?.repartition_proteines || null,
        fat: nutrition?.repartition_lipides || null,
      },
      entriesCount: nutritionEntriesCount,
    },
    exerciseSummary: {
      weeklyGoal: exerciseGoal?.frequence_hebdomadaire || null,
      completedSessions: completedSessions,
      favoriteActivity: favoriteActivity[0]?.type_activite || "N/A",
      lastSessionDate: lastSession?.date_session || null,
    },
    badgeCount,
  };
}

/**
 * Supprimer un utilisateur et toutes ses données associées
 */
const deleteUser = async (userId, adminId, adminPassword) => {
  // Vérifier que l'utilisateur à supprimer existe
  const userToDelete = await prisma.users.findUnique({
    where: { id_user: parseInt(userId) },
  });

  if (!userToDelete) {
    throw new AppError("Utilisateur non trouvé", 404, "USER_NOT_FOUND");
  }

  // Vérifier le mot de passe de l'administrateur
  const admin = await prisma.users.findUnique({
    where: { id_user: adminId },
  });

  if (!admin) {
    throw new AppError("Administrateur non trouvé", 404, "ADMIN_NOT_FOUND");
  }

  // Ici, vous devriez utiliser une méthode de vérification de mot de passe sécurisée
  // comme bcrypt.compare() plutôt que cette comparaison directe (à titre d'exemple)
  const bcrypt = require('bcrypt');
  const isPasswordValid = await bcrypt.compare(adminPassword, admin.mot_de_passe);
  
  if (!isPasswordValid) {
    throw new AppError("Mot de passe administrateur incorrect", 401, "INVALID_ADMIN_PASSWORD");
  }

  // Supprimer l'utilisateur et toutes ses données associées en utilisant une transaction
  await prisma.$transaction(async (tx) => {
    // Supprimer les données associées dans l'ordre approprié pour respecter les contraintes de clé étrangère
    await tx.badges_utilisateurs.deleteMany({ where: { id_user: parseInt(userId) } });
    await tx.journal_alimentaire.deleteMany({ where: { id_user: parseInt(userId) } });
    await tx.sessions_entrainement.deleteMany({ where: { id_user: parseInt(userId) } });
    await tx.objectifs_sportifs.deleteMany({ where: { id_user: parseInt(userId) } });
    await tx.objectifs_nutritionnels.deleteMany({ where: { id_user: parseInt(userId) } });
    await tx.mesures.deleteMany({ where: { id_user: parseInt(userId) } });
    await tx.profils.deleteMany({ where: { id_user: parseInt(userId) } });
    
    // Finalement, supprimer l'utilisateur lui-même
    await tx.users.delete({ where: { id_user: parseInt(userId) } });
  });

  return true;
}


module.exports = {
  getUserCount,
  getPaginatedUsers,
  getUserDetails,
  deleteUser
};
