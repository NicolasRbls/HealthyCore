import React from 'react';
import { render, waitFor, act } from '@testing-library/react-native';
import { OfflineProvider, useOffline } from '../../context/OfflineContext';
import NetInfo from '@react-native-community/netinfo';
import syncManager from '../../services/sync.manager';
import { Text } from 'react-native';

// Mocks
jest.mock('@react-native-community/netinfo', () => ({
    addEventListener: jest.fn(),
    fetch: jest.fn(() => Promise.resolve({ isConnected: true })),
    useNetInfo: jest.fn(() => ({ isConnected: true })),
}));
jest.mock('../../services/sync.manager', () => ({
    synchronize: jest.fn(),
}));

// Components for testing
const TestComponent = () => {
    const { isOffline, triggerSync } = useOffline();
    return (
        <>
            <Text>{isOffline ? 'Offline' : 'Online'}</Text>
            <Text onPress={triggerSync}>Sync</Text>
        </>
    );
};

describe('OfflineContext', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should initialize with online state', async () => {
        (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });

        const { getByText } = render(
            <OfflineProvider>
                <TestComponent />
            </OfflineProvider>
        );

        await waitFor(() => {
            expect(getByText('Online')).toBeTruthy();
        });

        // Should trigger initial sync
        expect(syncManager.synchronize).toHaveBeenCalled();
    });

    it('should update state when network changes', async () => {
        // Setup listener mock
        let listenerCallback: ((state: any) => void) | undefined;
        (NetInfo.addEventListener as jest.Mock).mockImplementation((cb) => {
            listenerCallback = cb;
            return jest.fn(); // Unsubscribe mock
        });

        const { getByText } = render(
            <OfflineProvider>
                <TestComponent />
            </OfflineProvider>
        );

        // Attendre que le listener soit attaché
        await waitFor(() => {
            expect(NetInfo.addEventListener).toHaveBeenCalled();
            expect(listenerCallback).toBeDefined();
        });

        // Simulate going offline
        act(() => {
            if (listenerCallback) listenerCallback({ isConnected: false });
        });
        await waitFor(() => expect(getByText('Offline')).toBeTruthy());

        // Simulate going online
        act(() => {
            if (listenerCallback) listenerCallback({ isConnected: true });
        });
        await waitFor(() => expect(getByText('Online')).toBeTruthy());

        // Should trigger sync (Initial + Reconnection)
        expect(syncManager.synchronize).toHaveBeenCalledTimes(2);
    });
});
