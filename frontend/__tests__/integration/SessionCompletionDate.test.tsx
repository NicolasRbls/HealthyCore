import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SportMonitoring from '../../app/user/dashboard/sport-monitoring';
import apiService from '../../services/api.service';
import { format } from 'date-fns';

// Mocks
jest.mock('../../services/api.service');
jest.mock('expo-router', () => {
    const React = require('react');
    const push = jest.fn();
    const back = jest.fn();
    const router = { push, back };
    return {
        useRouter: jest.fn(() => router),
        router,
        useLocalSearchParams: jest.fn(() => ({})),
        useFocusEffect: jest.fn((callback) => React.useEffect(callback, [callback])),
    };
});
jest.mock('../../components/layout/Header', () => 'Header');
jest.mock('@expo/vector-icons', () => ({
    Ionicons: 'Ionicons',
}));

describe('SessionCompletionDate', () => {
    const mockTodaySession = {
        todaySession: {
            id: 1,
            name: 'Morning Run',
            completed: false,
        }
    };

    const mockSportProgress = {
        activeProgram: { name: 'Cardio Blast' },
        weeklySchedule: [
            {
                date: format(new Date(), 'yyyy-MM-dd'),
                session: {
                    id: 1,
                    name: 'Morning Run',
                    completed: false,
                }
            }
        ]
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (apiService.get as jest.Mock).mockImplementation((url) => {
            if (url.includes('sport-progress')) return Promise.resolve(mockSportProgress);
            if (url.includes('today-session')) return Promise.resolve(mockTodaySession);
            return Promise.resolve({});
        });
        (apiService.post as jest.Mock).mockResolvedValue({});
    });

    it('sends the local date when marking a session as complete via switch', async () => {
        const { getByRole, getAllByRole } = render(<SportMonitoring />);

        // Wait for data to load
        await waitFor(() => {
            expect(apiService.get).toHaveBeenCalled();
        });

        // Find the switch for the session
        // Note: React Native Switch uses 'switch' role
        const switches = await waitFor(() => getAllByRole('switch'));
        const todaySwitch = switches[0];

        // Toggle the switch
        fireEvent(todaySwitch, 'valueChange', true);

        // Verify API call
        const expectedDate = format(new Date(), 'yyyy-MM-dd');

        await waitFor(() => {
            expect(apiService.post).toHaveBeenCalledWith(
                '/data/programs/sessions/1/complete',
                { date: expectedDate }
            );
        });
    });
});
