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
    it('gets user evolution with start date', async () => {
        const response = { evolution: [], statistics: {} };
        (apiService.get as jest.Mock).mockResolvedValue(response);

        await userService.getUserEvolution('2023-01-01');

        expect(apiService.get).toHaveBeenCalledWith('/user/evolution?startDate=2023-01-01');
    });

    it('gets user evolution with end date', async () => {
        const response = { evolution: [], statistics: {} };
        (apiService.get as jest.Mock).mockResolvedValue(response);

        await userService.getUserEvolution(undefined, '2023-12-31');

        expect(apiService.get).toHaveBeenCalledWith('/user/evolution?endDate=2023-12-31');
    });

    it('gets user evolution without params', async () => {
        const response = { evolution: [], statistics: {} };
        (apiService.get as jest.Mock).mockResolvedValue(response);

        await userService.getUserEvolution();

        expect(apiService.get).toHaveBeenCalledWith('/user/evolution');
    });

    it('gets progress stats with default period', async () => {
        const response = { period: 'month' };
        (apiService.get as jest.Mock).mockResolvedValue(response);

        await userService.getProgressStats();

        expect(apiService.get).toHaveBeenCalledWith('/user/progress/stats?period=month');
    });

    // Error handling tests
    it('handles getUserProfile error', async () => {
        (apiService.get as jest.Mock).mockRejectedValue(new Error('Error'));
        await expect(userService.getUserProfile()).rejects.toThrow('Error');
    });

    it('handles getUserBadges error', async () => {
        (apiService.get as jest.Mock).mockRejectedValue(new Error('Error'));
        await expect(userService.getUserBadges()).rejects.toThrow('Error');
    });

    it('handles checkNewBadges error', async () => {
        (apiService.post as jest.Mock).mockRejectedValue(new Error('Error'));
        await expect(userService.checkNewBadges()).rejects.toThrow('Error');
    });

    it('handles getUserEvolution error', async () => {
        (apiService.get as jest.Mock).mockRejectedValue(new Error('Error'));
        await expect(userService.getUserEvolution()).rejects.toThrow('Error');
    });

    it('handles addEvolutionEntry error', async () => {
        (apiService.post as jest.Mock).mockRejectedValue(new Error('Error'));
        await expect(userService.addEvolutionEntry({ weight: 70, height: 175 })).rejects.toThrow('Error');
    });

    it('handles getProgressStats error', async () => {
        (apiService.get as jest.Mock).mockRejectedValue(new Error('Error'));
        await expect(userService.getProgressStats()).rejects.toThrow('Error');
    });

    it('handles updateProfile error', async () => {
        (apiService.put as jest.Mock).mockRejectedValue(new Error('Error'));
        await expect(userService.updateProfile({})).rejects.toThrow('Error');
    });

    it('handles updatePreferences error', async () => {
        (apiService.put as jest.Mock).mockRejectedValue(new Error('Error'));
        await expect(userService.updatePreferences({})).rejects.toThrow('Error');
    });

    it('handles checkWeightUpdateStatus error', async () => {
        (apiService.get as jest.Mock).mockRejectedValue(new Error('Error'));
        await expect(userService.checkWeightUpdateStatus()).rejects.toThrow('Error');
    });
});
