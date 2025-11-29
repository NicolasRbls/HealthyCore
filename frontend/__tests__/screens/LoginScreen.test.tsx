import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '../../app/auth/login';
import { router } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

// Mock AuthContext
jest.mock('../../context/AuthContext', () => ({
    useAuth: jest.fn(),
}));

// Mock Header component to avoid complexity
jest.mock('../../components/layout/Header', () => {
    const { View, Text } = require('react-native');
    return ({ title }: any) => <View><Text>{title}</Text></View>;
});

describe('LoginScreen', () => {
    const mockLogin = jest.fn();
    const mockClearError = jest.fn();

    beforeEach(() => {
        (useAuth as jest.Mock).mockReturnValue({
            login: mockLogin,
            loading: false,
            error: null,
            clearError: mockClearError,
        });
        jest.clearAllMocks();
    });

    it('renders correctly', () => {
        const { getByText, getByPlaceholderText } = render(<LoginScreen />);

        expect(getByText('Connexion')).toBeTruthy();
        expect(getByText('Connectez-vous')).toBeTruthy();
        expect(getByPlaceholderText('votre@email.com')).toBeTruthy();
        expect(getByPlaceholderText('Votre mot de passe')).toBeTruthy();
        expect(getByText('Se connecter')).toBeTruthy();
    });

    it('validates inputs', async () => {
        const { getByText, debug } = render(<LoginScreen />);

        fireEvent.press(getByText('Se connecter'));

        await waitFor(() => {
            try {
                expect(getByText("L'email est requis")).toBeTruthy();
            } catch (e) {
                debug();
                throw e;
            }
            expect(getByText("Le mot de passe est requis")).toBeTruthy();
        });

        expect(mockLogin).not.toHaveBeenCalled();
    });

    it('calls login with correct credentials', async () => {
        const { getByText, getByPlaceholderText } = render(<LoginScreen />);

        fireEvent.changeText(getByPlaceholderText('votre@email.com'), 'test@example.com');
        fireEvent.changeText(getByPlaceholderText('Votre mot de passe'), 'password123');

        fireEvent.press(getByText('Se connecter'));

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
        });
    });

    it('navigates to register screen', () => {
        const { getByText } = render(<LoginScreen />);

        fireEvent.press(getByText('Inscrivez-vous'));
        expect(router.push).toHaveBeenCalledWith('/register/step1_profile');
    });
});
