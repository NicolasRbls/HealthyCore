import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import NumericInput from '../../../components/ui/NumericInput';

describe('NumericInput', () => {
    it('renders correctly', () => {
        const { getByDisplayValue } = render(<NumericInput value={10} />);
        expect(getByDisplayValue('10')).toBeTruthy();
    });

    it('handles text change', () => {
        const onChangeText = jest.fn();
        const { getByDisplayValue } = render(<NumericInput value={10} onChangeText={onChangeText} />);

        fireEvent.changeText(getByDisplayValue('10'), '20');
        expect(onChangeText).toHaveBeenCalledWith('20');
    });

    it('increments value', () => {
        const onChangeText = jest.fn();
        const { getByTestId } = render(
            <NumericInput
                value={10}
                onChangeText={onChangeText}
                showControls
            />
        );

        fireEvent.press(getByTestId('increment-button'));
        expect(onChangeText).toHaveBeenCalledWith('11');
    });

    it('decrements value', () => {
        const onChangeText = jest.fn();
        const { getByTestId } = render(
            <NumericInput
                value={10}
                onChangeText={onChangeText}
                showControls
            />
        );

        fireEvent.press(getByTestId('decrement-button'));
        expect(onChangeText).toHaveBeenCalledWith('9');
    });
});
