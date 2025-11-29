import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import RecipeDetailScreen from '../../app/user/nutrition/recipes/[id]';
import { nutritionService } from '../../services/nutrition.service';
import { useAuth } from '../../context/AuthContext';
import { Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

// Mocks
jest.mock('../../services/nutrition.service');
jest.mock('../../context/AuthContext');
jest.mock('expo-router', () => ({
    router: {
        back: jest.fn(),
        push: jest.fn(),
    },
    useLocalSearchParams: jest.fn(),
}));
jest.mock('../../components/layout/Header', () => {
    const React = require('react');
    const { Text } = require('react-native');
    return ({ title }: any) => <Text>{title}</Text>;
});

describe('RecipeDetailScreen', () => {
    const mockRecipe = {
        id: 1,
        name: 'Salad - Brand',
        image: 'http://example.com/salad.jpg',
        calories: 200,
        proteins: 5,
        carbs: 10,
        fats: 2,
        ingredients: 'Lettuce | Tomato',
        description: 'Wash vegetables | Mix them',
        preparationTime: 10,
        tags: [{ id: 1, name: 'vegetarien' }],
    };

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(Alert, 'alert');
        (useAuth as jest.Mock).mockReturnValue({ user: { id: 1 } });
        (useLocalSearchParams as jest.Mock).mockReturnValue({ id: '1' });
        (nutritionService.getFoodById as jest.Mock).mockResolvedValue(mockRecipe);
    });

    it('renders correctly and fetches recipe details', async () => {
        const { getByText, getAllByText } = render(<RecipeDetailScreen />);

        await waitFor(() => {
            expect(nutritionService.getFoodById).toHaveBeenCalledWith(1);
            expect(getAllByText(/Salad/).length).toBeGreaterThan(0);
            expect(getByText('200')).toBeTruthy(); // Calories
            expect(getByText('Lettuce')).toBeTruthy(); // Ingredient
            expect(getByText('Wash vegetables')).toBeTruthy(); // Instruction
            expect(getByText('10 min')).toBeTruthy(); // Prep time
        });
    });

    it('handles add to tracking', async () => {
        const { getByText, getByPlaceholderText, getAllByText } = render(<RecipeDetailScreen />);

        await waitFor(() => expect(getAllByText(/Salad/).length).toBeGreaterThan(0));

        fireEvent.press(getByText('Ajouter au suivi'));

        const portionsInput = getByPlaceholderText('1');
        fireEvent.changeText(portionsInput, '2');

        fireEvent.press(getByText('Ajouter'));

        await waitFor(() => {
            expect(nutritionService.logNutrition).toHaveBeenCalledWith(1, 2, 'dejeuner');
            expect(Alert.alert).toHaveBeenCalledWith('Recette ajoutée', expect.stringContaining('Salad'), expect.any(Array));
        });
    });

    it('handles fetch error', async () => {
        (nutritionService.getFoodById as jest.Mock).mockRejectedValue(new Error('Fetch failed'));
        render(<RecipeDetailScreen />);

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith(
                'Erreur',
                'Impossible de récupérer les détails de la recette. Veuillez réessayer plus tard.'
            );
        });
    });

    it('handles recipe not found', async () => {
        (nutritionService.getFoodById as jest.Mock).mockResolvedValue(null);
        const { getByText } = render(<RecipeDetailScreen />);

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Erreur', 'Recette introuvable');
            expect(getByText('Recette non trouvée')).toBeTruthy();
        });
    });
});
