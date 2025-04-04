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
  
module.exports = {
    getUserProfile
  };
  