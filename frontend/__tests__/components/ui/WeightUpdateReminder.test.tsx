import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import WeightUpdateReminder from '../../../components/ui/WeightUpdateReminder';
import userService from '../../../services/user.service';

jest.mock('../../../services/user.service');

describe('WeightUpdateReminder', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders nothing when no update needed', async () => {
        (userService.checkWeightUpdateStatus as jest.Mock).mockResolvedValue({ needsUpdate: false });

        const { toJSON } = render(<WeightUpdateReminder />);

        await waitFor(() => {
            expect(toJSON()).toBeNull();
        });
    });

    it('renders reminder when update needed', async () => {
        (userService.checkWeightUpdateStatus as jest.Mock).mockResolvedValue({
            needsUpdate: true,
            daysSinceLastUpdate: 10
        });
        (userService.getUserProfile as jest.Mock).mockResolvedValue({ metrics: { currentHeight: 180 } });

        const { getByText } = render(<WeightUpdateReminder />);

        await waitFor(() => {
            expect(getByText('Mise à jour du poids nécessaire')).toBeTruthy();
            expect(getByText(/10 jours/)).toBeTruthy();
        });
    });

    it('opens modal and updates weight', async () => {
        (userService.checkWeightUpdateStatus as jest.Mock).mockResolvedValue({
            needsUpdate: true,
            daysSinceLastUpdate: 10
        });
        (userService.getUserProfile as jest.Mock).mockResolvedValue({ metrics: { currentHeight: 180 } });
        (userService.addEvolutionEntry as jest.Mock).mockResolvedValue({});

        const { getByText, getByPlaceholderText } = render(<WeightUpdateReminder />);

        await waitFor(() => {
            expect(getByText('Mettre à jour maintenant')).toBeTruthy();
        });

        fireEvent.press(getByText('Mettre à jour maintenant'));

        await waitFor(() => {
            expect(getByText('Mettre à jour votre poids')).toBeTruthy();
        });

        fireEvent.changeText(getByPlaceholderText('Entrez votre poids actuel'), '75');
        fireEvent.press(getByText('Enregistrer'));

        await waitFor(() => {
            expect(userService.addEvolutionEntry).toHaveBeenCalledWith({ weight: 75, height: 180 });
        });
    });
});
