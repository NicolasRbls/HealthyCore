const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { comparePassword } = require("../../../password.utils");


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
}

const deleteUser = async (id) => {
  const user = await prisma.users.delete({
    where: { id_user: id },
  });

  return user;
}

module.exports = {
    getUserCount, // Récupérer le nombre total d'utilisateurs
    getPaginatedUsers, // Récupérer la liste paginée des utilisateurs
    deleteUser
};