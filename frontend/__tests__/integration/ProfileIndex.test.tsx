import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ProfileScreen from '../../app/user/profile/index';
import userService from '../../services/user.service';
import authService from '../../services/auth.service';
import { Alert } from 'react-native';
import { router } from 'expo-router';

// Mocks
jest.mock('../../services/user.service');
jest.mock('../../services/auth.service');
jest.mock('expo-router', () => ({
    router: {
        push: jest.fn(),
    },
}));
jest.mock('../../components/layout/Header', () => {
    const { Text } = require('react-native');
    return ({ title }: any) => <Text>{title}</Text>;
});
jest.mock('../../components/ui/WeightUpdateReminder', () => {
    return () => null;
});

const mockLogout = jest.fn();
jest.mock('../../context/AuthContext', () => ({
    useAuth: () => ({
        user: { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
        logout: mockLogout,
    }),
}));

describe('ProfileScreen', () => {
    const mockUserData = {
        user: {
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            gender: 'H',
            birthDate: '1990-01-01',
            age: 33,
        },
        metrics: {
            currentHeight: 180,
            currentWeight: 80,
            targetWeight: 75,
            dailyCalories: 2500,
            bmi: 24.7,
        },
    };

    const mockProgressStats = {
        weight: {
            change: -2,
            changePercentage: -2.5,
            trend: 'descending',
        },
        nutrition: {
            goalCompletionRate: 80,
        },
        activity: {
            completedSessions: 12,
            goalCompletionRate: 90,
        },
        overview: {
            streakDays: 5,
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(Alert, 'alert');
        (userService.getUserProfile as jest.Mock).mockResolvedValue(mockUserData);
        (userService.getProgressStats as jest.Mock).mockResolvedValue(mockProgressStats);
    });

    it('renders correctly and fetches data', async () => {
        const { getByText } = render(<ProfileScreen />);

        await waitFor(() => {
            expect(userService.getUserProfile).toHaveBeenCalled();
            expect(userService.getProgressStats).toHaveBeenCalledWith('month');
            expect(getByText('John Doe')).toBeTruthy();
            expect(getByText('Perte de poids')).toBeTruthy(); // 75 < 80
            expect(getByText('24.7 (Normal)')).toBeTruthy();
        });
    });

    it('handles fetch error', async () => {
        (userService.getUserProfile as jest.Mock).mockRejectedValue(new Error('Fetch failed'));

        render(<ProfileScreen />);

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Erreur', 'Impossible de charger les informations du profil');
        });
    });

    it('navigates to sections', async () => {
        const { getByTestId } = render(<ProfileScreen />);

        await waitFor(() => expect(getByTestId('progress-button')).toBeTruthy());

        fireEvent.press(getByTestId('progress-button'));
        expect(router.push).toHaveBeenCalledWith('/user/profile/progress');

        fireEvent.press(getByTestId('badges-button'));
        expect(router.push).toHaveBeenCalledWith('/user/dashboard/badge-monitoring');

        fireEvent.press(getByTestId('edit-profile-button'));
        expect(router.push).toHaveBeenCalledWith('/user/profile/edit');
    });

    it('handles logout success', async () => {
        const { getByTestId } = render(<ProfileScreen />);

        await waitFor(() => expect(getByTestId('logout-button')).toBeTruthy());

        fireEvent.press(getByTestId('logout-button'));

        await waitFor(() => {
            expect(authService.logout).toHaveBeenCalled();
            expect(mockLogout).toHaveBeenCalled();
        });
    });

    it('handles logout error', async () => {
        (authService.logout as jest.Mock).mockRejectedValue(new Error('Logout failed'));

        const { getByTestId } = render(<ProfileScreen />);

        await waitFor(() => expect(getByTestId('logout-button')).toBeTruthy());

        fireEvent.press(getByTestId('logout-button'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith(
                'Erreur',
                'Une erreur est survenue lors de la déconnexion. Veuillez réessayer.'
            );
        });
    });

    it('displays progress stats correctly', async () => {
        const { getByText } = render(<ProfileScreen />);

        await waitFor(() => {
            expect(getByText('Progression ce mois-ci')).toBeTruthy();
            expect(getByText('-2 kg (-2.5%)')).toBeTruthy();
            expect(getByText('80% de suivi')).toBeTruthy();
            expect(getByText('12 séances (90%)')).toBeTruthy();
            expect(getByText('5 jours consécutifs')).toBeTruthy();
        });
    });
});
