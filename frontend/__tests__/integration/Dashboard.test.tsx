import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import Dashboard from '../../app/user/dashboard/index';
import authService from '../../services/auth.service';
import { nutritionService } from '../../services/nutrition.service';
import objectivesService from '../../services/objectives.service';
import apiService from '../../services/api.service';
import dataService from '../../services/data.service';
import { router } from 'expo-router';
import { format } from 'date-fns';

// Mocks
jest.mock('../../services/auth.service');
jest.mock('../../services/nutrition.service');
jest.mock('../../services/objectives.service');
jest.mock('../../services/api.service');
jest.mock('../../services/data.service');

jest.mock('../../context/AuthContext', () => ({
    useAuth: () => ({
        user: { firstName: 'John' },
    }),
}));

jest.mock('expo-router', () => {
    const React = require('react');
    const push = jest.fn();
    const back = jest.fn();
    const router = { push, back };
    return {
        useRouter: jest.fn(() => router),
        router,
        useLocalSearchParams: jest.fn().mockReturnValue({}),
        useFocusEffect: jest.fn((callback) => React.useEffect(callback, [])),
    };
});

jest.mock('@expo/vector-icons', () => ({
    Ionicons: 'Ionicons',
}));

describe('Dashboard', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers({
            doNotFake: [
                'hrtime',
                'nextTick',
                'performance',
                'queueMicrotask',
                'requestAnimationFrame',
                'cancelAnimationFrame',
                'requestIdleCallback',
                'cancelIdleCallback',
                'setImmediate',
                'clearImmediate',
                'setInterval',
                'clearInterval',
                'setTimeout',
                'clearTimeout',
            ],
        });
        jest.setSystemTime(new Date('2025-11-28T12:00:00Z'));
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('renders correctly with data', async () => {
        // Mock responses
        (authService.getProfile as jest.Mock).mockResolvedValue({ user: { firstName: 'John' } });
        (nutritionService.getNutritionSummary as jest.Mock).mockResolvedValue({
            caloriesConsumed: 1500,
            calorieGoal: 2000,
            percentCompleted: 75,
        });

        (objectivesService.getDailyObjectives as jest.Mock).mockResolvedValue({
            objectives: [
                { id: 1, title: 'Objective 1', completed: false },
                { id: 2, title: 'Objective 2', completed: true },
            ],
        });

        const todayStr = format(new Date(), 'yyyy-MM-dd');

        (apiService.get as jest.Mock).mockResolvedValue({
            weeklySchedule: [
                {
                    date: todayStr,
                    session: { id: 1, name: 'Push (Chest)' },
                },
            ],
        });

        const { getByText } = render(<Dashboard />);

        await waitFor(() => {
            expect(getByText('Bon retour,')).toBeTruthy();
            expect(getByText('John')).toBeTruthy();
            expect(getByText('Calories absorbées')).toBeTruthy();
            expect(getByText('1500 cal')).toBeTruthy();
            expect(getByText('75%')).toBeTruthy();
            expect(getByText(/Push/)).toBeTruthy();
            expect(getByText('Objective 1')).toBeTruthy();
            expect(getByText('Objective 2')).toBeTruthy();
        });
    });

    it('handles navigation', async () => {
        (authService.getProfile as jest.Mock).mockResolvedValue({ user: { firstName: 'John' } });
        (nutritionService.getNutritionSummary as jest.Mock).mockResolvedValue({});
        (objectivesService.getDailyObjectives as jest.Mock).mockResolvedValue({});
        (apiService.get as jest.Mock).mockResolvedValue({});
        (dataService.getUserPreferences as jest.Mock).mockResolvedValue({ preferences: { calories_quotidiennes: '2000' } });

        const { getByText } = render(<Dashboard />);

        await waitFor(() => expect(getByText('Bon retour,')).toBeTruthy());

        fireEvent.press(getByText('Calories absorbées'));
        expect(router.push).toHaveBeenCalledWith({ pathname: '/user/dashboard/nutrition-monitoring', params: { from: 'dashboard' } });

        fireEvent.press(getByText('Séance du jour'));
        expect(router.push).toHaveBeenCalledWith('/user/dashboard/sport-monitoring');
    });

    it('handles fallback data on error', async () => {
        (authService.getProfile as jest.Mock).mockRejectedValue(new Error('Failed'));
        (nutritionService.getNutritionSummary as jest.Mock).mockRejectedValue(new Error('Failed'));
        (objectivesService.getDailyObjectives as jest.Mock).mockRejectedValue(new Error('Failed'));
        (apiService.get as jest.Mock).mockRejectedValue(new Error('Failed'));
        (dataService.getUserPreferences as jest.Mock).mockResolvedValue({ preferences: { calories_quotidiennes: '2500' } });

        const { getByText } = render(<Dashboard />);

        await waitFor(() => {
            // Should render fallback user name
            expect(getByText('Utilisateur')).toBeTruthy();
            // Should render fallback objectives
            expect(getByText('Ajouter un repas au suivi nutritionnel')).toBeTruthy();
            // Should render fallback session
            expect(getByText('Push')).toBeTruthy();
        });
    });

    it('navigates to badge monitoring', async () => {
        (authService.getProfile as jest.Mock).mockResolvedValue({ user: { firstName: 'John' } });
        (nutritionService.getNutritionSummary as jest.Mock).mockResolvedValue({});
        (objectivesService.getDailyObjectives as jest.Mock).mockResolvedValue({});
        (apiService.get as jest.Mock).mockResolvedValue({});
        (dataService.getUserPreferences as jest.Mock).mockResolvedValue({ preferences: { calories_quotidiennes: '2000' } });

        const { getByTestId } = render(<Dashboard />);

        await waitFor(() => expect(getByTestId('badge-button')).toBeTruthy());

        fireEvent.press(getByTestId('badge-button'));
        expect(router.push).toHaveBeenCalledWith({ pathname: '/user/dashboard/badge-monitoring', params: { from: 'dashboard' } });
    });
});
