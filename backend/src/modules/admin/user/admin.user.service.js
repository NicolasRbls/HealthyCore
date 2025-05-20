const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { comparePassword } = require("../../../utils/password.utils");

// Récupérer le nombre total d'utilisateurs
const getUserCount = async () => {
  return await prisma.users.count({
    where: { role: { not: "admin" } },
  });
};

const getUserProfile = async (userId) => {
  return await prisma.users.findUnique({
    where: { id_user: userId },
    select: {
      id_user: true,
      prenom: true,
      nom: true,
      email: true,
      sexe: true,
      date_de_naissance: true,
      role: true,
      cree_a: true,
      mis_a_jour_a: true,
    },
  });
};

const getLatestEvolution = async (userId) => {
  return await prisma.evolutions.findFirst({
    where: { id_user: userId },
    orderBy: { date: "desc" },
  });
};

const getUserPreferences = async (userId) => {
  return await prisma.preferences.findFirst({
    where: { id_user: userId },
  });
};

// Récupérer la liste paginée de tous les utilisateurs
const getPaginatedUsers = async ({ page, limit, search }) => {
  // Convert to numbers
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;

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
    skip: (pageNum - 1) * limitNum,
    take: limitNum,
    select: {
      id_user: true,
      prenom: true,
      nom: true,
      email: true,
      sexe: true,
      cree_a: true,
      mis_a_jour_a: true,
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

const checkAdminPassword = async (id, password) => {
  const admin = await prisma.users.findUnique({
    where: { id_user: id },
  });

  if (!admin) {
    throw new Error("Utilisateur non trouvé");
  }

  const isPasswordValid = await comparePassword(password, admin.mot_de_passe);

  if (!isPasswordValid) {
    throw new Error("Mot de passe incorrect");
  }

  return true;
};

const deleteUser = async (id) => {
  const user = await prisma.users.delete({
    where: { id_user: id },
  });

  return user;
};

module.exports = {
  getUserCount,
  getPaginatedUsers,
  deleteUser,
  getUserProfile,
  checkAdminPassword,
  getLatestEvolution,
  getUserPreferences,
};
