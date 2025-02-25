const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { AppError } = require("../../utils/response.utils");

/**
 * Service pour récupérer les données utilisateur après connexion
 * @param {number} userId - ID de l'utilisateur
 */
const getUserData = async (userId) => {
  try {
    // Vérifier que l'utilisateur existe
    const user = await prisma.users.findUnique({
      where: { id_user: userId },
      select: { id_user: true },
    });

    if (!user) {
      throw new AppError("Utilisateur non trouvé", 404, "USER_NOT_FOUND");
    }

    // Récupérer les préférences
    const preferences = await prisma.preferences.findFirst({
      where: { id_user: userId },
      include: {
        niveaux_sedentarites: true,
        regimes_alimentaires: true,
        repartitions_nutritionnelles: true,
      },
    });

    // Récupérer les évolutions
    const evolutions = await prisma.evolutions.findMany({
      where: { id_user: userId },
      orderBy: { date: "desc" },
      take: 10,
    });

    return {
      preferences,
      evolutions,
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      "Erreur lors de la récupération des données utilisateur",
      500,
      "DATABASE_ERROR"
    );
  }
};

module.exports = {
  getUserData,
};
