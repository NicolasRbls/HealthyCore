import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import RecipeDetailsScreen from '../../app/nutrition-details/recipes/[id]';
import { nutritionService } from '../../services/nutrition.service';
import { router, useLocalSearchParams } from 'expo-router';

// Mocks
jest.mock('../../services/nutrition.service');
jest.mock('expo-router', () => ({
    router: {
        back: jest.fn(),
        push: jest.fn(),
    },
    useLocalSearchParams: jest.fn().mockReturnValue({ id: '1' }),
}));

jest.mock('../../context/AuthContext', () => ({
    useAuth: () => ({
        user: { firstName: 'John' },
    }),
}));

jest.mock('../../components/layout/Header', () => {
    const { TouchableOpacity, Text } = require('react-native');
    return ({ title, onBackPress }: any) => (
        <TouchableOpacity onPress={onBackPress} testID="header-back-button">
            <Text>{title}</Text>
        </TouchableOpacity>
    );
});

describe('RecipeDetailsScreen Navigation', () => {
    const mockRecipe = {
        id: 1,
        name: 'Pancakes',
        type: 'recette',
        calories: 300,
        proteins: 10,
        carbs: 40,
        fats: 10,
        tags: [],
        ingredients: 'Flour, Milk, Eggs',
        instructions: ['Mix', 'Cook'],
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (nutritionService.getFoodById as jest.Mock).mockResolvedValue(mockRecipe);
    });

    it('navigates back normally', async () => {
        (useLocalSearchParams as jest.Mock).mockReturnValue({ id: '1' });

        const { getByTestId } = render(<RecipeDetailsScreen />);

        await waitFor(() => expect(nutritionService.getFoodById).toHaveBeenCalled());

        fireEvent.press(getByTestId('header-back-button'));

        expect(router.back).toHaveBeenCalled();
    });
});
