import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import NutritionDiscoverScreen from '../../app/user/nutrition/nutrition-discover';
import { nutritionService } from '../../services/nutrition.service';
import { useAuth } from '../../context/AuthContext';
import { Alert } from 'react-native';
import { router } from 'expo-router';

// Mocks
jest.mock('../../services/nutrition.service');
jest.mock('../../context/AuthContext');
jest.mock('expo-router', () => ({
    router: {
        push: jest.fn(),
    },
}));
jest.mock('../../components/layout/Header', () => {
    const React = require('react');
    const { Text } = require('react-native');
    return ({ title }: any) => <Text>{title}</Text>;
});

describe('NutritionDiscoverScreen', () => {
    const mockRecipes = [
        {
            id: 1,
            name: 'Salad - Brand',
            image: 'http://example.com/salad.jpg',
            calories: 200,
            proteins: 5,
            carbs: 10,
            fats: 2,
            tags: [{ name: 'vegetarien' }, { name: 'simple' }],
        },
        {
            id: 2,
            name: 'Steak - Brand',
            image: 'http://example.com/steak.jpg',
            calories: 500,
            proteins: 40,
            carbs: 0,
            fats: 30,
            tags: [],
        },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(Alert, 'alert');
        (useAuth as jest.Mock).mockReturnValue({ user: { id: 1 } });
        (nutritionService.getAllFoods as jest.Mock).mockResolvedValue({ foods: mockRecipes });
    });

    it('renders correctly and fetches recipes', async () => {
        const { getByText, getAllByText } = render(<NutritionDiscoverScreen />);

        expect(getByText('Découvrir des recettes')).toBeTruthy();
        expect(getByText('Rechercher un produit')).toBeTruthy();

        await waitFor(() => {
            expect(nutritionService.getAllFoods).toHaveBeenCalledWith({ type: 'recette' });
            // Check for sections
            expect(getByText('En vedette')).toBeTruthy();
            expect(getByText('Végétarien')).toBeTruthy();
            expect(getByText('Cuisine simple')).toBeTruthy();
            expect(getByText('Toutes les recettes')).toBeTruthy();

            // Check for recipe content
            expect(getAllByText('Salad').length).toBeGreaterThan(0);
            expect(getAllByText('Steak').length).toBeGreaterThan(0);
        }, { timeout: 10000 });
    });

    it('navigates to search screen', () => {
        const { getByText } = render(<NutritionDiscoverScreen />);
        fireEvent.press(getByText('Rechercher un produit'));
        expect(router.push).toHaveBeenCalledWith('/user/nutrition/search-products');
    });

    it('navigates to recipe detail', async () => {
        const { getAllByText } = render(<NutritionDiscoverScreen />);

        await waitFor(() => expect(getAllByText('Salad').length).toBeGreaterThan(0), { timeout: 10000 });

        fireEvent.press(getAllByText('Salad')[0]);
        expect(router.push).toHaveBeenCalledWith({ pathname: '/user/nutrition/recipes/1', params: { from: 'discover' } });
    });

    it('handles fetch error', async () => {
        (nutritionService.getAllFoods as jest.Mock).mockRejectedValue(new Error('Fetch failed'));
        render(<NutritionDiscoverScreen />);

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith(
                'Erreur',
                'Impossible de récupérer les recettes. Veuillez réessayer plus tard.'
            );
        }, { timeout: 10000 });
    });
});
