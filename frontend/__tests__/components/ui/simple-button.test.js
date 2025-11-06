// __tests__/components/ui/simple-button.test.js
import React from 'react';
import { render, fireEvent } from '@testing-library/react';

// Un composant bouton simple en React (pas React Native)
const SimpleButton = ({ text, onPress, loading = false }) => {
  return (
    <button 
      data-testid="button" 
      onClick={loading ? undefined : onPress}
      disabled={loading}
    >
      {loading ? (
        <div data-testid="loading-indicator">Chargement...</div>
      ) : (
        <span data-testid="button-text">{text}</span>
      )}
    </button>
  );
};

describe('Simple Button Component', () => {
  it('renders with text', () => {
    const { getByTestId } = render(
      <SimpleButton text="Test Button" onPress={() => {}} />
    );
    
    // Sans utiliser toBeInTheDocument()
    expect(getByTestId('button-text')).toBeTruthy();
    expect(getByTestId('button-text').textContent).toBe('Test Button');
  });
  
  it('calls onPress when clicked', () => {
    const onPressMock = jest.fn();
    const { getByTestId } = render(
      <SimpleButton text="Click Me" onPress={onPressMock} />
    );
    
    fireEvent.click(getByTestId('button'));
    expect(onPressMock).toHaveBeenCalled();
  });
  
  it('shows loading indicator when loading is true', () => {
    const { queryByTestId, getByTestId } = render(
      <SimpleButton text="Loading" onPress={() => {}} loading={true} />
    );
    
    // Sans utiliser toBeInTheDocument() ni not.toBeInTheDocument()
    expect(queryByTestId('button-text')).toBeNull();
    expect(getByTestId('loading-indicator')).toBeTruthy();
    expect(getByTestId('button').disabled).toBe(true);
  });
});