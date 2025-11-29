import React from 'react';
import { render, act, waitFor, fireEvent } from '@testing-library/react-native';
import { RegistrationProvider, useRegistration } from '../../context/RegistrationContext';
import validationService from '../../services/validation.service';
import { router } from 'expo-router';

// Mocks
jest.mock('../../services/validation.service');
jest.mock('expo-router', () => ({
    router: {
        push: jest.fn(),
    },
}));

const mockRegister = jest.fn();
jest.mock('../../context/AuthContext', () => ({
    useAuth: () => ({
        register: mockRegister,
    }),
}));

import { View, Text, Button } from 'react-native';

// Helper component
const TestComponent = () => {
    const {
        data,
        setField,
        setFields,
        currentStep,
        goToNextStep,
        goToPreviousStep,
        validateStep,
        completeRegistration,
        error,
    } = useRegistration();

    return (
        <View>
            <Text>Step: {currentStep}</Text>
            <Text>Email: {data.email}</Text>
            {error && <Text>Error: {error}</Text>}
            <Button title="Set Email" onPress={() => setField('email', 'test@example.com')} />
            <Button title="Set Name" onPress={() => setFields({ firstName: 'John', lastName: 'Doe' })} />
            <Button title="Next" onPress={() => goToNextStep()} />
            <Button title="Prev" onPress={() => goToPreviousStep()} />
            <Button title="Validate Step 1" onPress={() => validateStep(1)} />
            <Button title="Complete" onPress={() => completeRegistration()} />
        </View>
    );
};

describe('RegistrationContext', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('updates fields correctly', () => {
        const { getByText } = render(
            <RegistrationProvider>
                <TestComponent />
            </RegistrationProvider>
        );

        fireEvent.press(getByText('Set Email'));

        expect(getByText('Email: test@example.com')).toBeTruthy();
    });

    it('navigates between steps', () => {
        const { getByText } = render(
            <RegistrationProvider>
                <TestComponent />
            </RegistrationProvider>
        );

        expect(getByText('Step: 1')).toBeTruthy();

        fireEvent.press(getByText('Next'));

        expect(getByText('Step: 2')).toBeTruthy();
        expect(router.push).toHaveBeenCalledWith('/register/step2_physical');

        fireEvent.press(getByText('Prev'));

        expect(getByText('Step: 1')).toBeTruthy();
    });

    it('validates step 1 correctly', async () => {
        (validationService.validateProfile as jest.Mock).mockResolvedValue({ isValid: true, errors: {} });
        (validationService.checkEmail as jest.Mock).mockResolvedValue({ available: true });

        const { getByText } = render(
            <RegistrationProvider>
                <TestComponent />
            </RegistrationProvider>
        );

        await act(async () => {
            fireEvent.press(getByText('Validate Step 1'));
        });

        expect(validationService.validateProfile).toHaveBeenCalled();
    });

    it('completes registration', async () => {
        mockRegister.mockResolvedValue({});

        const { getByText } = render(
            <RegistrationProvider>
                <TestComponent />
            </RegistrationProvider>
        );

        await act(async () => {
            fireEvent.press(getByText('Complete'));
        });

        expect(mockRegister).toHaveBeenCalled();
    });
});
