import React from 'react';
import { render, waitFor, act, fireEvent } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import authService from '../../services/auth.service';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';

// Mocks
jest.mock('../../services/auth.service');
jest.mock('expo-secure-store');
jest.mock('expo-router', () => ({
    router: {
        replace: jest.fn(),
    },
}));

import { View, Text, Button } from 'react-native';

// Helper component to test the hook
const TestComponent = () => {
    const { isAuthenticated, user, login, logout, register, loading, error } = useAuth();
    return (
        <View>
            {loading && <Text>Loading...</Text>}
            {error && <Text>{error}</Text>}
            {isAuthenticated ? <Text>Authenticated</Text> : <Text>Not Authenticated</Text>}
            {user && <Text>User: {user.firstName}</Text>}
            <Button title="Login" onPress={() => login('test@example.com', 'password')} />
            <Button title="Logout" onPress={() => logout()} />
            <Button title="Register" onPress={() => register({ email: 'new@example.com' })} />
        </View>
    );
};

describe('AuthContext', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('checks token on mount', async () => {
        (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('valid-token');
        (authService.verifyToken as jest.Mock).mockResolvedValue({
            valid: true,
            user: { id: 1, firstName: 'John', role: 'user' },
        });

        const { getByText } = render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        await waitFor(() => expect(getByText('Authenticated')).toBeTruthy());
        expect(getByText('User: John')).toBeTruthy();
    });

    it('handles invalid token on mount', async () => {
        (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('invalid-token');
        (authService.verifyToken as jest.Mock).mockRejectedValue(new Error('Invalid token'));

        const { getByText } = render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        await waitFor(() => expect(getByText('Not Authenticated')).toBeTruthy());
        expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('token');
    });

    it('logs in successfully', async () => {
        (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
        (authService.login as jest.Mock).mockResolvedValue({
            token: 'new-token',
            user: { id: 1, firstName: 'John', role: 'user' },
        });

        const { getByText } = render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        await waitFor(() => expect(getByText('Not Authenticated')).toBeTruthy());

        fireEvent.press(getByText('Login'));

        await waitFor(() => expect(getByText('Authenticated')).toBeTruthy());
        expect(SecureStore.setItemAsync).toHaveBeenCalledWith('token', 'new-token');
        expect(router.replace).toHaveBeenCalledWith('/user/dashboard');
    });

    it('logs out successfully', async () => {
        (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('valid-token');
        (authService.verifyToken as jest.Mock).mockResolvedValue({
            valid: true,
            user: { id: 1, firstName: 'John', role: 'user' },
        });

        const { getByText } = render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        await waitFor(() => expect(getByText('Authenticated')).toBeTruthy());

        fireEvent.press(getByText('Logout'));

        await waitFor(() => expect(getByText('Not Authenticated')).toBeTruthy());
        expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('token');
        expect(router.replace).toHaveBeenCalledWith('/welcome');
    });
});
