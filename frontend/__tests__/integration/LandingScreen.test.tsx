import React from 'react';
import { render } from '@testing-library/react-native';
import Index from '../../app/index';
import { Redirect } from 'expo-router';

// Mocks
jest.mock('expo-router', () => ({
    Redirect: jest.fn(() => null),
}));

describe('LandingScreen', () => {
    it('redirects to welcome', () => {
        render(<Index />);
        expect(Redirect).toHaveBeenCalledWith({ href: '/welcome' }, {});
    });
});
