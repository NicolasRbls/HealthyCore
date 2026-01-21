import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CompleteScreen from '../../app/register/step9_complete';
import { useRegistration } from '../../context/RegistrationContext';
import { Alert } from 'react-native';
import { router } from 'expo-router';

// Mocks
jest.mock('../../context/RegistrationContext');
jest.mock('expo-router', () => ({
    router: {
        replace: jest.fn(),
    },
}));

describe('CompleteScreen', () => {
    const mockCompleteRegistration = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(Alert, 'alert');
        (useRegistration as jest.Mock).mockReturnValue({
            data: {
                firstName: 'John',
                targetWeight: 75,
                activities: [1],
            },
            completeRegistration: mockCompleteRegistration,
            loading: false,
        });
    });

    it('renders correctly', () => {
        const { getByText } = render(<CompleteScreen />);

        expect(getByText('Bienvenue, John')).toBeTruthy();
        expect(getByText("C'est parti !")).toBeTruthy();
    });

    it('completes registration on button press', async () => {
        const { getByText } = render(<CompleteScreen />);

        fireEvent.press(getByText("C'est parti !"));

        await waitFor(() => {
            expect(mockCompleteRegistration).toHaveBeenCalled();
        });
    });

    it('redirects if data is missing', async () => {
        (useRegistration as jest.Mock).mockReturnValue({
            data: {
                firstName: '', // Missing
            },
            completeRegistration: mockCompleteRegistration,
            loading: false,
        });

        render(<CompleteScreen />);

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith(
                'Erreur',
                "Vous devez compléter toutes les étapes d'inscription",
                expect.any(Array)
            );
        });
    });
});
