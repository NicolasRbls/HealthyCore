import objectivesService from '../../services/objectives.service';
import apiService from '../../services/api.service';

jest.mock('../../services/api.service');

describe('objectivesService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('fetches daily objectives', async () => {
        const mockData = [{ id: 1, title: 'Drink water' }];
        (apiService.get as jest.Mock).mockResolvedValue(mockData);

        const result = await objectivesService.getDailyObjectives();

        expect(apiService.get).toHaveBeenCalledWith('/objectives/daily');
        expect(result).toEqual(mockData);
    });

    it('completes an objective', async () => {
        const mockResponse = { success: true };
        (apiService.put as jest.Mock).mockResolvedValue(mockResponse);

        const result = await objectivesService.completeObjective(1);

        expect(apiService.put).toHaveBeenCalledWith('/objectives/1/complete', {});
        expect(result).toEqual(mockResponse);
    });

    it('handles fetch error', async () => {
        const error = new Error('Fetch failed');
        (apiService.get as jest.Mock).mockRejectedValue(error);

        await expect(objectivesService.getDailyObjectives()).rejects.toThrow('Fetch failed');
    });

    it('handles complete error', async () => {
        const error = new Error('Complete failed');
        (apiService.put as jest.Mock).mockRejectedValue(error);

        await expect(objectivesService.completeObjective(1)).rejects.toThrow('Complete failed');
    });
});
