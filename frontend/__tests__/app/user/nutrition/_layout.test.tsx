import React from 'react';
import { render } from '@testing-library/react-native';
import NutritionLayout from '../../../../app/user/nutrition/_layout';
import { useAuth } from '../../../../context/AuthContext';
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

jest.mock('../../../../context/AuthContext', () => ({
    useAuth: jest.fn(),
}));

describe('NutritionLayout', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders null when loading', () => {
        (useAuth as jest.Mock).mockReturnValue({
            isAuthenticated: false,
            loading: true,
            user: null,
        });

        const { toJSON } = render(<NutritionLayout />);
        expect(toJSON()).toBeNull();
    });

    it('redirects to welcome when not authenticated', () => {
        (useAuth as jest.Mock).mockReturnValue({
            isAuthenticated: false,
            loading: false,
            user: null,
        });

        render(<NutritionLayout />);
        expect(Redirect).toHaveBeenCalledWith({ href: '/welcome' }, {});
    });

    it('renders stack when authenticated', () => {
        (useAuth as jest.Mock).mockReturnValue({
            isAuthenticated: true,
            loading: false,
            user: { id: 1 },
        });

        const { toJSON } = render(<NutritionLayout />);
        expect(toJSON()).toBeTruthy();
        expect(Redirect).not.toHaveBeenCalled();
    });
});
