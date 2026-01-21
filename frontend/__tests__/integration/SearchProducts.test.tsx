import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
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
jest.mock('expo-camera', () => {
    const { View, Button, TextInput } = require('react-native');
    const React = require('react');
    return {
        Camera: {
            requestCameraPermissionsAsync: jest.fn(),
        },
        CameraView: ({ onBarcodeScanned }: any) => {
            const [data, setData] = React.useState('12345678');
            return (
                <View testID="camera-view">
                    <TextInput
                        testID="camera-mock-input"
                        value={data}
                        onChangeText={setData}
                    />
                    <Button
                        title="Simulate Scan"
                        onPress={() => onBarcodeScanned({ type: 'ean13', data })}
                        testID="simulate-scan-button"
                    />
                </View>
            );
        },
    };
});
jest.mock('../../components/layout/Header', () => {
    const { Text } = require('react-native');
    return ({ title }: any) => <Text>{title}</Text>;
});

describe('SearchProductsScreen', () => {
    const mockProducts = [
        {
            id: 1,
            name: 'Apple',
            image: 'https://example.com/apple.jpg',
            calories: 52,
            proteins: 0.3,
            carbs: 14,
            fats: 0.2,
            tags: [],
            type: 'produit',
            source: 'openfoodfacts',
        },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(Alert, 'alert');
        (Camera.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    });

    it('renders correctly (initial state)', async () => {
        const { getByText, getByPlaceholderText, getByTestId } = render(<SearchProductsScreen />);

        expect(getByText('Recherche de produits')).toBeTruthy();
        expect(getByPlaceholderText('Rechercher un produit...')).toBeTruthy();
        expect(getByTestId('initial-empty-list')).toBeTruthy();
    });

    it('searches for products and displays results', async () => {
        (openFoodFactsService.searchProducts as jest.Mock).mockResolvedValue(mockProducts);

        const { getByPlaceholderText, getByTestId, getByText } = render(<SearchProductsScreen />);

        const input = getByPlaceholderText('Rechercher un produit...');
        fireEvent.changeText(input, 'Apple');
        fireEvent(input, 'submitEditing');

        await waitFor(() => {
            expect(openFoodFactsService.searchProducts).toHaveBeenCalledWith('Apple', 20);
            expect(getByTestId('products-list')).toBeTruthy();
            expect(getByText('Apple')).toBeTruthy();
            expect(getByText('52 cal')).toBeTruthy();
        });
    });

    it('handles empty search results', async () => {
        (openFoodFactsService.searchProducts as jest.Mock).mockResolvedValue([]);

        const { getByPlaceholderText, getByTestId, getByText } = render(<SearchProductsScreen />);

        const input = getByPlaceholderText('Rechercher un produit...');
        fireEvent.changeText(input, 'Unknown');
        fireEvent(input, 'submitEditing');

        await waitFor(() => {
            expect(getByTestId('no-results-list')).toBeTruthy();
            expect(getByText("Aucun produit trouvé. Essayez avec d'autres termes ou scannez un code-barres.")).toBeTruthy();
        });
    });

    it('handles search error', async () => {
        (openFoodFactsService.searchProducts as jest.Mock).mockRejectedValue(new Error('Search failed'));

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

    it('clears search', async () => {
        (openFoodFactsService.searchProducts as jest.Mock).mockResolvedValue(mockProducts);

        const { getByPlaceholderText, getByTestId, queryByTestId } = render(<SearchProductsScreen />);

        const input = getByPlaceholderText('Rechercher un produit...');
        fireEvent.changeText(input, 'Apple');
        fireEvent(input, 'submitEditing');

        await waitFor(() => expect(getByTestId('products-list')).toBeTruthy());

        fireEvent.press(getByTestId('clear-search-button'));

        expect(input.props.value).toBe('');
        expect(queryByTestId('products-list')).toBeNull();
        expect(getByTestId('initial-empty-list')).toBeTruthy();
    });

    it('navigates to product details', async () => {
        (openFoodFactsService.searchProducts as jest.Mock).mockResolvedValue(mockProducts);

        const { getByPlaceholderText, getByTestId } = render(<SearchProductsScreen />);

        const input = getByPlaceholderText('Rechercher un produit...');
        fireEvent.changeText(input, 'Apple');
        fireEvent(input, 'submitEditing');

        await waitFor(() => expect(getByTestId('product-item-1')).toBeTruthy());

        fireEvent.press(getByTestId('product-item-1'));

        expect(router.push).toHaveBeenCalledWith('/nutrition-details/products/1');
    });

    it('opens QR scanner and scans product', async () => {
        (openFoodFactsService.getProductByBarcode as jest.Mock).mockResolvedValue({
            status: 'success',
            data: { id: 123 },
        });

        const { getByTestId, getByText } = render(<SearchProductsScreen />);

        fireEvent.press(getByTestId('qr-scan-button'));

        await waitFor(() => {
            expect(getByText('Scanner un code-barres')).toBeTruthy();
        });

        // Simulate scan
        fireEvent.press(getByTestId('simulate-scan-button'));

        await waitFor(() => {
            expect(openFoodFactsService.getProductByBarcode).toHaveBeenCalledWith('12345678');
            expect(router.push).toHaveBeenCalledWith('/nutrition-details/products/123');
        });
    });

    it('handles QR scanner permission denied', async () => {
        (Camera.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });

        const { getByTestId, getByText } = render(<SearchProductsScreen />);

        fireEvent.press(getByTestId('qr-scan-button'));

        await waitFor(() => {
            expect(getByText('Accès à la caméra refusé')).toBeTruthy();
        });
    });

    it('handles QR scanner product not found', async () => {
        (openFoodFactsService.getProductByBarcode as jest.Mock).mockResolvedValue({
            status: 'fail',
        });

        const { getByTestId, getByText } = render(<SearchProductsScreen />);

        fireEvent.press(getByTestId('qr-scan-button'));
        await waitFor(() => expect(getByText('Scanner un code-barres')).toBeTruthy());

        fireEvent.press(getByTestId('simulate-scan-button'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith(
                'Produit non trouvé',
                "Ce produit n'a pas été trouvé dans notre base de données.",
                expect.any(Array)
            );
        });
    });

    it('resets search on input clear', async () => {
        (openFoodFactsService.searchProducts as jest.Mock).mockResolvedValue(mockProducts);

        const { getByPlaceholderText, getByTestId, queryByTestId } = render(<SearchProductsScreen />);

        const input = getByPlaceholderText('Rechercher un produit...');

        // Search first
        fireEvent.changeText(input, 'Apple');
        fireEvent(input, 'submitEditing');
        await waitFor(() => expect(getByTestId('products-list')).toBeTruthy());

        // Delete text
        fireEvent.changeText(input, 'Appl'); // Less characters

        // Should reset if length decreased and had results (logic in component)
        // Wait, logic is: if (text.length < previousSearchLength.current && (products.length > 0 || hasSearched))

        await waitFor(() => {
            expect(queryByTestId('products-list')).toBeNull();
        });
    });

    it('handles pull to refresh', async () => {
        (openFoodFactsService.searchProducts as jest.Mock).mockResolvedValue(mockProducts);

        const { getByPlaceholderText, getByTestId, queryByTestId } = render(<SearchProductsScreen />);

        const input = getByPlaceholderText('Rechercher un produit...');
        fireEvent.changeText(input, 'Apple');
        fireEvent(input, 'submitEditing');
        await waitFor(() => expect(getByTestId('products-list')).toBeTruthy());

        const list = getByTestId('products-list');
        const { refreshControl } = list.props;

        await act(async () => {
            refreshControl.props.onRefresh();
        });

        expect(input.props.value).toBe('');
        expect(queryByTestId('products-list')).toBeNull();
    });

    it('handles invalid barcode', async () => {
        const { getByTestId, getByText } = render(<SearchProductsScreen />);

        fireEvent.press(getByTestId('qr-scan-button'));
        await waitFor(() => expect(getByText('Scanner un code-barres')).toBeTruthy());

        // Simulate invalid barcode scan
        fireEvent.changeText(getByTestId('camera-mock-input'), 'invalid');
        fireEvent.press(getByTestId('simulate-scan-button'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith(
                'Code-barres invalide',
                "Le code détecté n'est pas un code-barres de produit valide. Veuillez réessayer.",
                expect.any(Array)
            );
        });
    });

    it('handles network error during scan', async () => {
        (openFoodFactsService.getProductByBarcode as jest.Mock).mockRejectedValue(new Error('Network Error'));

        const { getByTestId, getByText } = render(<SearchProductsScreen />);

        fireEvent.press(getByTestId('qr-scan-button'));
        await waitFor(() => expect(getByText('Scanner un code-barres')).toBeTruthy());

        fireEvent.press(getByTestId('simulate-scan-button'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith(
                'Erreur',
                "Problème de connexion. Vérifiez votre connexion internet et réessayez.",
                expect.any(Array)
            );
        });
    });
});
