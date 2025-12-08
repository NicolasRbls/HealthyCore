import syncManager from '../../services/sync.manager';
import apiService from '../../services/api.service';
import cacheService, { CACHE_KEYS } from '../../services/cache.service';
import * as SecureStore from 'expo-secure-store';

// Mocks
jest.mock('../../services/api.service');
jest.mock('../../services/cache.service');
jest.mock('expo-secure-store', () => ({
    getItemAsync: jest.fn(),
}));

describe('SyncManager', () => {
    let mockTime = new Date('2030-01-01T00:00:00Z').getTime();

    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
        // Avancer le temps de manière déterministe (Future pour être sûr > 10s)
        mockTime += 20000; // +20s
        jest.setSystemTime(mockTime);
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('should synchronize successfully', async () => {
        // Setup Mocks
        (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('valid-token');
        (cacheService.getLastSync as jest.Mock).mockResolvedValue('2023-01-01T00:00:00Z');
        (apiService.post as jest.Mock).mockResolvedValue({
            data: {
                timestamp: '2023-01-02T00:00:00Z',
                pull: {
                    programmes: [{ id_programme: 1, nom: 'Prog 1' }],
                    seances: [],
                    exercices: [],
                    users: [{ id_user: 1, nom: 'User 1' }],
                    aliments: [],
                    objectifs: []
                }
            }
        });
        (cacheService.get as jest.Mock).mockResolvedValue([]); // Cache vide initialement

        // Action
        await syncManager.synchronize();

        // Assertions
        expect(cacheService.getLastSync).toHaveBeenCalled();
        expect(apiService.post).toHaveBeenCalledWith('/sync', {
            lastSync: '2023-01-01T00:00:00Z',
            push: {}
        });

        // Vérifier sauvegarde cache
        expect(cacheService.save).toHaveBeenCalledWith(CACHE_KEYS.PROGRAMS, expect.arrayContaining([
            expect.objectContaining({ id_programme: 1 })
        ]));
        expect(cacheService.save).toHaveBeenCalledWith(CACHE_KEYS.PROFILE, expect.arrayContaining([
            expect.objectContaining({ id_user: 1 })
        ]));

        // Vérifier update timestamp
        expect(cacheService.setLastSync).toHaveBeenCalledWith('2023-01-02T00:00:00Z');
    });

    it('should handle API errors gracefully', async () => {
        // Setup Mocks
        (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('valid-token');
        (cacheService.getLastSync as jest.Mock).mockResolvedValue(null);
        (apiService.post as jest.Mock).mockRejectedValue(new Error('Network Error'));

        // Action
        await syncManager.synchronize();

        // Assertions
        expect(apiService.post).toHaveBeenCalled();
        expect(cacheService.save).not.toHaveBeenCalled(); // Rien ne doit être sauvegardé
        // Pas d'erreur throw
    });

    it('should log info instead of error for JSON parse syntax errors', async () => {
        (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('valid-token');
        (cacheService.getLastSync as jest.Mock).mockResolvedValue(null);

        // Mock API rejection with a SyntaxError similar to HTML response
        const syntaxError = new SyntaxError('JSON Parse error: Unexpected character: <');
        (apiService.post as jest.Mock).mockRejectedValue(syntaxError);

        // Spies
        const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

        await syncManager.synchronize();

        expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Sync skipped'), expect.stringContaining('SyntaxError'));
        expect(consoleErrorSpy).not.toHaveBeenCalledWith(expect.stringContaining('Sync failed'), expect.anything());

        consoleLogSpy.mockRestore();
        consoleErrorSpy.mockRestore();
    });

    it('should merge data with existing cache', async () => {
        // Setup: Cache existant
        (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('valid-token');
        (cacheService.getLastSync as jest.Mock).mockResolvedValue('2023-01-01T00:00:00Z');
        (cacheService.get as jest.Mock).mockImplementation((key) => {
            if (key === CACHE_KEYS.PROGRAMS) {
                return Promise.resolve([{ id_programme: 1, nom: 'Old Name' }]);
            }
            return Promise.resolve([]);
        });

        // API renvoie update pour id 1 et new id 2
        (apiService.post as jest.Mock).mockResolvedValue({
            data: {
                timestamp: '2023-01-02T00:00:00Z',
                pull: {
                    programmes: [
                        { id_programme: 1, nom: 'New Name' },
                        { id_programme: 2, nom: 'Prog 2' }
                    ],
                    seances: [],
                    exercices: [],
                    users: [],
                    aliments: [],
                    objectifs: []
                }
            }
        });

        // Action
        await syncManager.synchronize();

        // Assertions
        expect(cacheService.save).toHaveBeenCalledWith(CACHE_KEYS.PROGRAMS, expect.any(Array));

        // Récupérer l'argument passé à save pour PROGRAMS
        const saveCallArgs = (cacheService.save as jest.Mock).mock.calls.find(call => call[0] === CACHE_KEYS.PROGRAMS);
        const savedPrograms = saveCallArgs[1];

        expect(savedPrograms).toHaveLength(2);
        expect(savedPrograms).toContainEqual(expect.objectContaining({ id_programme: 1, nom: 'New Name' })); // Updated
        expect(savedPrograms).toContainEqual(expect.objectContaining({ id_programme: 2, nom: 'Prog 2' })); // New
    });
});
