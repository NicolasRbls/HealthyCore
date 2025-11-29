import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import PhysicalScreen from '../../app/register/step2_physical';
import { useRegistration } from '../../context/RegistrationContext';

// Mocks
jest.mock('../../context/RegistrationContext');
jest.mock('../../components/layout/Header', () => 'Header');
jest.mock('../../components/layout/ProgressIndicator', () => 'ProgressIndicator');

// Mock DatePicker to easily trigger change
jest.mock('../../components/ui/DatePicker', () => {
    const React = require('react');
    const { TouchableOpacity, Text, View } = require('react-native');
    return ({ onChange, value, placeholder, error }: any) => (
        <View>
            <TouchableOpacity onPress={() => onChange(new Date('1990-01-01'))} testID="date-picker">
                <Text>{value ? value.toISOString().split('T')[0] : placeholder}</Text>
            </TouchableOpacity>
            {error && <Text>{error}</Text>}
        </View>
    );
});

// Mock useForm
jest.mock('../../hooks/useForm', () => ({
    useForm: ({ onSubmit, validate, initialValues }: any) => {
        const React = require('react');
        const [values, setValues] = React.useState(initialValues);
        const [errors, setErrors] = React.useState({});
        const [touched, setTouched] = React.useState({});

        const handleChange = (name: string, value: string) => {
            setValues((prev: any) => ({ ...prev, [name]: value }));
        };

        const setFieldValues = (newValues: any) => {
            setValues((prev: any) => ({ ...prev, ...newValues }));
        };

        const handleBlur = (name: string) => {
            setTouched((prev: any) => ({ ...prev, [name]: true }));
        };

        const handleSubmit = async () => {
            const allTouched = Object.keys(values).reduce((acc: any, key) => {
                acc[key] = true;
                return acc;
            }, {});
            setTouched(allTouched);

            if (validate) {
                const validationErrors = validate(values);
                setErrors(validationErrors);
                if (Object.keys(validationErrors).length > 0) return;
            }
            await onSubmit(values);
        };

        return {
            values,
            handleChange,
            handleSubmit,
            errors,
            touched,
            handleBlur,
            setFieldValues,
            globalError: null,
            setGlobalError: jest.fn(),
        };
    },
}));

describe('PhysicalScreen', () => {
    const mockSetFields = jest.fn();
    const mockGoToNextStep = jest.fn();
    const mockValidateStep = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (useRegistration as jest.Mock).mockReturnValue({
            data: {},
            setFields: mockSetFields,
            goToNextStep: mockGoToNextStep,
            validateStep: mockValidateStep,
            currentStep: 2,
            totalSteps: 5,
            loading: false,
            error: null,
        });
    });

    it('renders correctly', () => {
        const { getByText } = render(<PhysicalScreen />);
        expect(getByText('Quelques questions sur vous')).toBeTruthy();
        expect(getByText('Sexe')).toBeTruthy();
        expect(getByText('Date de naissance')).toBeTruthy();
        expect(getByText('Poids (kg)')).toBeTruthy();
        expect(getByText('Taille (cm)')).toBeTruthy();
    });

    it('validates empty fields', async () => {
        const { getByText } = render(<PhysicalScreen />);

        fireEvent.press(getByText('Suivant'));

        await waitFor(() => {
            expect(getByText('La date de naissance est requise')).toBeTruthy();
            expect(getByText('Le poids est requis')).toBeTruthy();
            expect(getByText('La taille est requise')).toBeTruthy();
        });
    });

    it('submits valid data', async () => {
        mockValidateStep.mockResolvedValue(true);
        const { getByText, getByPlaceholderText, getByTestId } = render(<PhysicalScreen />);

        // Select Gender
        fireEvent.press(getByText('Homme'));

        // Enter Weight
        fireEvent.changeText(getByPlaceholderText('Votre poids en kg'), '75');

        // Enter Height
        fireEvent.changeText(getByPlaceholderText('Votre taille en cm'), '180');

        // Enter Date (using mock)
        fireEvent.press(getByTestId('date-picker'));

        fireEvent.press(getByText('Suivant'));

        await waitFor(() => {
            expect(mockSetFields).toHaveBeenCalledWith(expect.objectContaining({
                gender: 'H',
                weight: 75,
                height: 180,
                birthDate: '1990-01-01'
            }));
            expect(mockValidateStep).toHaveBeenCalledWith(2);
            expect(mockGoToNextStep).toHaveBeenCalled();
        });
    });
});
