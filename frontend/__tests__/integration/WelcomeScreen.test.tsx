import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import WelcomeScreen from '../../app/welcome';
import { useAuth } from '../../context/AuthContext';
import { router } from 'expo-router';

// Mocks
jest.mock('../../context/AuthContext');
jest.mock('expo-router', () => ({
    router: {
        push: jest.fn(),
        replace: jest.fn(),
    },
}));

describe('WelcomeScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders correctly', () => {
        (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: false, loading: false });
        const { getByText } = render(<WelcomeScreen />);

        expect(getByText(/Healthy/)).toBeTruthy();
        expect(getByText(/Core/)).toBeTruthy();
        expect(getByText('Créer un compte')).toBeTruthy();
    });

    it('navigates to register', () => {
        (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: false, loading: false });
        const { getByText } = render(<WelcomeScreen />);

        fireEvent.press(getByText('Créer un compte'));

        expect(router.push).toHaveBeenCalledWith('/register/step1_profile');
    });

    it('navigates to login', () => {
        (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: false, loading: false });
        const { getByText } = render(<WelcomeScreen />);

        fireEvent.press(getByText('Se connecter'));

        expect(router.push).toHaveBeenCalledWith('/auth/login');
    });

    it('redirects if authenticated as user', async () => {
        (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: true, loading: false, user: { role: 'user' } });
        render(<WelcomeScreen />);

        await waitFor(() => {
            expect(router.replace).toHaveBeenCalledWith('/user/dashboard');
        });
    });

    it('redirects if authenticated as admin', async () => {
        (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: true, loading: false, user: { role: 'admin' } });
        render(<WelcomeScreen />);

        await waitFor(() => {
            expect(router.replace).toHaveBeenCalledWith('/admin/dashboard');
        });
    });
});
