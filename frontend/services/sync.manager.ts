import apiService from './api.service';
import cacheService, { CACHE_KEYS } from './cache.service';
import * as SecureStore from 'expo-secure-store';

/**
 * Interface pour la réponse du backend /api/sync
 */
interface SyncResponse {
    pull: {
        programmes: any[];
        seances: any[];
        exercices: any[];
        users: any[];
        aliments: any[];
        objectifs: any[];
        [key: string]: any[];
    };
    timestamp: string;
}

class SyncManager {
    private isSyncing = false;
    private lastSyncAttempt = 0;
    private readonly MIN_SYNC_INTERVAL = 10000; // 10 secondes anti-spam

    /**
     * Lance une synchronisation avec le backend
     * Récupère les données modifiées depuis la dernière sync et met à jour le cache
     */
    async synchronize(): Promise<void> {
        const now = Date.now();
        if (this.isSyncing || (now - this.lastSyncAttempt < this.MIN_SYNC_INTERVAL)) {
            // Already syncing or throttled
            return;
        }

        // Vérifier si connecté
        try {
            const token = await SecureStore.getItemAsync('token');
            if (!token) {
                console.log('[SyncManager] No token found, skipping sync.');
                return;
            }

            this.lastSyncAttempt = now;
            this.isSyncing = true;
        } catch (e) {
            return;
        }

        try {
            // 1. Récupérer la date de dernière sync
            const lastSync = await cacheService.getLastSync();

            console.log(`[SyncManager] Starting sync... Last sync: ${lastSync || 'Never'}`);

            // 2. Appeler le backend (POST /api/sync)
            // Note: On utilise apiService.post directement. 
            // Assumption: api.service gère déjà l'auth header
            const response = await apiService.post('/sync', {
                lastSync: lastSync,
                push: {} // Pour l'instant on ne push rien (Consultation only)
            });

            const syncData: SyncResponse = response.data;

            if (!syncData || !syncData.pull) {
                console.warn('[SyncManager] Invalid sync response', syncData);
                return;
            }

            // 3. Mettre à jour le cache avec les nouvelles données
            // "Delta Sync" : On doit merger avec l'existant ou remplacer si c'est plus simple
            // Pour une implémentation robuste "Perfect", on devrait merger par ID.
            // Mais pour le MVP "Consulation", remplacer le cache complet quand on a des données est plus sûr si on n'a pas de logique de merge complexe en frontend.
            // PROBLÈME: Le backend renvoie SEULEMENT les deltas. Si on remplace tout, on perd les vieilles données !
            // SOLUTION: On doit charger le cache actuel, merger les deltas, et re-sauvegarder.

            await this.mergeAndSave(CACHE_KEYS.PROGRAMS, syncData.pull.programmes, 'id_programme');
            // Pour les séances, exercices, etc.
            // Note: Le backend renvoie "exercices" (global) et "seances" (user).
            // On va simplifier et stocker tout ce qui est reçu.

            // Ici on stocke par "domaine" pour simplifier l'accès
            await this.mergeAndSave(CACHE_KEYS.PROFILE, syncData.pull.users, 'id_user');
            await this.mergeAndSave('cache_seances', syncData.pull.seances, 'id_seance');
            await this.mergeAndSave('cache_exercices', syncData.pull.exercices, 'id_exercice');
            await this.mergeAndSave(CACHE_KEYS.NUTRITION, syncData.pull.aliments, 'id_aliment');
            // Objectifs...

            // 4. Mettre à jour la date de dernière sync
            if (syncData.timestamp) {
                await cacheService.setLastSync(syncData.timestamp);
            }

            console.log('[SyncManager] Sync completed successfully');

        } catch (error) {
            // Filtrer les erreurs de parsing JSON (souvent dues à une réponse HTML d'erreur 404/500/Proxy)
            const errorMsg = String(error);
            if (errorMsg.includes('SyntaxError') && errorMsg.includes('Unexpected character')) {
                console.log('[SyncManager] Sync skipped (Invalid JSON response)', errorMsg);
            } else {
                console.error('[SyncManager] Sync failed', error);
            }
            // Ne pas throw, pour ne pas bloquer l'app.
        } finally {
            this.isSyncing = false;
        }
    }

    /**
     * Helper pour merger des données dans le cache
     */
    private async mergeAndSave(cacheKey: string, newItems: any[], idField: string) {
        if (!newItems || newItems.length === 0) return;

        // 1. Lire cache existant
        const existingData = await cacheService.get(cacheKey) || [];

        // 2. Convertir en Map pour accès rapide et déduplication par ID
        const dataMap = new Map();
        existingData.forEach((item: any) => dataMap.set(item[idField], item));

        // 3. Ajouter/Ecraser avec les nouveaux items
        newItems.forEach((item: any) => dataMap.set(item[idField], item));

        // 4. Reconvertir en array
        const mergedData = Array.from(dataMap.values());

        // 5. Sauvegarder
        await cacheService.save(cacheKey, mergedData);
        console.log(`[SyncManager] Updated ${cacheKey}: ${newItems.length} new/updated items. Total: ${mergedData.length}`);
    }
}

export default new SyncManager();
