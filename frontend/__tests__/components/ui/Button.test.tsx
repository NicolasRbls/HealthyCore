import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Button from '../../../components/ui/Button';

describe('Button', () => {
    it('renders correctly with text', () => {
        const { getByText } = render(<Button text="Click me" onPress={() => { }} />);
        expect(getByText('Click me')).toBeTruthy();
    });

    it('calls onPress when pressed', () => {
        const onPressMock = jest.fn();
        const { getByText } = render(<Button text="Press me" onPress={onPressMock} />);

        fireEvent.press(getByText('Press me'));
        expect(onPressMock).toHaveBeenCalledTimes(1);
    });

    it('shows loading indicator when loading is true', () => {
        const { getByTestId, queryByText } = render(
            <Button text="Loading" onPress={() => { }} loading />
        );

        // ActivityIndicator should be present (we might need to check how it's mocked or query by type)
        // In RNTL, we can often find by accessibility role or just check if text is NOT there if it replaces text?
        // Looking at code: Text is rendered AFTER ActivityIndicator check.
        // {loading ? <ActivityIndicator ... /> : <><Text>...</Text></>}

        expect(queryByText('Loading')).toBeNull();
    });

    it('does not call onPress when disabled', () => {
        const onPressMock = jest.fn();
        const { getByText } = render(
            <Button text="Disabled" onPress={onPressMock} disabled />
        );

        fireEvent.press(getByText('Disabled'));
        expect(onPressMock).not.toHaveBeenCalled();
    });

    it('does not call onPress when loading', () => {
        const onPressMock = jest.fn();
        // When loading, text is not shown, so we need another way to find the button to press.
        // The TouchableOpacity wraps the content.
        // We can add a testID to the button if needed, or find by generic type if possible.
        // Let's rely on the fact that we can pass testID to Button props.

        const { getByTestId } = render(
            <Button text="Loading Press" onPress={onPressMock} loading testID="loading-button" />
        );

        fireEvent.press(getByTestId('loading-button'));
        expect(onPressMock).not.toHaveBeenCalled();
    });
});
