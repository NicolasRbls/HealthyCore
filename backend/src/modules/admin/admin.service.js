const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Récupérer le nombre total d'utilisateurs
const getUserCount = async () => {
    return await prisma.users.count({
    where: { role: { not: "admin" } },
  });
};

// Récupérer la liste paginée de tous les utilisateurs


// Supprimer un utilisateur et toutes ses données associées
const deleteUser = async (userId, adminId, adminPassword) => {
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

const getUserInfosById = async (userId) => {
  const user = await prisma.users.findUnique({
    where: { id_user: parseInt(userId) },
    select: {
      prenom: true,
      nom: true,
      email: true,
      sexe: true,
      role: true,
      cree_a: true,
      mis_a_jour_a: true
    },
  });

  if (!user) {
    throw new AppError("Utilisateur non trouvé", 404, "USER_NOT_FOUND");
  }

  return user;
}

const getLastEvolutionById = async (userId) => {
  const lastEvo = await prisma.evolutions.findFirst({
    where: { id_user: parseInt(userId) },
    select: {
      date: true,
      poids: true,
      taille: true
    },
    orderBy: { date: "desc" },
    take: 1,
  });
  
  return lastEvo;
}

const getUserPreferencesById = async (userId) => {
  const nutritionSummary = await prisma.preferences.findMany({
    where: { id_user: parseInt(userId) },
    select: {
      objectif_poids: true,
      id_repartition_nutritionnelle: true,
      id_regime_alimentaire: true,
      id_niveau_sedentarite: true,
      bmr: true,
      calories_quotidiennes: true
    },
  });

  return nutritionSummary;
}

module.exports = {
  getUserCount,
  deleteUser,
  // Récupérer les informations d'un détaillées d'un utilisateur par son ID
  getUserInfosById,
  getLastEvolutionById,
  getUserPreferencesById,
};
