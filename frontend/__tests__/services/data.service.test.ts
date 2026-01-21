import dataService from '../../services/data.service';
import apiService from '../../services/api.service';

jest.mock('../../services/api.service');

describe('dataService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('fetches sedentary levels', async () => {
        const mockData = [{ id_niveau_sedentarite: 1, nom: 'Sédentaire', description: 'Peu actif', valeur: 1.2 }];
        (apiService.get as jest.Mock).mockResolvedValue(mockData);

        const result = await dataService.getSedentaryLevels();

        expect(apiService.get).toHaveBeenCalledWith('/data/sedentary-levels', {}, false);
        expect(result).toEqual(mockData);
    });

    it('fetches nutritional plans without type', async () => {
        const mockData = [{ id: 1, name: 'Plan 1' }];
        (apiService.get as jest.Mock).mockResolvedValue(mockData);

        const result = await dataService.getNutritionalPlans();

        expect(apiService.get).toHaveBeenCalledWith('/data/nutritional-plans', {}, false);
        expect(result).toEqual(mockData);
    });

    it('fetches nutritional plans with type', async () => {
        const mockData = [{ id: 1, name: 'Plan 1' }];
        (apiService.get as jest.Mock).mockResolvedValue(mockData);

        const result = await dataService.getNutritionalPlans('loss');

        expect(apiService.get).toHaveBeenCalledWith('/data/nutritional-plans?type=loss', {}, false);
        expect(result).toEqual(mockData);
    });

    it('fetches diets', async () => {
        const mockData = [{ id: 1, name: 'Diet 1' }];
        (apiService.get as jest.Mock).mockResolvedValue(mockData);

        const result = await dataService.getDiets();

        expect(apiService.get).toHaveBeenCalledWith('/data/diets', {}, false);
        expect(result).toEqual(mockData);
    });

    it('fetches activities', async () => {
        const mockData = [{ id: 1, name: 'Activity 1' }];
        (apiService.get as jest.Mock).mockResolvedValue(mockData);

        const result = await dataService.getActivities();

        expect(apiService.get).toHaveBeenCalledWith('/data/activities', {}, false);
        expect(result).toEqual(mockData);
    });

    it('fetches weekly sessions', async () => {
        const mockData = [{ id: 1, label: '3 sessions' }];
        (apiService.get as jest.Mock).mockResolvedValue(mockData);

        const result = await dataService.getWeeklySessions();

        expect(apiService.get).toHaveBeenCalledWith('/data/weekly-sessions', {}, false);
        expect(result).toEqual(mockData);
    });

    it('fetches user preferences', async () => {
        const mockData = { preferences: {} };
        (apiService.get as jest.Mock).mockResolvedValue(mockData);

        const result = await dataService.getUserPreferences();

        expect(apiService.get).toHaveBeenCalledWith('/data/user-preferences');
        expect(result).toEqual(mockData);
    });

    it('fetches user evolution', async () => {
        const mockData = [{ date: '2023-01-01', weight: 70 }];
        (apiService.get as jest.Mock).mockResolvedValue(mockData);

        const result = await dataService.getUserEvolution();

        expect(apiService.get).toHaveBeenCalledWith('/data/user-evolution');
        expect(result).toEqual(mockData);
    });
});
