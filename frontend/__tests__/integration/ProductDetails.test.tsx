import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import ProductDetailScreen from '../../app/nutrition-details/products/[id]';
import { nutritionService } from '../../services/nutrition.service';
import { router, useLocalSearchParams } from 'expo-router';
import { Alert } from 'react-native';

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

// Spy on Alert
jest.spyOn(Alert, 'alert');

describe('ProductDetailScreen Navigation', () => {
    const mockProduct = {
        id: 1,
        name: 'Apple',
        type: 'produit',
        calories: 50,
        proteins: 0,
        carbs: 10,
        fats: 0,
        tags: [],
        barcode: '123456',
        brand: 'Nature',
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (nutritionService.getFoodById as jest.Mock).mockResolvedValue(mockProduct);
    });

    it('navigates back normally', async () => {
        (useLocalSearchParams as jest.Mock).mockReturnValue({ id: '1' });

        const { getByTestId } = render(<ProductDetailScreen />);

        await waitFor(() => expect(nutritionService.getFoodById).toHaveBeenCalled());

        fireEvent.press(getByTestId('header-back-button'));

        expect(router.back).toHaveBeenCalled();
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
});
