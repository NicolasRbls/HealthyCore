import React from 'react';
import { render } from '@testing-library/react-native';
import StatusBar from '../../../components/ui/StatusBar';
import { View } from 'react-native';

// Mocks
jest.mock('react-native-safe-area-context', () => ({
    useSafeAreaInsets: jest.fn(() => ({ top: 20, bottom: 0, left: 0, right: 0 })),
}));

// Mocks
jest.mock('react-native-safe-area-context', () => ({
    useSafeAreaInsets: jest.fn(() => ({ top: 20, bottom: 0, left: 0, right: 0 })),
}));

describe('StatusBar', () => {
    it('renders correctly with default props', () => {
        const { getByTestId } = render(<StatusBar />);
        expect(getByTestId('status-bar-background')).toBeTruthy();
    });

    it('renders with custom background color', () => {
        const { getByTestId } = render(<StatusBar backgroundColor="red" />);
        const background = getByTestId('status-bar-background');
        expect(background.props.style).toEqual(expect.arrayContaining([
            expect.objectContaining({ backgroundColor: 'red' })
        ]));
    });

    it('renders translucent (no background view)', () => {
        const { queryByTestId } = render(<StatusBar translucent />);
        expect(queryByTestId('status-bar-background')).toBeNull();
    });
});
