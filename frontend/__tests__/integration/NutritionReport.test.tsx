import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ReportScreen from '../../app/user/nutrition/report';
import signalementService from '../../services/signalement.service';
import { Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

// Mocks
jest.mock('../../services/signalement.service');
jest.mock('expo-router', () => ({
    useRouter: jest.fn(),
    useLocalSearchParams: jest.fn(),
    Stack: {
        Screen: () => null,
    },
}));
jest.mock('@expo/vector-icons', () => ({
    Ionicons: 'Ionicons',
}));

describe('ReportScreen', () => {
    const mockRouter = { back: jest.fn() };
    const mockTypes = [
        { id_signalement: 1, titre: 'Wrong Info' },
        { id_signalement: 2, titre: 'Duplicate' },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(Alert, 'alert');
        (useRouter as jest.Mock).mockReturnValue(mockRouter);
        (useLocalSearchParams as jest.Mock).mockReturnValue({ id: '1', name: 'Apple' });
        (signalementService.getTypes as jest.Mock).mockResolvedValue(mockTypes);
        (signalementService.create as jest.Mock).mockResolvedValue({ success: true });
    });

    it('renders correctly and fetches types', async () => {
        const { getByText } = render(<ReportScreen />);

        await waitFor(() => {
            expect(signalementService.getTypes).toHaveBeenCalled();
            expect(getByText('Signaler : Apple')).toBeTruthy();
            expect(getByText('Wrong Info')).toBeTruthy();
        });
    });

    it('submits report successfully', async () => {
        const { getByText, getByPlaceholderText } = render(<ReportScreen />);

        await waitFor(() => expect(getByText('Wrong Info')).toBeTruthy());

        // Select type
        fireEvent.press(getByText('Wrong Info'));

        // Enter description
        fireEvent.changeText(getByPlaceholderText('Détaillez le problème...'), 'Test description');

        // Submit
        fireEvent.press(getByText('Envoyer le signalement'));

        await waitFor(() => {
            expect(signalementService.create).toHaveBeenCalledWith({
                id_signalement: 1,
                id_aliment: 1,
                description: 'Test description',
            });
            expect(Alert.alert).toHaveBeenCalledWith('Succès', expect.any(String), expect.any(Array));
        });
    });

    it('shows error if no type selected', async () => {
        const { getByText } = render(<ReportScreen />);

        await waitFor(() => expect(getByText('Envoyer le signalement')).toBeTruthy());

        fireEvent.press(getByText('Envoyer le signalement'));

        expect(Alert.alert).toHaveBeenCalledWith('Erreur', 'Veuillez sélectionner un type de signalement');
    });
});
