import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import NutritionMonitoring from '../../app/user/dashboard/nutrition-monitoring';
import { nutritionService } from '../../services/nutrition.service';
import { router } from 'expo-router';

// Mocks
jest.mock('../../services/nutrition.service');
jest.mock('expo-router', () => ({
    router: {
        push: jest.fn(),
        back: jest.fn(),
    },
    useLocalSearchParams: jest.fn().mockReturnValue({ from: '' }),
}));

jest.mock('../../context/AuthContext', () => ({
    useAuth: () => ({
        user: { firstName: 'John' },
    }),
}));

jest.mock('../../components/layout/Header', () => 'Header');
jest.mock('../../components/ui/Card', () => {
    const { TouchableOpacity, View } = require('react-native');
    return ({ children, onPress, testID }: any) => (
        <TouchableOpacity onPress={onPress} testID={testID}>
            <View>{children}</View>
        </TouchableOpacity>
    );
});

describe('NutritionMonitoring Navigation', () => {
    const mockSummary = {
        calorieGoal: 2000,
        caloriesConsumed: 500,
        caloriesRemaining: 1500,
        percentCompleted: 25,
        macronutrients: {
            carbs: { goal: 200, consumed: 50, remaining: 150, percentCompleted: 25, unit: 'g' },
            proteins: { goal: 150, consumed: 40, remaining: 110, percentCompleted: 26, unit: 'g' },
            fats: { goal: 70, consumed: 20, remaining: 50, percentCompleted: 28, unit: 'g' },
        },
    };

    const mockTodayData = {
        date: '2023-01-01',
        meals: {
            'petit-dejeuner': [
                { id: 1, foodId: 101, name: 'Apple', meal: 'petit-dejeuner', quantity: 1, calories: 50, type: 'produit' },
                { id: 2, foodId: 202, name: 'Pancakes', meal: 'petit-dejeuner', quantity: 1, calories: 300, type: 'recette' },
            ],
        },
        totals: { calories: 350, proteins: 10, carbs: 60, fats: 5 },
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (nutritionService.getNutritionSummary as jest.Mock).mockResolvedValue(mockSummary);
        (nutritionService.getTodayNutrition as jest.Mock).mockResolvedValue(mockTodayData);
        (nutritionService.getFoodById as jest.Mock).mockImplementation((id) => {
            if (id === 101) {
                return Promise.resolve({ id: 101, name: 'Apple', type: 'produit' });
            } else if (id === 202) {
                return Promise.resolve({ id: 202, name: 'Pancakes', type: 'recette' });
            }
            return Promise.reject(new Error('Not found'));
        });
    });

    it('navigates to product details with correct params', async () => {
        const { getByTestId } = render(<NutritionMonitoring />);

        await waitFor(() => expect(nutritionService.getTodayNutrition).toHaveBeenCalled());

        fireEvent.press(getByTestId('food-card-1')); // Apple (product)

        await waitFor(() => {
            expect(router.push).toHaveBeenCalledWith('/nutrition-details/products/101');
        });
    });

    it('navigates to recipe details with correct params', async () => {
        const { getByTestId } = render(<NutritionMonitoring />);

        await waitFor(() => expect(nutritionService.getTodayNutrition).toHaveBeenCalled());

        fireEvent.press(getByTestId('food-card-2')); // Pancakes (recipe)

        await waitFor(() => {
            expect(router.push).toHaveBeenCalledWith('/nutrition-details/recipes/202');
        });
    });
});
