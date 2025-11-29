import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import DietScreen from '../../app/register/step6_diet';
import { useRegistration } from '../../context/RegistrationContext';
import dataService from '../../services/data.service';
import { Alert } from 'react-native';

// Mocks
jest.mock('../../context/RegistrationContext');
jest.mock('../../services/data.service');
jest.mock('../../components/layout/Header', () => 'Header');
jest.mock('../../components/layout/ProgressIndicator', () => 'ProgressIndicator');

describe('DietScreen', () => {
    const mockSetField = jest.fn();
    const mockGoToNextStep = jest.fn();
    const mockValidateStep = jest.fn();

    const mockDiets = [
        { id_regime_alimentaire: 1, nom: 'Aucun', description: 'Pas de restriction' },
        { id_regime_alimentaire: 2, nom: 'Végétarien', description: 'Pas de viande' },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(Alert, 'alert');
        (useRegistration as jest.Mock).mockReturnValue({
            data: {},
            setField: mockSetField,
            goToNextStep: mockGoToNextStep,
            validateStep: mockValidateStep,
            currentStep: 6,
            totalSteps: 5,
            loading: false,
            error: null,
        });
        (dataService.getDiets as jest.Mock).mockResolvedValue(mockDiets);
    });

    it('renders correctly and fetches diets', async () => {
        const { getByText } = render(<DietScreen />);

        expect(getByText('Suivez-vous un régime alimentaire spécifique ?')).toBeTruthy();

        await waitFor(() => {
            expect(dataService.getDiets).toHaveBeenCalled();
            expect(getByText('Aucun')).toBeTruthy();
            expect(getByText('Végétarien')).toBeTruthy();
        });
    });

    it('selects a diet and proceeds', async () => {
        mockValidateStep.mockResolvedValue(true);
        const { getByText } = render(<DietScreen />);

        await waitFor(() => expect(getByText('Aucun')).toBeTruthy());

        fireEvent.press(getByText('Aucun'));

        await waitFor(() => {
            expect(mockSetField).toHaveBeenCalledWith('dietId', 1);
        });

        fireEvent.press(getByText('Suivant'));

        await waitFor(() => {
            expect(mockValidateStep).toHaveBeenCalledWith(6);
            expect(mockGoToNextStep).toHaveBeenCalled();
        });
    });

    it('shows error if no selection', async () => {
        const { getByText } = render(<DietScreen />);

        await waitFor(() => expect(getByText('Aucun')).toBeTruthy());

        fireEvent.press(getByText('Suivant'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Erreur', 'Veuillez sélectionner un régime alimentaire');
        });
    });
});
