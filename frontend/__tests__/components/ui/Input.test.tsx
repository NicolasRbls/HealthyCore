import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Input from '../../../components/ui/Input';

// Mocks
jest.mock('@expo/vector-icons', () => ({
    Ionicons: 'Ionicons',
}));

describe('Input', () => {
    it('renders correctly with label and placeholder', () => {
        const { getByText, getByPlaceholderText } = render(
            <Input label="Email" placeholder="Enter email" />
        );
        expect(getByText('Email')).toBeTruthy();
        expect(getByPlaceholderText('Enter email')).toBeTruthy();
    });

    it('handles text change', () => {
        const onChangeTextMock = jest.fn();
        const { getByPlaceholderText } = render(
            <Input placeholder="Enter email" onChangeText={onChangeTextMock} />
        );

        fireEvent.changeText(getByPlaceholderText('Enter email'), 'test@example.com');
        expect(onChangeTextMock).toHaveBeenCalledWith('test@example.com');
    });

    it('displays error message when touched', () => {
        const { getByText } = render(
            <Input label="Email" error="Invalid email" touched={true} />
        );
        expect(getByText('Invalid email')).toBeTruthy();
    });

    it('does not display error message when not touched', () => {
        const { queryByText } = render(
            <Input label="Email" error="Invalid email" touched={false} />
        );
        expect(queryByText('Invalid email')).toBeNull();
    });

    it('toggles password visibility', () => {
        const toggleMock = jest.fn();
        const { getByTestId } = render(
            <Input
                label="Password"
                isPassword={true}
                showPassword={false}
                togglePasswordVisibility={toggleMock}
            />
        );

        fireEvent.press(getByTestId('password-toggle'));
        expect(toggleMock).toHaveBeenCalled();
    });
});
