import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import NutritionHistoryScreen from '../../app/user/dashboard/history';
import { nutritionService } from '../../services/nutrition.service';
import { router } from 'expo-router';

// Mocks
jest.mock('../../services/nutrition.service');
jest.mock('expo-router', () => ({
    router: {
        back: jest.fn(),
        push: jest.fn(),
    },
}));
jest.mock('../../components/layout/Header', () => 'Header');
jest.mock('../../context/AuthContext', () => ({
    useAuth: () => ({ user: { firstName: 'Test' } }),
}));
jest.mock('@expo/vector-icons', () => ({
    Ionicons: 'Ionicons',
}));
jest.mock('../../components/ui/Card', () => {
    const { TouchableOpacity } = require('react-native');
    return (props: any) => <TouchableOpacity {...props} />;
});

describe('NutritionHistoryScreen', () => {
    const mockHistoryData = {
        history: [
            {
                date: '2023-01-01',
                calories: 2000,
                proteins: 150,
                carbs: 200,
                fats: 70,
                goalCompleted: true,
                entries: [
                    { id: 1, foodId: 101, name: 'Apple', quantity: 1, calories: 50, meal: 'petit-dejeuner', type: 'product' },
                ],
            },
            {
                date: '2023-01-02',
                calories: 1800,
                proteins: 140,
                carbs: 180,
                fats: 60,
                goalCompleted: false,
                entries: [],
            },
        ],
        summary: {
            totalDays: 2,
            daysCompleted: 1,
            calorieGoal: 2000,
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (nutritionService.getNutritionHistory as jest.Mock).mockResolvedValue(mockHistoryData);
        (nutritionService.getFoodById as jest.Mock).mockResolvedValue({ type: 'product' });
    });

    it('renders correctly and fetches history', async () => {
        const { getByText, getAllByText } = render(<NutritionHistoryScreen />);

        await waitFor(() => {
            expect(nutritionService.getNutritionHistory).toHaveBeenCalled();
            expect(getByText('Historique des jours')).toBeTruthy();
            expect(getByText('50%')).toBeTruthy(); // Success rate
        });
    });

    it('selects a day and shows details', async () => {
        const { getByText, getAllByText } = render(<NutritionHistoryScreen />);

        await waitFor(() => expect(getByText('Apple')).toBeTruthy()); // First day selected by default

        // Select second day (assuming date formatting works)
        // 2023-01-02 is Monday (Lundi) or similar depending on locale.
        // Let's just find the element with calories '1800 cal'
        fireEvent.press(getByText('1800 cal'));

        await waitFor(() => {
            expect(getByText('Aucun aliment enregistré pour cette journée.')).toBeTruthy();
        });
    });

    it('navigates to food detail', async () => {
        const { getByText } = render(<NutritionHistoryScreen />);

        await waitFor(() => expect(getByText('Apple')).toBeTruthy());

        fireEvent.press(getByText('Apple'));

        await waitFor(() => {
            expect(router.push).toHaveBeenCalledWith(expect.stringContaining('/user/nutrition/products/101'));
        });
    });
});
