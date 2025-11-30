import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import ProfileScreen from '../../app/register/step1_profile';
import { RegistrationProvider } from '../../context/RegistrationContext';
import validationService from '../../services/validation.service';
import { router } from 'expo-router';

// Mocks
jest.mock('../../services/validation.service');
jest.mock('expo-router', () => ({
    router: {
        push: jest.fn(),
        back: jest.fn(),
    },
}));

// Mock AuthContext used by RegistrationProvider
jest.mock('../../context/AuthContext', () => ({
    useAuth: () => ({
        register: jest.fn(),
    }),
}));

describe('RegisterFlow - Step 1 (Profile)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders correctly', () => {
        const { getByPlaceholderText, getByText } = render(
            <RegistrationProvider>
                <ProfileScreen />
            </RegistrationProvider>
        );

        expect(getByPlaceholderText('Votre prénom')).toBeTruthy();
        expect(getByPlaceholderText('Votre nom')).toBeTruthy();
        expect(getByPlaceholderText('votre@email.com')).toBeTruthy();
        expect(getByText('Suivant')).toBeTruthy();
    });

    it('shows validation errors on empty submit', async () => {
        const { getByText, debug } = render(
            <RegistrationProvider>
                <ProfileScreen />
            </RegistrationProvider>
        );

        fireEvent.press(getByText('Suivant'));

        try {
            await waitFor(() => {
                expect(getByText('Le prénom est requis')).toBeTruthy();
                expect(getByText('Le nom est requis')).toBeTruthy();
                expect(getByText("L'email est requis")).toBeTruthy();
                expect(getByText('Le mot de passe est requis')).toBeTruthy();
                expect(getByText("Vous devez accepter les conditions d'utilisation")).toBeTruthy();
            });
        } catch (e) {
            debug();
            throw e;
        }
    });

    it('submits successfully with valid data', async () => {
        (validationService.validateProfile as jest.Mock).mockResolvedValue({ isValid: true, errors: {} });
        (validationService.checkEmail as jest.Mock).mockResolvedValue({ available: true });

        const { getByPlaceholderText, getByText, getByTestId } = render(
            <RegistrationProvider>
                <ProfileScreen />
            </RegistrationProvider>
        );

        fireEvent.changeText(getByPlaceholderText('Votre prénom'), 'John');
        fireEvent.changeText(getByPlaceholderText('Votre nom'), 'Doe');
        fireEvent.changeText(getByPlaceholderText('votre@email.com'), 'john.doe@example.com');
        fireEvent.changeText(getByPlaceholderText('Mot de passe (8 caractères min.)'), 'password123');

        // Accept terms
        fireEvent.press(getByTestId('terms-checkbox'));

        fireEvent.press(getByText('Suivant'));

        await waitFor(() => {
            expect(validationService.validateProfile).toHaveBeenCalledWith({
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                password: 'password123',
            });
            expect(router.push).toHaveBeenCalledWith('/register/step2_physical');
        });
    });
});
