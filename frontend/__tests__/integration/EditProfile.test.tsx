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

    const mockDropdowns = {
        sedentaryLevels: [{ id_niveau_sedentarite: 1, nom: 'Low', description: 'Low activity' }],
        nutritionalPlans: [{ id_repartition_nutritionnelle: 1, nom: 'Balanced', description: 'Balanced diet', type: 'perte_de_poids' }],
        diets: [{ id_regime_alimentaire: 1, nom: 'None', description: 'No restrictions' }],
        activities: [
            { id_activite: 1, nom: 'Running', description: 'Run' },
            { id_activite: 2, nom: 'Swimming', description: 'Swim' }
        ],
        weeklySessions: [{ id: 3, value: '3', label: '3 times' }],
    };

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(Alert, 'alert');
        (userService.getUserProfile as jest.Mock).mockResolvedValue(mockUser);
        (dataService.getSedentaryLevels as jest.Mock).mockResolvedValue(mockDropdowns.sedentaryLevels);
        (dataService.getNutritionalPlans as jest.Mock).mockResolvedValue(mockDropdowns.nutritionalPlans);
        (dataService.getDiets as jest.Mock).mockResolvedValue(mockDropdowns.diets);
        (dataService.getActivities as jest.Mock).mockResolvedValue(mockDropdowns.activities);
        (dataService.getWeeklySessions as jest.Mock).mockResolvedValue(mockDropdowns.weeklySessions);
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

    it('validates required fields', async () => {
        const { getByPlaceholderText, getByText } = render(<EditProfile />);

        await waitFor(() => expect(getByPlaceholderText('Votre prénom').props.value).toBe('John'));

        fireEvent.changeText(getByPlaceholderText('Votre prénom'), '');
        fireEvent.press(getByText('Enregistrer'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Erreur', 'Veuillez remplir tous les champs obligatoires');
            expect(userService.updateProfile).not.toHaveBeenCalled();
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

    it('toggles activities', async () => {
        const { getByText } = render(<EditProfile />);

        await waitFor(() => expect(getByText('Préférences')).toBeTruthy());
        fireEvent.press(getByText('Préférences'));

        await waitFor(() => expect(getByText('Running')).toBeTruthy());

        // Toggle Swimming (add)
        fireEvent.press(getByText('Swimming'));

        // Toggle Running (remove)
        fireEvent.press(getByText('Running'));

        fireEvent.press(getByText('Enregistrer'));

        await waitFor(() => {
            // Should have Swimming (2) and not Running (1)
            expect(userService.updatePreferences).toHaveBeenCalledWith(expect.objectContaining({
                activities: expect.arrayContaining([2])
            }));
            expect(userService.updatePreferences).toHaveBeenCalledWith(expect.objectContaining({
                activities: expect.not.arrayContaining([1])
            }));
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
