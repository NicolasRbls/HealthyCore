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

module.exports = {
  getUserCount,
  getPaginatedUsers,
};
