import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import TargetWeightScreen from '../../app/register/step4_target_weight';
import { useRegistration } from '../../context/RegistrationContext';
import validationService from '../../services/validation.service';
import { Alert } from 'react-native';

// Mocks
jest.mock('../../context/RegistrationContext');
jest.mock('../../services/validation.service');
jest.mock('../../components/layout/Header', () => 'Header');
jest.mock('../../components/layout/ProgressIndicator', () => 'ProgressIndicator');

// Mock WeightInput
jest.mock('../../components/registration/WeightInput', () => {
    const React = require('react');
    const { TextInput, View, Text } = require('react-native');
    return ({ targetWeight, onChangeTargetWeight, isValid }: any) => (
        <View>
            <TextInput
                testID="target-weight-input"
                value={targetWeight}
                onChangeText={onChangeTargetWeight}
            />
            {!isValid && <Text>Poids invalide</Text>}
        </View>
    );
});

describe('TargetWeightScreen', () => {
    const mockSetFields = jest.fn();
    const mockSetField = jest.fn();
    const mockGoToNextStep = jest.fn();
    const mockValidateStep = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(Alert, 'alert');
        (useRegistration as jest.Mock).mockReturnValue({
            data: {
                weight: 80,
                height: 180,
                gender: 'H',
                birthDate: '1990-01-01',
                sedentaryLevelId: 1,
            },
            setFields: mockSetFields,
            setField: mockSetField,
            goToNextStep: mockGoToNextStep,
            validateStep: mockValidateStep,
            currentStep: 4,
            totalSteps: 5,
            loading: false,
            error: null,
        });
    });

    it('renders correctly', () => {
        const { getByText } = render(<TargetWeightScreen />);
        expect(getByText('Quel est votre objectif de poids ?')).toBeTruthy();
    });

    it('validates target weight', async () => {
        (validationService.validateTargetWeight as jest.Mock).mockResolvedValue({
            isValid: true,
            estimation: {
                estimatedWeeks: 10,
                weeklyChange: -0.5,
                tdee: 2500,
                dailyCalories: 2000,
                caloricAdjustment: -500,
                orientation: 'loss',
            },
        });

        const { getByTestId } = render(<TargetWeightScreen />);

        fireEvent.changeText(getByTestId('target-weight-input'), '75');

        await waitFor(() => {
            expect(validationService.validateTargetWeight).toHaveBeenCalled();
            expect(mockSetField).toHaveBeenCalledWith('targetWeight', 75);
        });
    });

    it('submits valid data', async () => {
        (validationService.validateTargetWeight as jest.Mock).mockResolvedValue({
            isValid: true,
            estimation: {
                estimatedWeeks: 10,
                weeklyChange: -0.5,
                tdee: 2500,
                dailyCalories: 2000,
                caloricAdjustment: -500,
                orientation: 'loss',
            },
        });
        mockValidateStep.mockResolvedValue(true);

        const { getByText, getByTestId } = render(<TargetWeightScreen />);

        fireEvent.changeText(getByTestId('target-weight-input'), '75');

        // Wait for validation debounce
        await waitFor(() => expect(validationService.validateTargetWeight).toHaveBeenCalled());

        fireEvent.press(getByText('Suivant'));

        await waitFor(() => {
            expect(mockValidateStep).toHaveBeenCalledWith(4);
            expect(mockGoToNextStep).toHaveBeenCalled();
        });
    });

    it('shows error on empty submission', async () => {
        const { getByText } = render(<TargetWeightScreen />);

        fireEvent.press(getByText('Suivant'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Erreur', 'Veuillez indiquer votre poids cible');
        });
    });
});
