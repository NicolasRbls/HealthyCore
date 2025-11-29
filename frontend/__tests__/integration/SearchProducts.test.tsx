import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SearchProductsScreen from '../../app/user/nutrition/search-products';
import { openFoodFactsService } from '../../services/nutrition.service';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { Camera } from 'expo-camera';

// Mocks
jest.mock('../../services/nutrition.service');
jest.mock('expo-router', () => ({
    router: {
        push: jest.fn(),
        back: jest.fn(),
    },
}));
jest.mock('../../components/layout/Header', () => 'Header');

// Mock Expo Camera
jest.mock('expo-camera', () => ({
    Camera: {
        requestCameraPermissionsAsync: jest.fn(),
    },
    CameraView: 'CameraView',
}));

describe('SearchProductsScreen', () => {
    const mockProducts = [
        {
            id: 1,
            name: 'Apple - Brand - 100g',
            image: 'http://example.com/apple.jpg',
            calories: 52,
            proteins: 0.3,
            carbs: 14,
            fats: 0.2,
        },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(Alert, 'alert');
        (Camera.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    });

    it('renders correctly', () => {
        const { getByPlaceholderText } = render(<SearchProductsScreen />);
        expect(getByPlaceholderText('Rechercher un produit...')).toBeTruthy();
    });

    it('searches for products successfully', async () => {
        (openFoodFactsService.searchProducts as jest.Mock).mockResolvedValue(mockProducts);

        const { getByPlaceholderText, getByText } = render(<SearchProductsScreen />);
        const input = getByPlaceholderText('Rechercher un produit...');

        fireEvent.changeText(input, 'Apple');
        fireEvent(input, 'submitEditing');

        await waitFor(() => {
            expect(openFoodFactsService.searchProducts).toHaveBeenCalledWith('Apple', 20);
            expect(getByText('Apple')).toBeTruthy();
            expect(getByText('52 cal')).toBeTruthy();
        });
    });

    it('handles empty search', () => {
        const { getByPlaceholderText } = render(<SearchProductsScreen />);
        const input = getByPlaceholderText('Rechercher un produit...');

        fireEvent.changeText(input, '');
        fireEvent(input, 'submitEditing');

        expect(Alert.alert).toHaveBeenCalledWith('Recherche vide', 'Veuillez entrer un terme de recherche.');
    });

    it('handles search error', async () => {
        (openFoodFactsService.searchProducts as jest.Mock).mockRejectedValue(new Error('Network error'));

        const { getByPlaceholderText } = render(<SearchProductsScreen />);
        const input = getByPlaceholderText('Rechercher un produit...');

        fireEvent.changeText(input, 'Error');
        fireEvent(input, 'submitEditing');

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith(
                'Erreur de recherche',
                "Une erreur s'est produite lors de la recherche. Veuillez réessayer."
            );
        });
    });

    it('navigates to product detail on press', async () => {
        (openFoodFactsService.searchProducts as jest.Mock).mockResolvedValue(mockProducts);

        const { getByPlaceholderText, getByText } = render(<SearchProductsScreen />);
        const input = getByPlaceholderText('Rechercher un produit...');

        fireEvent.changeText(input, 'Apple');
        fireEvent(input, 'submitEditing');

        await waitFor(() => expect(getByText('Apple')).toBeTruthy());

        fireEvent.press(getByText('Apple'));

        expect(router.push).toHaveBeenCalledWith('/user/nutrition/products/1');
    });
});
