import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import NutritionHistoryScreen from '../../app/user/dashboard/history';
import { nutritionService } from '../../services/nutrition.service';
import { Alert } from 'react-native';
import { router } from 'expo-router';

// Mocks
jest.mock('../../services/nutrition.service');
jest.mock('expo-router', () => ({
    router: {
        back: jest.fn(),
        push: jest.fn(),
    },
    useLocalSearchParams: jest.fn().mockReturnValue({ from: '' }),
}));
jest.mock('../../components/layout/Header', () => {
    const { Text, TouchableOpacity } = require('react-native');
    return ({ title, onBackPress }: any) => (
        <TouchableOpacity onPress={onBackPress} testID="header-back-button">
            <Text>{title}</Text>
        </TouchableOpacity>
    );
});
jest.mock('../../context/AuthContext', () => ({
    useAuth: () => ({ user: { id: 1, name: 'Test User' } }),
}));

describe('NutritionHistoryScreen', () => {
    const mockHistoryData = {
        history: [
            {
                date: '2023-10-27',
                calories: 2000,
                proteins: 150,
                carbs: 200,
                fats: 70,
                goalCompleted: true,
                entries: [
                    {
                        id: 1,
                        foodId: 101,
                        name: 'Chicken Breast',
                        meal: 'dejeuner',
                        quantity: 200,
                        calories: 330,
                        type: 'produit',
                    },
                ],
            },
            {
                date: '2023-10-26',
                calories: 1800,
                proteins: 140,
                carbs: 180,
                fats: 60,
                goalCompleted: false,
                entries: [],
            },
        ],
        summary: {
            totalDays: 10,
            daysCompleted: 5,
            calorieGoal: 2500,
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(Alert, 'alert');
        (nutritionService.getNutritionHistory as jest.Mock).mockResolvedValue(mockHistoryData);
    });

    it('renders correctly and fetches data', async () => {
        const { getByText, getByTestId } = render(<NutritionHistoryScreen />);

        await waitFor(() => {
            expect(nutritionService.getNutritionHistory).toHaveBeenCalled();
            expect(getByText('Historique nutritionnel')).toBeTruthy();
            expect(getByText('10')).toBeTruthy(); // Total days
            expect(getByText('5')).toBeTruthy(); // Days completed
            expect(getByText('50%')).toBeTruthy(); // Success rate
        });

        // Check day items
        expect(getByText('27/10')).toBeTruthy();
        expect(getByText('26/10')).toBeTruthy();

        // Check selected day details (default is first day)
        expect(getByText('Chicken Breast')).toBeTruthy();
        expect(getByText('330 cal')).toBeTruthy();
    });

    it('handles empty history interactions', async () => {
        (nutritionService.getNutritionHistory as jest.Mock).mockResolvedValue({
            history: [],
            summary: { totalDays: 0, daysCompleted: 0, calorieGoal: 2500 },
        });

        const { getByText, getByTestId } = render(<NutritionHistoryScreen />);

        await waitFor(() => {
            expect(getByText('Aucun historique nutritionnel disponible.')).toBeTruthy();
        });

        // Test empty button navigation
        fireEvent.press(getByTestId('empty-history-button'));
        expect(router.push).toHaveBeenCalledWith({ pathname: '/user/nutrition/nutrition-discover', params: { from: 'history' } });

        // Test back button in empty state
        fireEvent.press(getByTestId('header-back-button'));
        expect(router.back).toHaveBeenCalled();
    });

    it('handles fetch error', async () => {
        (nutritionService.getNutritionHistory as jest.Mock).mockRejectedValue(new Error('Fetch failed'));

        render(<NutritionHistoryScreen />);

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith(
                'Erreur',
                "Impossible de charger l'historique nutritionnel. Veuillez réessayer plus tard."
            );
        });
    });

    it('navigates back from loading state', async () => {
        // Mock a promise that never resolves to keep it in loading state
        (nutritionService.getNutritionHistory as jest.Mock).mockImplementation(() => new Promise(() => { }));

        const { getByTestId } = render(<NutritionHistoryScreen />);

        // Check for loading indicator
        expect(getByTestId('header-back-button')).toBeTruthy();

        fireEvent.press(getByTestId('header-back-button'));

        expect(router.back).toHaveBeenCalled();
    });

    it('selects a day and updates details', async () => {
        const { getByText, getByTestId, queryByText } = render(<NutritionHistoryScreen />);

        await waitFor(() => expect(getByText('27/10')).toBeTruthy());

        // Initially showing 27/10 details
        expect(getByText('Chicken Breast')).toBeTruthy();

        // Select 26/10
        fireEvent.press(getByTestId('day-item-2023-10-26'));

        await waitFor(() => {
            // Should show empty entries message for 26/10
            expect(getByText('Aucun aliment enregistré pour cette journée.')).toBeTruthy();
            expect(queryByText('Chicken Breast')).toBeNull();
        });
    });

    it('navigates to food details (product)', async () => {
        (nutritionService.getFoodById as jest.Mock).mockResolvedValue({
            id: 101,
            type: 'produit',
        });

        const { getByTestId } = render(<NutritionHistoryScreen />);

        await waitFor(() => expect(getByTestId('food-entry-1')).toBeTruthy());

        fireEvent.press(getByTestId('food-entry-1'));

        await waitFor(() => {
            expect(nutritionService.getFoodById).toHaveBeenCalledWith(101);
            expect(router.push).toHaveBeenCalledWith({ pathname: '/user/nutrition/products/101', params: { from: 'history' } });
        });
    });

    it('navigates to food details (recipe)', async () => {
        // Mock data with a recipe
        const recipeMockData = {
            ...mockHistoryData,
            history: [
                {
                    ...mockHistoryData.history[0],
                    entries: [
                        {
                            id: 2,
                            foodId: 202,
                            name: 'Pasta',
                            meal: 'diner',
                            quantity: 1,
                            calories: 500,
                            type: 'recette',
                        },
                    ],
                },
            ],
        };
        (nutritionService.getNutritionHistory as jest.Mock).mockResolvedValue(recipeMockData);
        (nutritionService.getFoodById as jest.Mock).mockResolvedValue({
            id: 202,
            type: 'recette',
        });

        const { getByTestId } = render(<NutritionHistoryScreen />);

        await waitFor(() => expect(getByTestId('food-entry-2')).toBeTruthy());

        fireEvent.press(getByTestId('food-entry-2'));

        await waitFor(() => {
            expect(nutritionService.getFoodById).toHaveBeenCalledWith(202);
            expect(router.push).toHaveBeenCalledWith({ pathname: '/user/nutrition/recipes/202', params: { from: 'history' } });
        });
    });

    it('navigates back', async () => {
        const { getByTestId } = render(<NutritionHistoryScreen />);

        await waitFor(() => expect(getByTestId('header-back-button')).toBeTruthy());

        fireEvent.press(getByTestId('header-back-button'));

        expect(router.back).toHaveBeenCalled();
    });
});
