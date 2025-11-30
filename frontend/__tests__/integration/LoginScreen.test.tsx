import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '../../app/auth/login';
import { useAuth } from '../../context/AuthContext';
import { router } from 'expo-router';

// Mocks
jest.mock('../../context/AuthContext');
jest.mock('expo-router', () => ({
    router: {
        push: jest.fn(),
        back: jest.fn(),
    },
}));

// Mock useForm to test integration with the screen's onSubmit logic
jest.mock('../../hooks/useForm', () => ({
    useForm: ({ onSubmit, validate }: any) => {
        const React = require('react');
        const [values, setValues] = React.useState({ email: '', password: '' });
        const [errors, setErrors] = React.useState({});
        const [touched, setTouched] = React.useState({});

        const handleChange = (name: string, value: string) => {
            setValues((prev: any) => ({ ...prev, [name]: value }));
        };

        const handleBlur = (name: string) => {
            setTouched((prev: any) => ({ ...prev, [name]: true }));
        };

        const handleSubmit = async () => {
            // Mark all fields as touched
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
            globalError: null,
            setGlobalError: jest.fn(),
        };
    },
}));

describe('LoginScreen', () => {
    const mockLogin = jest.fn();
    const mockClearError = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();

        (useAuth as jest.Mock).mockReturnValue({
            login: mockLogin,
            loading: false,
            error: null,
            clearError: mockClearError,
        });
    });

    it('renders correctly', () => {
        const { getByText, getByPlaceholderText } = render(<LoginScreen />);
        expect(getByText('Connectez-vous')).toBeTruthy();
        expect(getByPlaceholderText('votre@email.com')).toBeTruthy();
        expect(getByPlaceholderText('Votre mot de passe')).toBeTruthy();
        expect(getByText('Se connecter')).toBeTruthy();
    });

    it('validates input fields', async () => {
        const { getByText } = render(<LoginScreen />);

        fireEvent.press(getByText('Se connecter'));

        await waitFor(() => {
            expect(getByText("L'email est requis")).toBeTruthy();
            expect(getByText('Le mot de passe est requis')).toBeTruthy();
        });
    });

    it('calls login on valid submission', async () => {
        const { getByText, getByPlaceholderText } = render(<LoginScreen />);

        fireEvent.changeText(getByPlaceholderText('votre@email.com'), 'test@example.com');
        fireEvent.changeText(getByPlaceholderText('Votre mot de passe'), 'password123');

        fireEvent.press(getByText('Se connecter'));

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
        });
    });

    it('navigates to register screen', () => {
        const { getByText } = render(<LoginScreen />);

        fireEvent.press(getByText('Inscrivez-vous'));

        expect(router.push).toHaveBeenCalledWith('/register/step1_profile');
    });
});
