import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import Card from '../../../components/ui/Card';

describe('Card', () => {
    it('renders children correctly', () => {
        const { getByText } = render(
            <Card>
                <Text>Card Content</Text>
            </Card>
        );
        expect(getByText('Card Content')).toBeTruthy();
    });

    it('calls onPress when pressed', () => {
        const onPressMock = jest.fn();
        const { getByText } = render(
            <Card onPress={onPressMock}>
                <Text>Pressable Card</Text>
            </Card>
        );

        fireEvent.press(getByText('Pressable Card'));
        expect(onPressMock).toHaveBeenCalledTimes(1);
    });

    it('does not call onPress when disabled', () => {
        const onPressMock = jest.fn();
        const { getByText } = render(
            <Card onPress={onPressMock} disabled>
                <Text>Disabled Card</Text>
            </Card>
        );

        fireEvent.press(getByText('Disabled Card'));
        expect(onPressMock).not.toHaveBeenCalled();
    });
});
