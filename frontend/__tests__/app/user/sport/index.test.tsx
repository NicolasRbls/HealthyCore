import React from 'react';
import { render } from '@testing-library/react-native';
import SportIndex from '../../../../app/user/sport/index';
import { Redirect } from 'expo-router';

// Mocks
jest.mock('expo-router', () => ({
    Redirect: jest.fn(() => null),
}));

describe('SportIndex', () => {
    it('redirects to sport-discover', () => {
        render(<SportIndex />);
        expect(Redirect).toHaveBeenCalledWith({ href: '/user/sport/sport-discover' }, {});
    });
});
