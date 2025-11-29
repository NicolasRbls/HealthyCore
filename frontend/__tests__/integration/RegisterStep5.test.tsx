import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import NutritionPlanScreen from '../../app/register/step5_nutrition_plan';
import { useRegistration } from '../../context/RegistrationContext';
import dataService from '../../services/data.service';
import { Alert } from 'react-native';

// Mocks
jest.mock('../../context/RegistrationContext');
jest.mock('../../services/data.service');
jest.mock('../../components/layout/Header', () => 'Header');
jest.mock('../../components/layout/ProgressIndicator', () => 'ProgressIndicator');

// Mock NutritionalPlanCard
jest.mock('../../components/registration/NutritionalPlanCard', () => {
    const React = require('react');
    const { TouchableOpacity, Text } = require('react-native');
    return ({ plan, onSelect }: any) => (
        <TouchableOpacity onPress={onSelect}>
            <Text>{plan.nom}</Text>
        </TouchableOpacity>
    );
});

describe('NutritionPlanScreen', () => {
    const mockSetField = jest.fn();
    const mockGoToNextStep = jest.fn();
    const mockValidateStep = jest.fn();

    const mockPlans = [
        { id_repartition_nutritionnelle: 1, nom: 'Equilibré' },
        { id_repartition_nutritionnelle: 2, nom: 'Low Carb' },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(Alert, 'alert');
        (useRegistration as jest.Mock).mockReturnValue({
            data: { weightChangeType: 'loss' },
            setField: mockSetField,
            goToNextStep: mockGoToNextStep,
            validateStep: mockValidateStep,
            currentStep: 5,
            totalSteps: 5,
            loading: false,
            error: null,
        });
        (dataService.getNutritionalPlans as jest.Mock).mockResolvedValue(mockPlans);
    });

    it('renders correctly and fetches plans', async () => {
        const { getByText } = render(<NutritionPlanScreen />);

        expect(getByText('Choisissez votre plan nutritionnel')).toBeTruthy();

        await waitFor(() => {
            expect(dataService.getNutritionalPlans).toHaveBeenCalledWith('perte_de_poids');
            expect(getByText('Equilibré')).toBeTruthy();
            expect(getByText('Low Carb')).toBeTruthy();
        });
    });

    it('selects a plan and proceeds', async () => {
        mockValidateStep.mockResolvedValue(true);
        const { getByText } = render(<NutritionPlanScreen />);

        await waitFor(() => expect(getByText('Equilibré')).toBeTruthy());

        fireEvent.press(getByText('Equilibré'));

        await waitFor(() => {
            expect(mockSetField).toHaveBeenCalledWith('nutritionalPlanId', 1);
        });

        fireEvent.press(getByText('Suivant'));

        await waitFor(() => {
            expect(mockValidateStep).toHaveBeenCalledWith(5);
            expect(mockGoToNextStep).toHaveBeenCalled();
        });
    });

    it('shows error if no selection', async () => {
        const { getByText } = render(<NutritionPlanScreen />);

        await waitFor(() => expect(getByText('Equilibré')).toBeTruthy());

        fireEvent.press(getByText('Suivant'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Erreur', 'Veuillez sélectionner un plan nutritionnel');
        });
    });
});
