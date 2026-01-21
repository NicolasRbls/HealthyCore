import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import WelcomeScreen from '../../app/welcome';
import { router } from 'expo-router';

// Mock AuthContext
jest.mock('../../context/AuthContext', () => ({
    useAuth: jest.fn(() => ({
        isAuthenticated: false,
        loading: false,
        user: null,
    })),
}));

describe('WelcomeScreen', () => {
    it('renders correctly', () => {
        const { getByText } = render(<WelcomeScreen />);

        expect(getByText('HealthyCore')).toBeTruthy();
        expect(getByText('Le cœur de votre santé')).toBeTruthy();
        expect(getByText('Créer un compte')).toBeTruthy();
        expect(getByText('Se connecter')).toBeTruthy();
    });

    it('navigates to register screen on register button press', () => {
        const { getByText } = render(<WelcomeScreen />);

        fireEvent.press(getByText('Créer un compte'));
        expect(router.push).toHaveBeenCalledWith('/register/step1_profile');
    });

    it('navigates to login screen on login button press', () => {
        const { getByText } = render(<WelcomeScreen />);

        fireEvent.press(getByText('Se connecter'));
        expect(router.push).toHaveBeenCalledWith('/auth/login');
    });
});
