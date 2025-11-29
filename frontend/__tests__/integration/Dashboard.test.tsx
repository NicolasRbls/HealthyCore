import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import Dashboard from '../../app/user/dashboard/index';
import authService from '../../services/auth.service';
import { nutritionService } from '../../services/nutrition.service';
import objectivesService from '../../services/objectives.service';
import apiService from '../../services/api.service';

// Mocks
jest.mock('../../services/auth.service');
jest.mock('../../services/nutrition.service');
jest.mock('../../services/objectives.service');
jest.mock('../../services/api.service');
jest.mock('../../services/data.service', () => ({
    getUserPreferences: jest.fn().mockResolvedValue({ preferences: { calories_quotidiennes: '2000' } }),
}));

jest.mock('../../context/AuthContext', () => ({
    useAuth: () => ({
        user: { firstName: 'John' },
    }),
}));

jest.mock('expo-router', () => ({
    router: {
        push: jest.fn(),
    },
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
        // The component maps nutritionData.caloriesConsumed -> consumedCalories
        // Let's check the component logic again.
        // const consumedCalories = nutritionData.caloriesConsumed || 0;
        // So mock should return caloriesConsumed.

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

        // Calculate the expected date string based on component logic
        // Component: today.setHours(0,0,0,0) -> toISOString()
        // If we are in UTC (Jest default usually), 12:00Z -> 00:00Z -> 2025-11-28
        // If local is different, it might shift.
        // But we can just match what the component produces if we control the time.
        // Let's assume UTC for now.
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = today.toISOString().split('T')[0];

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
});
