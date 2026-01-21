import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import BackButton from '../../../components/layout/BackButton';
import { useNavigation } from 'expo-router';

// Mocks
jest.mock('expo-router', () => ({
    useNavigation: jest.fn(),
}));

describe('BackButton', () => {
    const mockGoBack = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (useNavigation as jest.Mock).mockReturnValue({
            goBack: mockGoBack,
        });
    });

    it('renders correctly', () => {
        const { getByTestId } = render(<BackButton />);
        expect(getByTestId('back-button')).toBeTruthy();
    });

    it('navigates back when pressed', () => {
        const { getByTestId } = render(<BackButton />);
        fireEvent.press(getByTestId('back-button'));
        expect(mockGoBack).toHaveBeenCalled();
    });

    it('calls custom onPress when provided', () => {
        const onPress = jest.fn();
        const { getByTestId } = render(<BackButton onPress={onPress} />);
        fireEvent.press(getByTestId('back-button'));
        expect(onPress).toHaveBeenCalled();
        expect(mockGoBack).not.toHaveBeenCalled();
    });
});
