import { renderHook, act } from '@testing-library/react-native';
import { useNumericInput } from '../../hooks/useNumericInput';

describe('useNumericInput', () => {
    it('initializes with default values', () => {
        const { result } = renderHook(() => useNumericInput());
        expect(result.current.value).toBe('');
        expect(result.current.numericValue).toBeNull();
        expect(result.current.error).toBeNull();
    });

    it('initializes with provided value', () => {
        const { result } = renderHook(() => useNumericInput({ initialValue: 10 }));
        expect(result.current.value).toBe('10');
        expect(result.current.numericValue).toBe(10);
    });

    it('validates min value', () => {
        const { result } = renderHook(() => useNumericInput({ min: 10 }));

        act(() => {
            result.current.handleChange('5');
        });

        expect(result.current.error).toContain('doit être supérieure ou égale à 10');
    });

    it('validates max value', () => {
        const { result } = renderHook(() => useNumericInput({ max: 10 }));

        act(() => {
            result.current.handleChange('15');
        });

        expect(result.current.error).toContain('doit être inférieure ou égale à 10');
    });

    it('handles precision', () => {
        const { result } = renderHook(() => useNumericInput({ precision: 2 }));

        act(() => {
            result.current.handleChange('10.55');
        });

        expect(result.current.value).toBe('10.55');
        expect(result.current.numericValue).toBe(10.55);
    });

    it('rejects invalid format', () => {
        const { result } = renderHook(() => useNumericInput());

        act(() => {
            result.current.handleChange('abc');
        });

        // Should not update value if invalid
        expect(result.current.value).toBe('');
    });

    it('calls onChange callback', () => {
        const onChange = jest.fn();
        const { result } = renderHook(() => useNumericInput({ onChange }));

        act(() => {
            result.current.handleChange('10');
        });

        expect(onChange).toHaveBeenCalledWith(10);
    });
});
