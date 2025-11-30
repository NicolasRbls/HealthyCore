import React from 'react';
import { render } from '@testing-library/react-native';
import Separator from '../../../components/ui/Separator';
import Colors from '../../../constants/Colors';

describe('Separator', () => {
    it('renders simple line when no text provided', () => {
        const { toJSON } = render(<Separator />);
        // We can check style or just snapshot, but let's check if it renders without error
        // and maybe check style if possible, but style is flattened.
        // Simple check: it renders.
        expect(toJSON()).toBeTruthy();
    });

    it('renders with text', () => {
        const { getByText } = render(<Separator text="OR" />);
        expect(getByText('OR')).toBeTruthy();
    });

    it('renders with text position left', () => {
        const { getByText } = render(<Separator text="Left" textPosition="left" />);
        expect(getByText('Left')).toBeTruthy();
    });

    it('renders with text position right', () => {
        const { getByText } = render(<Separator text="Right" textPosition="right" />);
        expect(getByText('Right')).toBeTruthy();
    });

    it('applies custom styles', () => {
        const { getByText } = render(
            <Separator
                text="Custom"
                lineColor="red"
                textColor="blue"
                style={{ marginTop: 10 }}
                textStyle={{ fontSize: 20 }}
            />
        );
        const text = getByText('Custom');
        expect(text.props.style).toEqual(expect.arrayContaining([
            expect.objectContaining({ color: 'blue' }),
            expect.objectContaining({ fontSize: 20 })
        ]));
    });
});
