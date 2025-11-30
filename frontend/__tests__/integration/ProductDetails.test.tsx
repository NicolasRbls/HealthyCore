import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ProductDetailScreen from '../../app/user/nutrition/products/[id]';
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
    const { Text, TouchableOpacity } = require('react-native');
    return ({ title, onRightIconPress }: any) => (
        <TouchableOpacity onPress={onRightIconPress} testID="header-right-icon">
            <Text>{title}</Text>
        </TouchableOpacity>
    );
});

describe('ProductDetailScreen', () => {
    const mockProduct = {
        id: 1,
        name: 'Apple - Brand - 100g',
        image: 'http://example.com/apple.jpg',
        calories: 52,
        proteins: 0.3,
        carbs: 14,
        fats: 0.2,
        ingredients: 'Apple | Water',
        tags: [{ id: 1, name: 'fruit' }],
        barcode: '123456789',
    };

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(Alert, 'alert');
        (useAuth as jest.Mock).mockReturnValue({ user: { id: 1 } });
        (useLocalSearchParams as jest.Mock).mockReturnValue({ id: '1' });
        (nutritionService.getFoodById as jest.Mock).mockResolvedValue(mockProduct);
    });

    it('renders correctly and fetches product details', async () => {
        const { getByText, getAllByText } = render(<ProductDetailScreen />);

        await waitFor(() => {
            expect(nutritionService.getFoodById).toHaveBeenCalledWith(1);
            expect(getAllByText('Apple').length).toBeGreaterThan(0);
            expect(getByText('Brand')).toBeTruthy();
            expect(getByText('52')).toBeTruthy(); // Calories
            expect(getByText('Fruit')).toBeTruthy(); // Tag
        });
    });

    it('handles add to tracking with different meal', async () => {
        const { getByText, getByPlaceholderText, getAllByText } = render(<ProductDetailScreen />);

        await waitFor(() => expect(getAllByText('Apple').length).toBeGreaterThan(0));

        fireEvent.press(getByText('Ajouter au suivi'));

        // Select 'Dîner'
        fireEvent.press(getByText('Dîner'));

        const quantityInput = getByPlaceholderText('100');
        fireEvent.changeText(quantityInput, '200');

        fireEvent.press(getByText('Ajouter'));

        await waitFor(() => {
            expect(nutritionService.logNutrition).toHaveBeenCalledWith(1, 200, 'diner');
            expect(Alert.alert).toHaveBeenCalledWith('Aliment ajouté', expect.stringContaining('Apple'), expect.any(Array));
        });
    });

    it('validates quantity input', async () => {
        const { getByText, getByPlaceholderText, getAllByText } = render(<ProductDetailScreen />);

        await waitFor(() => expect(getAllByText('Apple').length).toBeGreaterThan(0));

        fireEvent.press(getByText('Ajouter au suivi'));

        const quantityInput = getByPlaceholderText('100');
        fireEvent.changeText(quantityInput, '0'); // Invalid

        fireEvent.press(getByText('Ajouter'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Erreur', 'Veuillez entrer une quantité valide');
            expect(nutritionService.logNutrition).not.toHaveBeenCalled();
        });
    });

    it('handles error during logging', async () => {
        (nutritionService.logNutrition as jest.Mock).mockRejectedValue(new Error('Log failed'));
        const { getByText, getAllByText } = render(<ProductDetailScreen />);

        await waitFor(() => expect(getAllByText('Apple').length).toBeGreaterThan(0));

        fireEvent.press(getByText('Ajouter au suivi'));
        fireEvent.press(getByText('Ajouter'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Erreur', "Impossible d'ajouter cet aliment à votre suivi. Veuillez réessayer plus tard.");
        });
    });

    it('handles fetch error', async () => {
        (nutritionService.getFoodById as jest.Mock).mockRejectedValue(new Error('Fetch failed'));
        render(<ProductDetailScreen />);

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith(
                'Erreur',
                'Une erreur s\'est produite lors de la récupération des détails du produit. Veuillez réessayer plus tard.'
            );
        });
    });

    it('handles product not found', async () => {
        (nutritionService.getFoodById as jest.Mock).mockResolvedValue(null);
        const { getByText } = render(<ProductDetailScreen />);

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Erreur', 'Impossible de récupérer les détails du produit.');
            expect(getByText('Produit non trouvé')).toBeTruthy();
        });
    });

    it('navigates to report on right icon press', async () => {
        const { getByTestId, getAllByText } = render(<ProductDetailScreen />);
        await waitFor(() => expect(getAllByText('Apple').length).toBeGreaterThan(0));

        fireEvent.press(getByTestId('header-right-icon'));

        expect(router.push).toHaveBeenCalledWith({
            pathname: "/user/nutrition/report",
            params: { id: 1, name: 'Apple - Brand - 100g' },
        });
    });

    it('handles local image', async () => {
        const localProduct = { ...mockProduct, image: null };
        (nutritionService.getFoodById as jest.Mock).mockResolvedValue(localProduct);

        const { getAllByText } = render(<ProductDetailScreen />);
        await waitFor(() => expect(getAllByText('Apple').length).toBeGreaterThan(0));
        // Verify no crash
    });
});
