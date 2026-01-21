import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SedentaryScreen from '../../app/register/step3_sedentary';
import { useRegistration } from '../../context/RegistrationContext';
import dataService from '../../services/data.service';
import { Alert } from 'react-native';

// Mocks
jest.mock('../../context/RegistrationContext');
jest.mock('../../services/data.service');
jest.mock('../../components/layout/Header', () => 'Header');
jest.mock('../../components/layout/ProgressIndicator', () => 'ProgressIndicator');

describe('SedentaryScreen', () => {
    const mockSetField = jest.fn();
    const mockGoToNextStep = jest.fn();
    const mockValidateStep = jest.fn();

    const mockLevels = [
        { id_niveau_sedentarite: 1, nom: 'Sédentaire', description: 'Peu actif' },
        { id_niveau_sedentarite: 2, nom: 'Actif', description: 'Sportif' },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(Alert, 'alert');
        (useRegistration as jest.Mock).mockReturnValue({
            data: {},
            setField: mockSetField,
            goToNextStep: mockGoToNextStep,
            validateStep: mockValidateStep,
            currentStep: 3,
            totalSteps: 5,
            loading: false,
            error: null,
        });
        (dataService.getSedentaryLevels as jest.Mock).mockResolvedValue(mockLevels);
    });

    it('renders correctly and fetches levels', async () => {
        const { getByText } = render(<SedentaryScreen />);

        expect(getByText("Quel est votre niveau d'activité quotidienne ?")).toBeTruthy();

        await waitFor(() => {
            expect(dataService.getSedentaryLevels).toHaveBeenCalled();
            expect(getByText('Sédentaire')).toBeTruthy();
            expect(getByText('Actif')).toBeTruthy();
        });
    });

    it('selects a level and proceeds', async () => {
        mockValidateStep.mockResolvedValue(true);
        const { getByText } = render(<SedentaryScreen />);

        await waitFor(() => expect(getByText('Sédentaire')).toBeTruthy());

        fireEvent.press(getByText('Sédentaire'));

        await waitFor(() => {
            expect(mockSetField).toHaveBeenCalledWith('sedentaryLevelId', 1);
        });

        fireEvent.press(getByText('Suivant'));

        await waitFor(() => {
            expect(mockValidateStep).toHaveBeenCalledWith(3);
            expect(mockGoToNextStep).toHaveBeenCalled();
        });
    });

    it('shows error if no selection', async () => {
        const { getByText } = render(<SedentaryScreen />);

        await waitFor(() => expect(getByText('Sédentaire')).toBeTruthy());

        fireEvent.press(getByText('Suivant'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Erreur', "Veuillez sélectionner un niveau d'activité");
        });
    });

    it('handles fetch error', async () => {
        (dataService.getSedentaryLevels as jest.Mock).mockRejectedValue(new Error('Fetch failed'));
        render(<SedentaryScreen />);

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Erreur', "Impossible de charger les niveaux d'activité quotidienne");
        });
    });
});
