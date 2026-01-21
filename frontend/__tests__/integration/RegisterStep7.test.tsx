import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ActivitiesScreen from '../../app/register/step7_activities';
import { useRegistration } from '../../context/RegistrationContext';
import dataService from '../../services/data.service';
import { Alert } from 'react-native';

// Mocks
jest.mock('../../context/RegistrationContext');
jest.mock('../../services/data.service');
jest.mock('../../components/layout/Header', () => 'Header');
jest.mock('../../components/layout/ProgressIndicator', () => 'ProgressIndicator');

describe('ActivitiesScreen', () => {
    const mockSetField = jest.fn();
    const mockGoToNextStep = jest.fn();
    const mockValidateStep = jest.fn();

    const mockActivities = [
        { id_activite: 1, nom: 'Running', description: 'Course à pied' },
        { id_activite: 2, nom: 'Yoga', description: 'Relaxation' },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(Alert, 'alert');
        (useRegistration as jest.Mock).mockReturnValue({
            data: { activities: [] },
            setField: mockSetField,
            goToNextStep: mockGoToNextStep,
            validateStep: mockValidateStep,
            currentStep: 7,
            totalSteps: 5,
            loading: false,
            error: null,
        });
        (dataService.getActivities as jest.Mock).mockResolvedValue(mockActivities);
    });

    it('renders correctly and fetches activities', async () => {
        const { getByText } = render(<ActivitiesScreen />);

        expect(getByText("Quel type d'activité physique préférez-vous ?")).toBeTruthy();

        await waitFor(() => {
            expect(dataService.getActivities).toHaveBeenCalled();
            expect(getByText('Running')).toBeTruthy();
            expect(getByText('Yoga')).toBeTruthy();
        });
    });

    it('toggles activities and proceeds', async () => {
        mockValidateStep.mockResolvedValue(true);
        const { getByText } = render(<ActivitiesScreen />);

        await waitFor(() => expect(getByText('Running')).toBeTruthy());

        // Select Running
        fireEvent.press(getByText('Running'));

        await waitFor(() => {
            expect(mockSetField).toHaveBeenCalledWith('activities', [1]);
        });

        // Select Yoga
        fireEvent.press(getByText('Yoga'));

        await waitFor(() => {
            expect(mockSetField).toHaveBeenCalledWith('activities', [1, 2]);
        });

        // Deselect Running
        fireEvent.press(getByText('Running'));

        await waitFor(() => {
            expect(mockSetField).toHaveBeenCalledWith('activities', [2]);
        });

        fireEvent.press(getByText('Suivant'));

        await waitFor(() => {
            expect(mockValidateStep).toHaveBeenCalledWith(7);
            expect(mockGoToNextStep).toHaveBeenCalled();
        });
    });

    it('shows error if no selection', async () => {
        const { getByText } = render(<ActivitiesScreen />);

        await waitFor(() => expect(getByText('Running')).toBeTruthy());

        fireEvent.press(getByText('Suivant'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Erreur', 'Veuillez sélectionner au moins une activité');
        });
    });
});
