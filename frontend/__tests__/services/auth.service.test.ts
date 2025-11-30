import authService from '../../services/auth.service';
import apiService from '../../services/api.service';

// Mock apiService
jest.mock('../../services/api.service');

describe('authService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('registers a user', async () => {
        const userData = { email: 'test@example.com', password: 'password' };
        const response = { token: 'token', user: { id: 1, email: 'test@example.com' } };
        (apiService.post as jest.Mock).mockResolvedValue(response);

        const result = await authService.register(userData);

        expect(apiService.post).toHaveBeenCalledWith('/auth/register', userData, {}, false);
        expect(result).toEqual(response);
    });

    it('logs in a user', async () => {
        const credentials = { email: 'test@example.com', password: 'password' };
        const response = { token: 'token', user: { id: 1, email: 'test@example.com' } };
        (apiService.post as jest.Mock).mockResolvedValue(response);

        const result = await authService.login(credentials.email, credentials.password);

        expect(apiService.post).toHaveBeenCalledWith('/auth/login', credentials, {}, false);
        expect(result).toEqual(response);
    });

    it('logs out a user', async () => {
        (apiService.post as jest.Mock).mockResolvedValue({ message: 'Logged out' });

        await authService.logout();

        expect(apiService.post).toHaveBeenCalledWith('/auth/logout', {});
    });

    it('verifies token', async () => {
        const response = { valid: true, user: { id: 1 } };
        (apiService.get as jest.Mock).mockResolvedValue(response);

        const result = await authService.verifyToken();

        expect(apiService.get).toHaveBeenCalledWith('/auth/verify-token');
        expect(result).toEqual(response);
    });

    it('gets user profile', async () => {
        const response = { user: { id: 1 } };
        (apiService.get as jest.Mock).mockResolvedValue(response);

        const result = await authService.getProfile();

        expect(apiService.get).toHaveBeenCalledWith('/auth/me');
        expect(result).toEqual(response);
    });

    // Error handling tests
    it('handles register error', async () => {
        (apiService.post as jest.Mock).mockRejectedValue(new Error('Error'));
        await expect(authService.register({})).rejects.toThrow('Error');
    });

    it('handles login error', async () => {
        (apiService.post as jest.Mock).mockRejectedValue(new Error('Error'));
        await expect(authService.login('email', 'password')).rejects.toThrow('Error');
    });

    it('handles logout error gracefully', async () => {
        (apiService.post as jest.Mock).mockRejectedValue(new Error('Error'));
        jest.spyOn(console, 'error').mockImplementation(() => { });

        await authService.logout();

        expect(apiService.post).toHaveBeenCalledWith('/auth/logout', {});
        expect(console.error).toHaveBeenCalled();
        (console.error as jest.Mock).mockRestore();
    });

    it('handles verifyToken error', async () => {
        (apiService.get as jest.Mock).mockRejectedValue(new Error('Error'));
        await expect(authService.verifyToken()).rejects.toThrow('Error');
    });

    it('handles getProfile error', async () => {
        (apiService.get as jest.Mock).mockRejectedValue(new Error('Error'));
        await expect(authService.getProfile()).rejects.toThrow('Error');
    });
});
