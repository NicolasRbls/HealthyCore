const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Récupérer le nombre total d'utilisateurs
const getUserCount = async () => {
    return await prisma.users.count({
    where: { role: { not: "admin" } },
  });
};

// Récupérer la liste paginée de tous les utilisateurs
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
      sexe: true,
      cree_a: true,
      mis_a_jour_a: true
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

// const getUserById = async (id) => {
//     const user = await prisma.users.findUnique({
//         where: { id_user: parseInt(id) },
//         select: {
//             id_user: true,
//             prenom: true,
//             nom: true,
//             email: true,
//             sexe: true,
//             role: true,
//             cree_a: true,
//             mis_a_jour_a: true
//         }
//     });
//     return user;
// };

// const getUserPreferences = async (id) => {
//     const preferences = await prisma.preferences.findMany({
//         where: { id_user: parseInt(id) },
//         select: {
//           objectif_poids: true,
//           id_repartition_nutritionnelle: true,
//           id_regime_alimentaire: true,
//           id_niveau_sedentarite: true,
//           bmr: true,
//           calories_quotidiennes: true
//         },
//     });
//     return preferences;
// };

// const getLastEvolution = async (id) => {
//     const lastEvo = await prisma.evolutions.findFirst({
//         where: { id_user: parseInt(id) },
//         select: {
//             date: true,
//             poids: true,
//             taille: true
//         },
//         orderBy: { date: "desc" },
//         take: 1,
//     });
//     return lastEvo;
// }

module.exports = {
    getUserCount, // Récupérer le nombre total d'utilisateurs
    getPaginatedUsers, // Récupérer la liste paginée des utilisateurs

};