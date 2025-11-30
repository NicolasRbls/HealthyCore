import React from 'react';
import { render } from '@testing-library/react-native';
import ErrorMessage from '../../../components/ui/ErrorMessage';

describe('ErrorMessage', () => {
    it('renders nothing when no errors', () => {
        const { toJSON } = render(<ErrorMessage errors={[]} />);
        expect(toJSON()).toBeNull();
    });

    it('renders nothing when errors are empty strings', () => {
        const { toJSON } = render(<ErrorMessage errors={['', null, undefined]} />);
        expect(toJSON()).toBeNull();
    });

    it('renders single error', () => {
        const { getByText } = render(<ErrorMessage errors={['Error 1']} />);
        expect(getByText('Error 1')).toBeTruthy();
    });

    it('renders multiple errors', () => {
        const { getByText } = render(<ErrorMessage errors={['Error 1', 'Error 2']} />);
        expect(getByText('Error 1')).toBeTruthy();
        expect(getByText('Error 2')).toBeTruthy();
    });
});
