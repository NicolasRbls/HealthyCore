import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import ProfileScreen from '../../app/user/profile/index';
import userService from '../../services/user.service';
import authService from '../../services/auth.service';
import { router } from 'expo-router';

// Mocks
jest.mock('../../services/user.service');
jest.mock('../../services/auth.service');
jest.mock('expo-router', () => {
    const React = require('react');
    const push = jest.fn();
    const router = { push };
    return {
        useRouter: jest.fn(() => router),
        router,
        useFocusEffect: jest.fn((callback) => React.useEffect(callback, [callback])),
    };
});

jest.mock('../../context/AuthContext', () => ({
    useAuth: () => ({
        user: { firstName: 'John', lastName: 'Doe' },
        logout: jest.fn(),
    }),
}));

describe('ProfileScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders correctly with user data', async () => {
        // Mock responses
        (userService.getUserProfile as jest.Mock).mockResolvedValue({
            user: {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                gender: 'H',
                birthDate: '1990-01-01',
                age: 30,
            },
            metrics: {
                currentHeight: 180,
                currentWeight: 75,
                targetWeight: 70,
                dailyCalories: 2000,
                bmi: 23.1,
            },
        });

        (userService.getProgressStats as jest.Mock).mockResolvedValue({
            weight: { change: -2, changePercentage: 2.5, trend: 'descending' },
            nutrition: { goalCompletionRate: 80 },
            activity: { completedSessions: 10, goalCompletionRate: 90 },
            overview: { streakDays: 5 },
        });

        const { getByText } = render(<ProfileScreen />);

        await waitFor(() => {
            expect(getByText('John Doe')).toBeTruthy();
            expect(getByText('john.doe@example.com')).toBeTruthy();
            expect(getByText('180cm')).toBeTruthy();
            expect(getByText('75kg')).toBeTruthy();
            expect(getByText('30 ans')).toBeTruthy();
            expect(getByText('Homme')).toBeTruthy();
            expect(getByText('Perte de poids')).toBeTruthy();
            expect(getByText('23.1 (Normal)')).toBeTruthy();
        });
    });

    it('handles logout', async () => {
        (userService.getUserProfile as jest.Mock).mockResolvedValue({ user: {}, metrics: {} });
        (userService.getProgressStats as jest.Mock).mockResolvedValue({});
        (authService.logout as jest.Mock).mockResolvedValue({});

        const { getByText } = render(<ProfileScreen />);

        await waitFor(() => {
            expect(getByText('Se déconnecter')).toBeTruthy();
        });

        fireEvent.press(getByText('Se déconnecter'));

        await waitFor(() => {
            expect(authService.logout).toHaveBeenCalled();
        });
    });
});
