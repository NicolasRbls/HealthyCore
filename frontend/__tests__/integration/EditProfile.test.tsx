import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import EditProfile from '../../app/user/profile/edit';
import userService from '../../services/user.service';
import dataService from '../../services/data.service';
import { Alert } from 'react-native';
import { router } from 'expo-router';

// Mocks
jest.mock('../../services/user.service');
jest.mock('../../services/data.service');
jest.mock('expo-router', () => ({
    router: {
        back: jest.fn(),
    },
}));
jest.mock('../../components/layout/Header', () => 'Header');
jest.mock('../../components/ui/DatePicker', () => 'DatePicker');

describe('EditProfile', () => {
    const mockUser = {
        user: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            gender: 'H',
            birthDate: '1990-01-01',
        },
        metrics: {
            currentWeight: 80,
            targetWeight: 75,
            sessionsPerWeek: 3,
        },
        preferences: {
            sedentaryLevel: { id: 1 },
            nutritionalPlan: { id: 1 },
            diet: { id: 1 },
            activities: [{ id_activite: 1 }],
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(Alert, 'alert');
        (userService.getUserProfile as jest.Mock).mockResolvedValue(mockUser);
        (dataService.getSedentaryLevels as jest.Mock).mockResolvedValue([]);
        (dataService.getNutritionalPlans as jest.Mock).mockResolvedValue([]);
        (dataService.getDiets as jest.Mock).mockResolvedValue([]);
        (dataService.getActivities as jest.Mock).mockResolvedValue([]);
        (dataService.getWeeklySessions as jest.Mock).mockResolvedValue([]);
    });

    it('renders correctly and fetches user profile', async () => {
        const { getByText, getByPlaceholderText } = render(<EditProfile />);

        await waitFor(() => {
            expect(userService.getUserProfile).toHaveBeenCalled();
            expect(getByPlaceholderText('Votre prénom').props.value).toBe('John');
            expect(getByPlaceholderText('Votre nom').props.value).toBe('Doe');
        });
    });

    it('updates profile successfully', async () => {
        const { getByPlaceholderText, getByText } = render(<EditProfile />);

        await waitFor(() => expect(getByPlaceholderText('Votre prénom').props.value).toBe('John'));

        fireEvent.changeText(getByPlaceholderText('Votre prénom'), 'Jane');
        fireEvent.press(getByText('Enregistrer'));

        await waitFor(() => {
            expect(userService.updateProfile).toHaveBeenCalledWith(expect.objectContaining({ firstName: 'Jane' }));
            expect(Alert.alert).toHaveBeenCalledWith('Succès', 'Profil mis à jour avec succès');
        });
    });

    it('switches tabs and updates preferences', async () => {
        const { getByText, getByPlaceholderText } = render(<EditProfile />);

        await waitFor(() => expect(getByText('Profil')).toBeTruthy());

        fireEvent.press(getByText('Préférences'));

        await waitFor(() => {
            expect(getByPlaceholderText('Votre poids cible')).toBeTruthy();
        });

        fireEvent.changeText(getByPlaceholderText('Votre poids cible'), '70');
        fireEvent.press(getByText('Enregistrer'));

        await waitFor(() => {
            expect(userService.updatePreferences).toHaveBeenCalledWith(expect.objectContaining({ targetWeight: 70 }));
            expect(Alert.alert).toHaveBeenCalledWith('Succès', 'Préférences mises à jour avec succès');
        });
    });

    it('handles fetch error', async () => {
        (userService.getUserProfile as jest.Mock).mockRejectedValue(new Error('Fetch failed'));
        render(<EditProfile />);

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Erreur', 'Impossible de charger les données du profil');
        });
    });
});
