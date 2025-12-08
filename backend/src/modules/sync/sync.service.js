const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const _ = require('lodash');

class SyncService {
    /**
     * Synchronize data: Handle Push (insert/update) and Pull (fetch deltas)
     * @param {number} userId - The ID of the user synchronizing
     * @param {string} lastSync - ISO Date string of the last synchronization
     * @param {object} pushData - Data to insert/update from the client
     */
    async synchronize(userId, lastSync, pushData) {
        const syncTime = new Date();
        const lastSyncDate = lastSync ? new Date(lastSync) : new Date(0); // Epoch if null

        // 1. Process Pushed Data (Client -> Server)
        // TODO: Implement Push logic (inserting/updating user content)
        // For MVP US-A07, we primarily focus on Pull (downloading content for offline use)
        // We can add Push logic here later for tracking progress made offline.

        // 2. Process Pull Data (Server -> Client)
        // Fetch all records modified after lastSyncDate
        const pullData = {
            programmes: await this.getUpdatedItems(prisma.programmes, userId, lastSyncDate, true),
            seances: await this.getUpdatedItems(prisma.seances, userId, lastSyncDate, true),
            exercices: await this.getUpdatedItems(prisma.exercices, null, lastSyncDate, false), // Global exercises
            aliments: await this.getUpdatedItems(prisma.aliments, null, lastSyncDate, false),   // Global foods
            objectifs: await this.getUpdatedItems(prisma.objectifs, null, lastSyncDate, false), // Global objectives
            users: await this.getUserProfile(userId, lastSyncDate),
            programmes_utilisateurs: await this.getUpdatedItems(prisma.programmes_utilisateurs, userId, lastSyncDate, true),
            objectifs_utilisateurs: await this.getUpdatedItems(prisma.objectifs_utilisateurs, userId, lastSyncDate, true),
            // Add other relevant tables here
        };

        return {
            timestamp: syncTime.toISOString(),
            pull: pullData,
        };
    }

    /**
     * Generic helper to fetch updated items
     * @param {object} model - Prisma model delegate
     * @param {number|null} userId - User ID filter (null if global data)
     * @param {Date} dateCursor - The last sync date
     * @param {boolean} userSpecific - Whether to filter by id_user
     */
    async getUpdatedItems(model, userId, dateCursor, userSpecific = true) {
        const whereClause = {
            updatedAt: {
                gt: dateCursor,
            },
        };

        if (userSpecific && userId) {
            whereClause.id_user = userId;
        }

        // Special handling for exercises/foods which might be global (no id_user or id_user is null)
        // If not userSpecific, we assume it's global reference data

        return await model.findMany({
            where: whereClause,
        });
    }

    async getUserProfile(userId, dateCursor) {
        const user = await prisma.users.findUnique({
            where: { id_user: userId },
        });

        // Return user only if modified consistently, or if strict match required.
        // simpler: check mis_a_jour_a (updatedAt equivalent)
        if (user && user.mis_a_jour_a > dateCursor) {
            // Exclude password
            const { mot_de_passe, ...safeUser } = user;
            return [safeUser];
        }
        return [];
    }
}

module.exports = new SyncService();
