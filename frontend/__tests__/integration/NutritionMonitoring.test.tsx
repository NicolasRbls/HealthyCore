import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import NutritionMonitoring from '../../app/user/dashboard/nutrition-monitoring';
import { nutritionService } from '../../services/nutrition.service';
import { useAuth } from '../../context/AuthContext';
import { Alert } from 'react-native';
import { router } from 'expo-router';

// Mocks
jest.mock('../../services/nutrition.service');
jest.mock('../../context/AuthContext');
jest.mock('expo-router', () => ({
    router: {
        back: jest.fn(),
        push: jest.fn(),
    },
    useLocalSearchParams: jest.fn().mockReturnValue({ from: '' }),
}));
jest.mock('../../components/layout/Header', () => {
    const React = require('react');
    const { Text, TouchableOpacity } = require('react-native');
    return ({ title, onRightIconPress }: any) => (
        <TouchableOpacity onPress={onRightIconPress} testID="header-right-icon">
            <Text>{title}</Text>
        </TouchableOpacity>
    );
});

describe('NutritionMonitoring', () => {
    const mockSummary = {
        calorieGoal: 2000,
        caloriesConsumed: 500,
        caloriesRemaining: 1500,
        percentCompleted: 25,
        macronutrients: {
            carbs: { goal: 250, consumed: 50, remaining: 200, percentCompleted: 20, unit: 'g' },
            proteins: { goal: 150, consumed: 30, remaining: 120, percentCompleted: 20, unit: 'g' },
            fats: { goal: 70, consumed: 20, remaining: 50, percentCompleted: 28, unit: 'g' },
        },
    };

    const mockFoodEntries = {
        date: '2023-10-27',
        meals: {
            'petit-dejeuner': [
                { id: 1, foodId: 101, name: 'Apple - Brand', meal: 'petit-dejeuner', quantity: 1, calories: 52, type: 'product' },
            ],
            'dejeuner': [],
            'diner': [],
            'collation': [],
        },
        totals: { calories: 500, proteins: 30, carbs: 50, fats: 20 },
    };

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(Alert, 'alert');
        (useAuth as jest.Mock).mockReturnValue({ user: { id: 1 } });
        (nutritionService.getNutritionSummary as jest.Mock).mockResolvedValue(mockSummary);
        (nutritionService.getTodayNutrition as jest.Mock).mockResolvedValue(mockFoodEntries);
    });

    it('renders correctly and fetches data', async () => {
        const { getByText } = render(<NutritionMonitoring />);

        await waitFor(() => {
            expect(nutritionService.getNutritionSummary).toHaveBeenCalled();
            expect(nutritionService.getTodayNutrition).toHaveBeenCalled();
            expect(getByText('Vous pouvez encore manger 1500 Calories')).toBeTruthy();
            expect(getByText('Apple')).toBeTruthy();
        });
    });

    it('handles empty state', async () => {
        (nutritionService.getTodayNutrition as jest.Mock).mockResolvedValue({ ...mockFoodEntries, meals: {} });
        const { getByText } = render(<NutritionMonitoring />);

        await waitFor(() => {
            expect(getByText("Vous n'avez pas encore ajouté d'aliments aujourd'hui.")).toBeTruthy();
        });
    });

    it('handles delete food entry', async () => {
        // Mock Alert to simulate pressing "Supprimer"
        jest.spyOn(Alert, 'alert').mockImplementation((title, message, buttons) => {
            if (buttons) {
                const deleteButton = buttons.find(b => b.text === 'Supprimer');
                if (deleteButton && deleteButton.onPress) {
                    deleteButton.onPress();
                }
            }
        });

        const { getByText, getByTestId } = render(<NutritionMonitoring />);

        await waitFor(() => expect(getByText('Apple')).toBeTruthy());

        const deleteButton = getByTestId('delete-button-1');
        fireEvent.press(deleteButton);

        expect(Alert.alert).toHaveBeenCalled();

        await waitFor(() => {
            expect(nutritionService.deleteNutritionEntry).toHaveBeenCalledWith(1);
        });
    });

    it('navigates to discover', async () => {
        const { getByTestId } = render(<NutritionMonitoring />);

        // Wait for load
        await waitFor(() => expect(nutritionService.getNutritionSummary).toHaveBeenCalled());

        const fab = getByTestId('fab-add');
        fireEvent.press(fab);

        expect(router.push).toHaveBeenCalledWith({ pathname: '/user/nutrition/nutrition-discover', params: { from: 'monitoring' } });
    });

    it('handles load error', async () => {
        (nutritionService.getNutritionSummary as jest.Mock).mockRejectedValue(new Error('Load failed'));
        render(<NutritionMonitoring />);

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Erreur', 'Impossible de charger les données nutritionnelles. Veuillez réessayer plus tard.');
        });
    });
});
