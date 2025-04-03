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
  //getUserDetails,
  deleteUser
};
