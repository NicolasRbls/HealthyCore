import userService from '../../services/user.service';
import apiService from '../../services/api.service';

// Mock apiService
jest.mock('../../services/api.service');

describe('userService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('gets user profile', async () => {
        const response = { user: { id: 1 } };
        (apiService.get as jest.Mock).mockResolvedValue(response);

        const result = await userService.getUserProfile();

        expect(apiService.get).toHaveBeenCalledWith('/user/profile');
        expect(result).toEqual(response);
    });

    it('gets user badges', async () => {
        const response = { unlockedBadges: [], lockedBadges: [] };
        (apiService.get as jest.Mock).mockResolvedValue(response);

        const result = await userService.getUserBadges();

        expect(apiService.get).toHaveBeenCalledWith('/user/badges');
        expect(result).toEqual(response);
    });

    it('checks new badges', async () => {
        const response = { newBadges: [] };
        (apiService.post as jest.Mock).mockResolvedValue(response);

        const result = await userService.checkNewBadges();

        expect(apiService.post).toHaveBeenCalledWith('/user/badges/check', {});
        expect(result).toEqual(response);
    });

    it('gets user evolution', async () => {
        const response = { evolution: [], statistics: {} };
        (apiService.get as jest.Mock).mockResolvedValue(response);

        const result = await userService.getUserEvolution('2023-01-01', '2023-12-31');

        expect(apiService.get).toHaveBeenCalledWith('/user/evolution?startDate=2023-01-01&endDate=2023-12-31');
        expect(result).toEqual(response);
    });

    it('adds evolution entry', async () => {
        const data = { weight: 70, height: 175 };
        const response = { evolution: { ...data, date: '2023-01-01' } };
        (apiService.post as jest.Mock).mockResolvedValue(response);

        const result = await userService.addEvolutionEntry(data);

        expect(apiService.post).toHaveBeenCalledWith('/user/evolution', data);
        expect(result).toEqual(response);
    });

    it('gets progress stats', async () => {
        const response = { period: 'month' };
        (apiService.get as jest.Mock).mockResolvedValue(response);

        const result = await userService.getProgressStats('month');

        expect(apiService.get).toHaveBeenCalledWith('/user/progress/stats?period=month');
        expect(result).toEqual(response);
    });

    it('updates profile', async () => {
        const data = { firstName: 'John' };
        const response = { user: { firstName: 'John' } };
        (apiService.put as jest.Mock).mockResolvedValue(response);

        const result = await userService.updateProfile(data);

        expect(apiService.put).toHaveBeenCalledWith('/user/edit-profile', data);
        expect(result).toEqual(response);
    });

    it('updates preferences', async () => {
        const data = { targetWeight: 75 };
        const response = { preferences: { targetWeight: 75 } };
        (apiService.put as jest.Mock).mockResolvedValue(response);

        const result = await userService.updatePreferences(data);

        expect(apiService.put).toHaveBeenCalledWith('/user/edit-preferences', data);
        expect(result).toEqual(response);
    });

    it('checks weight update status', async () => {
        const response = { needsUpdate: true };
        (apiService.get as jest.Mock).mockResolvedValue(response);

        const result = await userService.checkWeightUpdateStatus();

        expect(apiService.get).toHaveBeenCalledWith('/user/weight-update-status');
        expect(result).toEqual(response);
    });
});
