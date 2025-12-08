import programsService from '../../services/programs.service';
import userService from '../../services/user.service';
import { nutritionService } from '../../services/nutrition.service';
import objectivesService from '../../services/objectives.service';
import apiService from '../../services/api.service';
import cacheService, { CACHE_KEYS } from '../../services/cache.service';

// Mocks
jest.mock('../../services/api.service');
jest.mock('../../services/cache.service');

describe('Service Offline Fallbacks', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('ProgramsService', () => {
        it('should return API data when Online', async () => {
            const mockData = { programs: [{ id: 1, name: 'Online Prog' }] };
            (apiService.get as jest.Mock).mockResolvedValue(mockData);

            const result = await programsService.getPrograms();

            expect(apiService.get).toHaveBeenCalled();
            expect(cacheService.get).not.toHaveBeenCalled(); // Pas de fallback si succès
            expect(result).toEqual(mockData);
        });

        it('should return Cached data when Offline (API fails)', async () => {
            (apiService.get as jest.Mock).mockRejectedValue(new Error('Network Error'));

            (cacheService.get as jest.Mock).mockImplementation((key) => {
                if (key === CACHE_KEYS.PROGRAMS) {
                    return Promise.resolve([{ id_programme: 1, nom: 'Cached Prog', image: 'url', duree: 60 }]);
                }
                return Promise.resolve(null);
            });

            const result = await programsService.getPrograms();

            expect(apiService.get).toHaveBeenCalled();
            expect(cacheService.get).toHaveBeenCalledWith(CACHE_KEYS.PROGRAMS);

            // Checking mapping from DB structure to Frontend structure
            expect(result.programs).toHaveLength(1);
            expect(result.programs[0].name).toBe('Cached Prog');
            expect(result.programs[0].id).toBe(1);
        });

        it('should return empty if Cache is empty', async () => {
            (apiService.get as jest.Mock).mockRejectedValue(new Error('Network Error'));
            (cacheService.get as jest.Mock).mockResolvedValue(null);

            const result = await programsService.getPrograms();

            expect(result.programs).toEqual([]);
        });
    });

    describe('UserService', () => {
        it('should save to cache on successful profile fetch (Cache-Aside)', async () => {
            const mockProfile = { user: { id: 1, firstName: 'Nico' } };
            (apiService.get as jest.Mock).mockResolvedValue(mockProfile);

            const result = await userService.getUserProfile();

            expect(result).toEqual(mockProfile);
            expect(cacheService.save).toHaveBeenCalledWith(CACHE_KEYS.PROFILE, mockProfile);
        });

        it('should return cached profile if API fails', async () => {
            (apiService.get as jest.Mock).mockRejectedValue(new Error('Network Error'));
            const cachedProfile = { user: { id: 1, firstName: 'Cached User' } };
            (cacheService.get as jest.Mock).mockResolvedValue(cachedProfile);

            const result = await userService.getUserProfile();

            expect(result).toEqual(cachedProfile);
        });

        it('should throw if no cache available', async () => {
            (apiService.get as jest.Mock).mockRejectedValue(new Error('Network Error'));
            (cacheService.get as jest.Mock).mockResolvedValue(null);

            await expect(userService.getUserProfile()).rejects.toThrow('Network Error');
        });
    });

    describe('NutritionService', () => {
        it('should cache today nutrition on success', async () => {
            const mockData = { date: '2023-01-01', totals: { calories: 2000 } };
            (apiService.get as jest.Mock).mockResolvedValue(mockData);

            const result = await nutritionService.getTodayNutrition();

            expect(result).toEqual(mockData);
            expect(cacheService.save).toHaveBeenCalledWith(CACHE_KEYS.NUTRITION_TODAY, mockData);
        });

        it('should return cached today nutrition on failure', async () => {
            (apiService.get as jest.Mock).mockRejectedValue(new Error('Network Error'));
            const cachedData = { date: '2023-01-01', totals: { calories: 1500 } };
            (cacheService.get as jest.Mock).mockResolvedValue(cachedData);

            const result = await nutritionService.getTodayNutrition();

            expect(result).toEqual(cachedData);
            expect(cacheService.get).toHaveBeenCalledWith(CACHE_KEYS.NUTRITION_TODAY);
        });
    });

    describe('ObjectivesService', () => {
        it('should cache objectives on success', async () => {
            const mockData = [{ id: 1, title: 'Walk' }];
            (apiService.get as jest.Mock).mockResolvedValue(mockData);

            const result = await objectivesService.getDailyObjectives();

            expect(result).toEqual(mockData);
            expect(cacheService.save).toHaveBeenCalledWith(CACHE_KEYS.OBJECTIVES, mockData);
        });

        it('should return cached objectives on failure', async () => {
            (apiService.get as jest.Mock).mockRejectedValue(new Error('Network Error'));
            const cachedData = [{ id: 1, title: 'Cached Walk' }];
            (cacheService.get as jest.Mock).mockResolvedValue(cachedData);

            const result = await objectivesService.getDailyObjectives();

            expect(result).toEqual(cachedData);
        });
    });
});
