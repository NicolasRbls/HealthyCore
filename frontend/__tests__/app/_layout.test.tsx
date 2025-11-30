import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import RootLayout from '../../app/_layout';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';

// Mocks
jest.mock('expo-splash-screen', () => ({
    preventAutoHideAsync: jest.fn(),
    hideAsync: jest.fn(),
}));

jest.mock('expo-font', () => ({
    useFonts: jest.fn(),
}));

jest.mock('expo-router', () => ({
    Stack: () => null,
}));

jest.mock('react-native-safe-area-context', () => ({
    SafeAreaProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('../../context/AuthContext', () => ({
    AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('../../context/RegistrationContext', () => ({
    RegistrationProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('../../components/ui/StatusBar', () => 'StatusBar');

describe('RootLayout', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders null when fonts are not loaded', () => {
        (useFonts as jest.Mock).mockReturnValue([false, null]);
        const { toJSON } = render(<RootLayout />);
        expect(toJSON()).toBeNull();
    });

    it('renders children when fonts are loaded', async () => {
        (useFonts as jest.Mock).mockReturnValue([true, null]);
        const { toJSON } = render(<RootLayout />);
        expect(toJSON()).toBeTruthy();

        await waitFor(() => {
            expect(SplashScreen.hideAsync).toHaveBeenCalled();
        });
    });

    it('renders children when font error occurs', async () => {
        (useFonts as jest.Mock).mockReturnValue([false, new Error('Font error')]);
        const { toJSON } = render(<RootLayout />);
        expect(toJSON()).toBeTruthy();

        await waitFor(() => {
            expect(SplashScreen.hideAsync).toHaveBeenCalled();
        });
    });
});
