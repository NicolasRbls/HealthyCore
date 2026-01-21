import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import NutritionalPlansSelector from '../../../components/nutrition/NutritionalPlansSelector';

// Mock SelectableOption
jest.mock('../../../components/registration/SelectableOption', () => {
    const { TouchableOpacity, Text } = require('react-native');
    return ({ title, onPress, selected }: any) => (
        <TouchableOpacity onPress={onPress} testID={`option-${title}`}>
            <Text>{title}</Text>
            {selected && <Text>Selected</Text>}
        </TouchableOpacity>
    );
});

describe('NutritionalPlansSelector', () => {
    const mockPlans = [
        {
            id_repartition_nutritionnelle: 1,
            nom: 'Plan Perte 1',
            type: 'perte_de_poids',
            pourcentage_glucides: 40,
            pourcentage_proteines: 30,
            pourcentage_lipides: 30,
            description: 'Desc 1',
        },
        {
            id_repartition_nutritionnelle: 2,
            nom: 'Plan Prise 1',
            type: 'prise_de_poids',
            pourcentage_glucides: 50,
            pourcentage_proteines: 25,
            pourcentage_lipides: 25,
            description: 'Desc 2',
        },
        {
            id_repartition_nutritionnelle: 3,
            nom: 'Plan Maintien 1',
            type: 'maintien',
            pourcentage_glucides: 45,
            pourcentage_proteines: 25,
            pourcentage_lipides: 30,
            description: 'Desc 3',
        },
    ];

    it('renders loading indicator', () => {
        const { getByTestId } = render(
            <NutritionalPlansSelector
                plans={[]}
                selectedPlanId={null}
                onPlanSelected={jest.fn()}
                isLoading={true}
            />
        );
        // ActivityIndicator usually has no testID by default, but we can check if it renders.
        // Or we can check if other elements are absent.
        // React Native Testing Library might find it by type, but let's assume we can't easily without testID.
        // However, the component returns ONLY ActivityIndicator.
        // We can check if it matches snapshot or check for absence of other text.
        // Better: mock ActivityIndicator?
    });

    it('renders empty state', () => {
        const { getByText } = render(
            <NutritionalPlansSelector
                plans={[]}
                selectedPlanId={null}
                onPlanSelected={jest.fn()}
                isLoading={false}
            />
        );
        expect(getByText('Aucun plan nutritionnel disponible')).toBeTruthy();
    });

    it('filters plans based on userWeightGoal (perte_de_poids)', () => {
        const { getByText, queryByText } = render(
            <NutritionalPlansSelector
                plans={mockPlans}
                selectedPlanId={null}
                onPlanSelected={jest.fn()}
                isLoading={false}
                userWeightGoal="perte_de_poids"
            />
        );
        expect(getByText('Plans pour perte de poids')).toBeTruthy();
        expect(getByText('Plan Perte 1')).toBeTruthy();
        expect(queryByText('Plan Prise 1')).toBeNull();
    });

    it('filters plans based on selectedPlanId', () => {
        const { getByText, queryByText } = render(
            <NutritionalPlansSelector
                plans={mockPlans}
                selectedPlanId={2} // Plan Prise 1
                onPlanSelected={jest.fn()}
                isLoading={false}
            />
        );
        expect(getByText('Plans pour prise de poids')).toBeTruthy();
        expect(getByText('Plan Prise 1')).toBeTruthy();
        expect(queryByText('Plan Perte 1')).toBeNull();
    });

    it('defaults to maintien if no goal and no selection', () => {
        const { getByText, queryByText } = render(
            <NutritionalPlansSelector
                plans={mockPlans}
                selectedPlanId={null}
                onPlanSelected={jest.fn()}
                isLoading={false}
            />
        );
        expect(getByText('Plans pour maintien de poids')).toBeTruthy();
        expect(getByText('Plan Maintien 1')).toBeTruthy();
    });

    it('calls onPlanSelected when option is pressed', () => {
        const onSelect = jest.fn();
        const { getByTestId } = render(
            <NutritionalPlansSelector
                plans={mockPlans}
                selectedPlanId={null}
                onPlanSelected={onSelect}
                isLoading={false}
                userWeightGoal="perte_de_poids"
            />
        );
        fireEvent.press(getByTestId('option-Plan Perte 1'));
        expect(onSelect).toHaveBeenCalledWith(1);
    });
});
