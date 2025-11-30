import React from 'react';
import { render } from '@testing-library/react-native';
import UserLayout from '../../../app/user/_layout';
import { useAuth } from '../../../context/AuthContext';
import { Redirect } from 'expo-router';
import { View } from 'react-native';

// Mocks
jest.mock('expo-router', () => {
    const React = require('react');
    const { View } = require('react-native');
    const Tabs = ({ children }: { children: React.ReactNode }) => <View>{children}</View>;
    Tabs.Screen = () => <View />;
    return {
        Tabs,
        Redirect: jest.fn(() => null),
    };
});

jest.mock('../../../context/AuthContext', () => ({
    useAuth: jest.fn(),
}));

jest.mock('@expo/vector-icons', () => ({
    Ionicons: 'Ionicons',
}));

describe('UserLayout', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders null when loading', () => {
        (useAuth as jest.Mock).mockReturnValue({
            isAuthenticated: false,
            loading: true,
            user: null,
        });

        const { toJSON } = render(<UserLayout />);
        expect(toJSON()).toBeNull();
    });

    it('redirects to welcome when not authenticated', () => {
        (useAuth as jest.Mock).mockReturnValue({
            isAuthenticated: false,
            loading: false,
            user: null,
        });

        render(<UserLayout />);
        expect(Redirect).toHaveBeenCalledWith({ href: '/welcome' }, {});
    });

    it('renders tabs when authenticated', () => {
        (useAuth as jest.Mock).mockReturnValue({
            isAuthenticated: true,
            loading: false,
            user: { id: 1 },
        });

        const { toJSON } = render(<UserLayout />);
        expect(toJSON()).toBeTruthy();
        expect(Redirect).not.toHaveBeenCalled();
    });
});
