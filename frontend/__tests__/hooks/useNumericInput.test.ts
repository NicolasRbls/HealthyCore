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

    it('handles negative numbers when allowed', () => {
        const { result } = renderHook(() => useNumericInput({ allowNegative: true }));

        act(() => {
            result.current.handleChange('-');
        });
        expect(result.current.value).toBe('-');
        expect(result.current.numericValue).toBeNull();

        act(() => {
            result.current.handleChange('-5');
        });
        expect(result.current.value).toBe('-5');
        expect(result.current.numericValue).toBe(-5);
    });

    it('rejects negative numbers when not allowed', () => {
        const { result } = renderHook(() => useNumericInput({ allowNegative: false }));

        act(() => {
            result.current.handleChange('-');
        });
        expect(result.current.value).toBe('');
    });

    it('handles empty string', () => {
        const onChange = jest.fn();
        const { result } = renderHook(() => useNumericInput({ initialValue: 10, onChange }));

        act(() => {
            result.current.handleChange('');
        });

        expect(result.current.value).toBe('');
        expect(result.current.numericValue).toBeNull();
        expect(result.current.error).toBeNull();
        expect(onChange).toHaveBeenCalledWith(null);
    });

    it('formats value correctly', () => {
        const { result } = renderHook(() => useNumericInput({ precision: 2 }));

        expect(result.current.formattedValue(10.5)).toBe('10.50');
        expect(result.current.formattedValue(null)).toBe('');
    });

    it('formats value with 0 precision', () => {
        const { result } = renderHook(() => useNumericInput({ precision: 0 }));

        expect(result.current.formattedValue(10.5)).toBe('11');
    });
});
