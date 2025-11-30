import React from 'react';
import { render } from '@testing-library/react-native';
import NutritionIndex from '../../../../app/user/nutrition/index';
import { Redirect } from 'expo-router';

// Mocks
jest.mock('expo-router', () => ({
    Redirect: jest.fn(() => null),
}));

describe('NutritionIndex', () => {
    it('redirects to nutrition-discover', () => {
        render(<NutritionIndex />);
        expect(Redirect).toHaveBeenCalledWith({ href: '/user/nutrition/nutrition-discover' }, {});
    });
});
