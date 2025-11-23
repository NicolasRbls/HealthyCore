import api from "./api.service";

export interface SignalementType {
    id_signalement: number;
    titre: string;
}

export interface CreateSignalementData {
    id_signalement: number;
    id_aliment: number;
    description?: string;
}

const signalementService = {
    getTypes: async (): Promise<SignalementType[]> => {
        const response = await api.get("/signalements/types");
        return response;
    },

    create: async (data: CreateSignalementData): Promise<any> => {
        const response = await api.post("/signalements", data);
        return response;
    },
};

export default signalementService;
