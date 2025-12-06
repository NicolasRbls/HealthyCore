import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ProgressScreen from '../../app/user/profile/progress';
import userService from '../../services/user.service';
import { format } from 'date-fns';

// Mocks
jest.mock('../../services/user.service');
jest.mock('expo-router', () => {
    const React = require('react');
    const back = jest.fn();
    const router = { back };
    return {
        useRouter: jest.fn(() => router),
        router,
        useFocusEffect: jest.fn((callback) => React.useEffect(callback, [callback])),
    };
});
jest.mock('@expo/vector-icons', () => ({
    Ionicons: 'Ionicons',
}));

describe('ProgressScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Mock successful response for initial load
        (userService.getUserEvolution as jest.Mock).mockResolvedValue({
            evolution: [],
            statistics: null,
        });
        (userService.getProgressStats as jest.Mock).mockResolvedValue(null);
    });

    it('uses local date for new evolution entry', async () => {
        const { getByText, getByPlaceholderText } = render(<ProgressScreen />);

        // Open modal
        fireEvent.press(getByText('Ajouter'));

        // Check if date picker is present (we can't easily check the value of the date picker directly in this setup without more complex mocking, 
        // but we can verify the add function is called with the correct date format)

        // Fill form
        fireEvent.changeText(getByPlaceholderText('Entrez votre poids'), '75');
        fireEvent.changeText(getByPlaceholderText('Entrez votre taille'), '180');

        // Submit
        fireEvent.press(getByText('Enregistrer'));

        await waitFor(() => {
            const expectedDate = format(new Date(), 'yyyy-MM-dd');
            expect(userService.addEvolutionEntry).toHaveBeenCalledWith({
                weight: 75,
                height: 180,
                date: expectedDate,
            });
        });
    });
});
