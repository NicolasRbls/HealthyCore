import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import WeightInput from '../../../components/registration/WeightInput';

describe('WeightInput', () => {
    const defaultProps = {
        currentWeight: '80',
        targetWeight: '75',
        onChangeTargetWeight: jest.fn(),
        estimatedWeeks: 10,
        weeklyChange: 0.5,
        tdee: 2500,
        dailyCalories: 2000,
        caloricAdjustment: -500,
        orientation: 'loss' as const,
    };

    it('renders correctly', () => {
        const { getByText, getByDisplayValue } = render(
            <WeightInput {...defaultProps} />
        );
        expect(getByText('Poids actuel')).toBeTruthy();
        expect(getByText('80')).toBeTruthy();
        expect(getByDisplayValue('75')).toBeTruthy();
        expect(getByText('10 semaines (-0.5 kg par semaine)')).toBeTruthy();
        expect(getByText('2500 kcal/jour')).toBeTruthy();
        expect(getByText('2000 kcal/jour')).toBeTruthy();
        expect(getByText('Déficit calorique:')).toBeTruthy();
        expect(getByText('500 kcal/jour')).toBeTruthy();
    });

    it('handles input change', () => {
        const onChange = jest.fn();
        const { getByDisplayValue } = render(
            <WeightInput {...defaultProps} onChangeTargetWeight={onChange} />
        );
        fireEvent.changeText(getByDisplayValue('75'), '70');
        expect(onChange).toHaveBeenCalledWith('70');
    });

    it('renders gain orientation correctly', () => {
        const props = {
            ...defaultProps,
            targetWeight: '85',
            orientation: 'gain' as const,
            caloricAdjustment: 500,
            dailyCalories: 3000,
        };
        const { getByText } = render(<WeightInput {...props} />);
        expect(getByText('10 semaines (+0.5 kg par semaine)')).toBeTruthy();
        expect(getByText('Surplus calorique:')).toBeTruthy();
        expect(getByText('500 kcal/jour')).toBeTruthy();
    });

    it('renders maintain orientation correctly', () => {
        const props = {
            ...defaultProps,
            targetWeight: '80',
            orientation: 'maintain' as const,
            caloricAdjustment: 0,
            dailyCalories: 2500,
        };
        const { getByText, queryByText } = render(<WeightInput {...props} />);
        expect(getByText('Maintien du poids actuel')).toBeTruthy();
        expect(queryByText('Déficit calorique:')).toBeNull();
        expect(queryByText('Surplus calorique:')).toBeNull();
    });

    it('handles undefined values gracefully', () => {
        const { getByText } = render(
            <WeightInput
                currentWeight="80"
                targetWeight=""
                onChangeTargetWeight={jest.fn()}
                estimatedWeeks={undefined}
                weeklyChange={undefined}
                tdee={undefined}
                dailyCalories={undefined}
                caloricAdjustment={undefined}
                orientation="loss"
            />
        );
        expect(getByText('- semaines (-0 kg par semaine)')).toBeTruthy();
        expect(getByText('- kcal/jour')).toBeTruthy(); // TDEE
    });
});
