import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SportMonitoring from '../../app/user/dashboard/sport-monitoring';
import apiService from '../../services/api.service';
import { router } from 'expo-router';
import { format } from 'date-fns';

// Mocks
jest.mock('../../services/api.service');
jest.mock('expo-router', () => ({
    router: {
        back: jest.fn(),
        push: jest.fn(),
    },
}));
jest.mock('../../components/layout/Header', () => 'Header');
jest.mock('@expo/vector-icons', () => ({
    Ionicons: 'Ionicons',
}));

describe('SportMonitoring', () => {
    const mockSportProgress = {
        activeProgram: { name: 'Test Program|Description' },
        weeklySchedule: [
            {
                date: new Date().toISOString().split('T')[0],
                session: { id: 1, name: 'Today Session', completed: false },
            },
        ],
    };

    const mockTodaySession = {
        todaySession: { id: 1, name: 'Today Session', completed: false },
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (apiService.get as jest.Mock).mockImplementation((url) => {
            if (url.includes('sport-progress')) return Promise.resolve(mockSportProgress);
            if (url.includes('today-session')) return Promise.resolve(mockTodaySession);
            return Promise.reject(new Error('Unknown URL'));
        });
    });

    it('renders correctly and fetches sport data', async () => {
        const { findByText } = render(<SportMonitoring />);

        expect(await findByText('Test Program')).toBeTruthy();
        expect(await findByText(/Today Session/)).toBeTruthy();
    });

    it('toggles session completion', async () => {
        const { getByRole, getAllByRole } = render(<SportMonitoring />);

        // Wait for switch to be rendered. Switch role is 'switch'
        await waitFor(() => expect(getAllByRole('switch').length).toBeGreaterThan(0));

        const switchElement = getAllByRole('switch')[0];
        fireEvent(switchElement, 'valueChange', true);

        await waitFor(() => {
            const expectedDate = format(new Date(), 'yyyy-MM-dd');
            expect(apiService.post).toHaveBeenCalledWith('/data/programs/sessions/1/complete', { date: expectedDate });
        });
    });

    it('navigates to session details', async () => {
        const { getByText } = render(<SportMonitoring />);

        await waitFor(() => expect(getByText(/Today Session/)).toBeTruthy());

        fireEvent.press(getByText(/Today Session/));

        expect(router.push).toHaveBeenCalledWith('/user/sport/sessions/1?from=monitoring');
    });
});
