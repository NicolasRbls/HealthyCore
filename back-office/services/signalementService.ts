import api from "./api";

export interface Signalement {
    id_signalement_utilisateur: number;
    id_user: number;
    id_signalement: number;
    id_aliment: number;
    description: string | null;
    date: string;
    statut: "non_revue" | "traite" | "ignore";
    users: {
        id_user: number;
        nom: string;
        prenom: string;
        email: string;
    };
    aliments: {
        id_aliment: number;
        nom: string;
        image: string | null;
    };
    signalements: {
        id_signalement: number;
        titre: string;
    };
}

export const signalementService = {
    getAll: async (): Promise<Signalement[]> => {
        const response = await api.get("/api/signalements");
        return response.data.data;
    },

    updateStatus: async (
        id: number,
        statut: "non_revue" | "traite" | "ignore"
    ): Promise<Signalement> => {
        const response = await api.put(`/api/signalements/${id}`, { statut });
        return response.data.data;
    },
};
