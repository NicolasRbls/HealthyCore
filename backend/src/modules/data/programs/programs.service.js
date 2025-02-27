const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { AppError } = require("../../../utils/response.utils");

/**
 * Récupérer les programmes actifs d'un utilisateur
 * @param {number} userId - ID de l'utilisateur
 */
const getActivePrograms = async (userId) => {
    try {
        console.log(`🔍 Recherche des programmes actifs pour l'utilisateur ID: ${userId}`);

        // Vérifier si l'utilisateur existe
        const userExists = await prisma.users.findUnique({
            where: { id_user: userId },
            select: { id_user: true }
        });

        if (!userExists) {
            throw new AppError("Utilisateur non trouvé", 404, "USER_NOT_FOUND");
        }

        // Récupérer les programmes actifs
        const activePrograms = await prisma.programmes_utilisateurs.findMany({
            where: {
                id_user: userId,
                date_fin: { gte: new Date() },
            },
            include: {
                programmes: {
                    select: {
                        id_programme: true,  // ✅ Assure que l'ID est bien récupéré
                        nom: true,
                        image: true,
                        duree: true,
                        seances_programmes: {
                            include: {
                                seances: {
                                    select: {
                                        id_seance: true,
                                        nom: true,
                                        exercices_seances: {
                                            select: {
                                                id_exercice_seance: true,
                                                exercices: {
                                                    select: {
                                                        id_exercice: true,
                                                        nom: true,
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        console.log("✅ Résultat brut de Prisma:", JSON.stringify(activePrograms, null, 2));

        // Vérifier si la réponse est vide
        if (!activePrograms || activePrograms.length === 0) {
            console.log("⚠ Aucun programme actif trouvé.");
            return [];
        }

        // Transformation des données
        const formattedPrograms = activePrograms.map((programEntry) => {
            if (!programEntry.programmes) {
                console.warn("⚠ Programme non défini pour cet utilisateur !");
                return null;
            }

            const program = programEntry.programmes;
            const seances = program.seances_programmes?.map((sp) => ({
                id: sp.seances.id_seance,
                name: sp.seances.nom,
                exercisesCount: sp.seances.exercices_seances?.length || 0,
            })) || [];

            return {
                id: program.id_programme, // ✅ Utilisation correcte de l'ID
                name: program.nom,
                startDate: programEntry.date_debut,
                endDate: programEntry.date_fin,
                progress: program.duree > 0
                    ? Math.min(100, (seances.length / program.duree) * 100)
                    : 0,
                nextSession: seances.length > 0 ? seances[0] : null,
            };
        }).filter(p => p !== null);

        return formattedPrograms;
    } catch (error) {
        console.error("❌ Erreur Prisma:", error);
        throw new AppError("Erreur lors de la récupération des programmes actifs", 500, "DATABASE_ERROR");
    }
};

module.exports = {
    getActivePrograms,
};
