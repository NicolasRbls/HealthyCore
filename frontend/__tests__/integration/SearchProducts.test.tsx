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
jest.mock('../../components/layout/Header', () => 'Header');

// Mock Expo Camera
jest.mock('expo-camera', () => {
    const { View } = require('react-native');
    return {
        Camera: {
            requestCameraPermissionsAsync: jest.fn(),
        },
        CameraView: ({ onBarcodeScanned, children }: any) => {
            // Expose the callback globally for testing
            (global as any).mockOnBarcodeScanned = onBarcodeScanned;
            return (
                <View testID="camera-view">
                    {children}
                </View>
            );
        },
    };
});

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
        (global as any).mockOnBarcodeScanned = null;
    });

    it('renders correctly', () => {
        const { getByPlaceholderText, getByText } = render(<SearchProductsScreen />);
        expect(getByPlaceholderText('Rechercher un produit...')).toBeTruthy();
        // Initial empty state
        expect(getByText('Entrez votre recherche et appuyez sur Entrée pour rechercher un produit, ou scannez un code-barres.')).toBeTruthy();
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

    it('handles product with no image', async () => {
        const productNoImage = [{ ...mockProducts[0], image: null, id: 2 }];
        (openFoodFactsService.searchProducts as jest.Mock).mockResolvedValue(productNoImage);

        const { getByPlaceholderText, getByText } = render(<SearchProductsScreen />);
        const input = getByPlaceholderText('Rechercher un produit...');

        fireEvent.changeText(input, 'Apple');
        fireEvent(input, 'submitEditing');

        await waitFor(() => {
            expect(getByText('Apple')).toBeTruthy();
        });
    });

    it('handles empty search results', async () => {
        (openFoodFactsService.searchProducts as jest.Mock).mockResolvedValue([]);

        const { getByPlaceholderText, getByText } = render(<SearchProductsScreen />);
        const input = getByPlaceholderText('Rechercher un produit...');

        fireEvent.changeText(input, 'UnknownProduct');
        fireEvent(input, 'submitEditing');

        await waitFor(() => {
            expect(getByText('Aucun produit trouvé. Essayez avec d\'autres termes ou scannez un code-barres.')).toBeTruthy();
        });
    });

    it('resets search when close button is pressed', async () => {
        (openFoodFactsService.searchProducts as jest.Mock).mockResolvedValue(mockProducts);
        const { getByPlaceholderText, getByText, queryByText, getByTestId } = render(<SearchProductsScreen />);
        const input = getByPlaceholderText('Rechercher un produit...');

        fireEvent.changeText(input, 'Apple');
        fireEvent(input, 'submitEditing');

        await waitFor(() => expect(getByText('Apple')).toBeTruthy());

        fireEvent.press(getByTestId('clear-search-button'));

        expect(input.props.value).toBe('');
        expect(queryByText('Apple')).toBeNull();
    });

    it('opens scanner modal and scans barcode successfully', async () => {
        const mockProduct = { status: 'success', data: { id: 123 } };
        (openFoodFactsService.getProductByBarcode as jest.Mock).mockResolvedValue(mockProduct);

        const { getByTestId, getByText } = render(<SearchProductsScreen />);

        fireEvent.press(getByTestId('qr-scan-button'));

        await waitFor(() => {
            expect(getByText('Scanner un code-barres')).toBeTruthy();
            expect(getByTestId('camera-view')).toBeTruthy();
        });

        // Trigger scan
        await act(async () => {
            if ((global as any).mockOnBarcodeScanned) {
                (global as any).mockOnBarcodeScanned({ type: 'ean13', data: '1234567890123' });
            }
        });

        await waitFor(() => {
            expect(openFoodFactsService.getProductByBarcode).toHaveBeenCalledWith('1234567890123');
            expect(router.push).toHaveBeenCalledWith('/user/nutrition/products/123');
        });
    });

    it('handles invalid barcode', async () => {
        const { getByTestId, getByText } = render(<SearchProductsScreen />);

        fireEvent.press(getByTestId('qr-scan-button'));

        await waitFor(() => expect(getByTestId('camera-view')).toBeTruthy());

        // Trigger scan with invalid data
        await act(async () => {
            if ((global as any).mockOnBarcodeScanned) {
                (global as any).mockOnBarcodeScanned({ type: 'qr', data: 'invalid' });
            }
        });

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith(
                'Code-barres invalide',
                "Le code détecté n'est pas un code-barres de produit valide. Veuillez réessayer.",
                expect.any(Array)
            );
        });
    });

    it('handles product not found via barcode', async () => {
        (openFoodFactsService.getProductByBarcode as jest.Mock).mockResolvedValue({ status: 'fail' });

        const { getByTestId, getByText } = render(<SearchProductsScreen />);

        fireEvent.press(getByTestId('qr-scan-button'));

        await waitFor(() => expect(getByTestId('camera-view')).toBeTruthy());

        // Trigger scan
        await act(async () => {
            if ((global as any).mockOnBarcodeScanned) {
                (global as any).mockOnBarcodeScanned({ type: 'ean13', data: '1234567890123' });
            }
        });

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith(
                'Produit non trouvé',
                "Ce produit n'a pas été trouvé dans notre base de données.",
                expect.any(Array)
            );
        });
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

    it('handles pull to refresh', async () => {
        (openFoodFactsService.searchProducts as jest.Mock).mockResolvedValue(mockProducts);
        const { getByPlaceholderText, getByText, getByTestId } = render(<SearchProductsScreen />);
        const input = getByPlaceholderText('Rechercher un produit...');

        // Perform search
        fireEvent.changeText(input, 'Apple');
        fireEvent(input, 'submitEditing');
        await waitFor(() => expect(getByText('Apple')).toBeTruthy());

        // Trigger refresh
        const flatList = getByTestId('products-list');
        const { refreshControl } = flatList.props;

        await act(async () => {
            refreshControl.props.onRefresh();
        });

        // Expect search to be reset
        expect(input.props.value).toBe('');
    });
});
