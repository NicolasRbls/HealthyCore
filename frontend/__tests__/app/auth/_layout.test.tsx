import React from 'react';
import { render } from '@testing-library/react-native';
import AuthLayout from '../../../app/auth/_layout';
import { useAuth } from '../../../context/AuthContext';
import { Redirect } from 'expo-router';
import { View } from 'react-native';

// Mocks
jest.mock('expo-router', () => {
    const React = require('react');
    const { View } = require('react-native');
    const Stack = ({ children }: { children: React.ReactNode }) => <View>{children}</View>;
    Stack.Screen = () => <View />;
    return {
        Stack,
        Redirect: jest.fn(() => null),
    };
});

jest.mock('../../../context/AuthContext', () => ({
    useAuth: jest.fn(),
}));

describe('AuthLayout', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('redirects to home if authenticated', () => {
        (useAuth as jest.Mock).mockReturnValue({
            isAuthenticated: true,
            loading: false,
        });

        render(<AuthLayout />);
        expect(Redirect).toHaveBeenCalledWith({ href: '/' }, {});
    });

    it('renders stack if not authenticated', () => {
        (useAuth as jest.Mock).mockReturnValue({
            isAuthenticated: false,
            loading: false,
        });

        const { toJSON } = render(<AuthLayout />);
        expect(toJSON()).toBeTruthy();
        expect(Redirect).not.toHaveBeenCalled();
    });

    it('renders stack if loading', () => {
        (useAuth as jest.Mock).mockReturnValue({
            isAuthenticated: true,
            loading: true,
        });

        const { toJSON } = render(<AuthLayout />);
        expect(toJSON()).toBeTruthy();
        expect(Redirect).not.toHaveBeenCalled();
    });
});
