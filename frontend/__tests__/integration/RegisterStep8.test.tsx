import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SessionsScreen from '../../app/register/step8_sessions';
import { useRegistration } from '../../context/RegistrationContext';
import dataService from '../../services/data.service';
import { Alert } from 'react-native';

// Mocks
jest.mock('../../context/RegistrationContext');
jest.mock('../../services/data.service');
jest.mock('../../components/layout/Header', () => 'Header');
jest.mock('../../components/layout/ProgressIndicator', () => 'ProgressIndicator');

describe('SessionsScreen', () => {
    const mockSetField = jest.fn();
    const mockGoToNextStep = jest.fn();
    const mockValidateStep = jest.fn();

    const mockSessions = [
        { id: 1, value: '1-2', label: '1 à 2 séances' },
        { id: 2, value: '3-4', label: '3 à 4 séances' },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(Alert, 'alert');
        (useRegistration as jest.Mock).mockReturnValue({
            data: {},
            setField: mockSetField,
            goToNextStep: mockGoToNextStep,
            validateStep: mockValidateStep,
            currentStep: 8,
            totalSteps: 5,
            loading: false,
            error: null,
        });
        (dataService.getWeeklySessions as jest.Mock).mockResolvedValue(mockSessions);
    });

    it('renders correctly and fetches sessions', async () => {
        const { getByText } = render(<SessionsScreen />);

        expect(getByText('Combien de séances de sport souhaitez-vous faire par semaine ?')).toBeTruthy();

        await waitFor(() => {
            expect(dataService.getWeeklySessions).toHaveBeenCalled();
            expect(getByText('1-2')).toBeTruthy();
            expect(getByText('3-4')).toBeTruthy();
        });
    });

    it('selects a session option and proceeds', async () => {
        mockValidateStep.mockResolvedValue(true);
        const { getByText } = render(<SessionsScreen />);

        await waitFor(() => expect(getByText('1-2')).toBeTruthy());

        fireEvent.press(getByText('1-2'));

        await waitFor(() => {
            expect(mockSetField).toHaveBeenCalledWith('sessionsPerWeek', 1);
        });

        fireEvent.press(getByText('Suivant'));

        await waitFor(() => {
            expect(mockValidateStep).toHaveBeenCalledWith(8);
            expect(mockGoToNextStep).toHaveBeenCalled();
        });
    });

    it('shows error if no selection', async () => {
        const { getByText } = render(<SessionsScreen />);

        await waitFor(() => expect(getByText('1-2')).toBeTruthy());

        fireEvent.press(getByText('Suivant'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Erreur', 'Veuillez sélectionner un nombre de séances par semaine');
        });
    });
});
