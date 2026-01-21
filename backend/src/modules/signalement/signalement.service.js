const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createSignalement = async (userId, data) => {
    const { id_signalement, id_aliment, description } = data;

    // Verify aliment exists
    const aliment = await prisma.aliments.findUnique({
        where: { id_aliment: parseInt(id_aliment) },
    });

    if (!aliment) {
        throw new Error("Aliment not found");
    }

    // Create signalement utilisateur
    const newSignalement = await prisma.signalements_utilisateurs.create({
        data: {
            id_user: userId,
            id_signalement: parseInt(id_signalement),
            id_aliment: parseInt(id_aliment),
            description: description,
            statut: "non_revue",
            date: new Date(),
        },
    });

    return newSignalement;
};

const getAllSignalements = async () => {
    return await prisma.signalements_utilisateurs.findMany({
        include: {
            users: {
                select: {
                    id_user: true,
                    nom: true,
                    prenom: true,
                    email: true,
                },
            },
            aliments: {
                select: {
                    id_aliment: true,
                    nom: true,
                    image: true,
                },
            },
            signalements: true,
        },
        orderBy: {
            date: "desc",
        },
    });
};

const updateSignalementStatus = async (id, status) => {
    return await prisma.signalements_utilisateurs.update({
        where: { id_signalement_utilisateur: parseInt(id) },
        data: { statut: status },
    });
};

const getSignalementTypes = async () => {
    return await prisma.signalements.findMany();
};

module.exports = {
    createSignalement,
    getAllSignalements,
    updateSignalementStatus,
    getSignalementTypes,
};
