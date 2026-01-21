import validationService from '../../services/validation.service';
import apiService from '../../services/api.service';

// Mock apiService
jest.mock('../../services/api.service', () => ({
    post: jest.fn(),
}));

describe('ValidationService', () => {
    describe('calculateAge', () => {
        beforeAll(() => {
            // Mock Date to a fixed date: 2023-01-01
            jest.useFakeTimers();
            jest.setSystemTime(new Date('2023-01-01'));
        });

        afterAll(() => {
            jest.useRealTimers();
        });

        it('calculates age correctly', () => {
            // Born 2000-01-01 -> 23 years old
            expect(validationService.calculateAge('2000-01-01')).toBe(23);

            // Born 2000-12-31 -> 22 years old (not yet birthday in 2023)
            expect(validationService.calculateAge('2000-12-31')).toBe(22);

            // Born 2023-01-01 -> 0 years old
            expect(validationService.calculateAge('2023-01-01')).toBe(0);
        });
    });

    describe('API calls', () => {
        it('checkEmail calls apiService.post', async () => {
            (apiService.post as jest.Mock).mockResolvedValue({ available: true });

            const result = await validationService.checkEmail('test@example.com');

            expect(apiService.post).toHaveBeenCalledWith(
                '/validation/check-email',
                { email: 'test@example.com' },
                {},
                false
            );
            expect(result).toEqual({ available: true });
        });

        it('validateProfile calls apiService.post', async () => {
            (apiService.post as jest.Mock).mockResolvedValue({ isValid: true });

            const profileData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                password: 'password123'
            };

            await validationService.validateProfile(profileData);

            expect(apiService.post).toHaveBeenCalledWith(
                '/validation/validate-profile',
                profileData,
                {},
                false
            );
        });
    });
});
