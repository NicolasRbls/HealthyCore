const signalementService = require("./signalement.service");
const { AppError, success } = require("../../utils/response.utils");

const createSignalement = async (req, res, next) => {
    try {
        const userId = req.user.id_user;
        const result = await signalementService.createSignalement(userId, req.body);
        res.status(201).json(success(result, "Signalement créé avec succès"));
    } catch (error) {
        console.error("Error creating signalement:", error);
        next(error);
    }
};

const getAllSignalements = async (req, res, next) => {
    try {
        const signalements = await signalementService.getAllSignalements();
        res.status(200).json(success(signalements, "Signalements récupérés avec succès"));
    } catch (error) {
        next(error);
    }
};

const updateSignalementStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { statut } = req.body;
        const result = await signalementService.updateSignalementStatus(id, statut);
        res.status(200).json(success(result, "Statut mis à jour avec succès"));
    } catch (error) {
        next(error);
    }
};

const getSignalementTypes = async (req, res, next) => {
    try {
        const types = await signalementService.getSignalementTypes();
        res.status(200).json(success(types, "Types de signalement récupérés avec succès"));
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createSignalement,
    getAllSignalements,
    updateSignalementStatus,
    getSignalementTypes,
};
