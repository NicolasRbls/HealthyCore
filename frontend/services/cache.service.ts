import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export const CACHE_KEYS = {
    PROGRAMS: 'cache_programs',
    PROFILE: 'cache_profile',
    NUTRITION: 'cache_nutrition',
    NUTRITION_SUMMARY: 'cache_nutrition_summary',
    NUTRITION_TODAY: 'cache_nutrition_today',
    NUTRITION_HISTORY: 'cache_nutrition_history',
    BADGES: 'cache_badges',
    EVOLUTION: 'cache_evolution',
    PROGRESS_STATS: 'cache_progress_stats',
    OBJECTIVES: 'cache_objectives',
    ACTIVE_PROGRAM: 'cache_active_program',
    SPORT_PROGRESS: 'cache_sport_progress',
    PROGRAMS_PAGE: 'cache_programs_page',
    LAST_SYNC: 'last_sync_timestamp',
};

class CacheService {
    /**
     * Enregistre des données dans le cache
     * @param key Clé de stockage
     * @param data Données à enregistrer (sera stringify)
     */
    async save(key: string, data: any): Promise<void> {
        try {
            // Sur le web, AsyncStorage peut avoir des limites différentes, mais pour mobile c'est standard
            const jsonValue = JSON.stringify(data);
            await AsyncStorage.setItem(key, jsonValue);
        } catch (e) {
            console.error('Error saving data to cache', e);
        }
    }

    /**
     * Récupère des données du cache
     * @param key Clé de stockage
     * @returns Les données parsées ou null si vide
     */
    async get(key: string): Promise<any | null> {
        try {
            const jsonValue = await AsyncStorage.getItem(key);
            return jsonValue != null ? JSON.parse(jsonValue) : null;
        } catch (e) {
            console.error('Error reading data from cache', e);
            return null;
        }
    }

    /**
     * Supprime une entrée du cache
     */
    async remove(key: string): Promise<void> {
        try {
            await AsyncStorage.removeItem(key);
        } catch (e) {
            console.error('Error removing data from cache', e);
        }
    }

    /**
     * Vide tout le cache (utile lors de la déconnexion)
     */
    async clearAll(): Promise<void> {
        try {
            const keys = Object.values(CACHE_KEYS);
            await AsyncStorage.multiRemove(keys);
        } catch (e) {
            console.error('Error clearing cache', e);
        }
    }

    /**
     * Met à jour le timestamp de dernière synchro
     */
    async setLastSync(date: string): Promise<void> {
        await this.save(CACHE_KEYS.LAST_SYNC, date);
    }

    /**
     * Récupère le timestamp de dernière synchro
     */
    async getLastSync(): Promise<string | null> {
        return await this.get(CACHE_KEYS.LAST_SYNC);
    }
}

export default new CacheService();
