import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Card from '../../../components/ui/Card';
import { Text } from 'react-native';

describe('Card', () => {
    it('renders children correctly', () => {
        const { getByText } = render(
            <Card>
                <Text>Card Content</Text>
            </Card>
        );
        expect(getByText('Card Content')).toBeTruthy();
    });

    it('handles onPress', () => {
        const onPress = jest.fn();
        const { getByText } = render(
            <Card onPress={onPress}>
                <Text>Pressable Card</Text>
            </Card>
        );

        fireEvent.press(getByText('Pressable Card'));
        expect(onPress).toHaveBeenCalled();
    });

    it('renders with different variants', () => {
        const { getByText } = render(
            <Card variant="outlined">
                <Text>Outlined Card</Text>
            </Card>
        );
        expect(getByText('Outlined Card')).toBeTruthy();
    });

    it('does not trigger onPress when disabled', () => {
        const onPress = jest.fn();
        const { getByText } = render(
            <Card onPress={onPress} disabled>
                <Text>Disabled Card</Text>
            </Card>
        );

        fireEvent.press(getByText('Disabled Card'));
        expect(onPress).not.toHaveBeenCalled();
    });
});
