import { renderHook, act } from '@testing-library/react-native';
import { useDatePicker } from '../../hooks/useDatePicker';

describe('useDatePicker', () => {
    it('initializes with default values', () => {
        const { result } = renderHook(() => useDatePicker());
        expect(result.current.date).toBeNull();
        expect(result.current.show).toBe(false);
        expect(result.current.error).toBeNull();
    });

    it('initializes with provided date', () => {
        const date = new Date('2023-01-01');
        const { result } = renderHook(() => useDatePicker({ initialDate: date }));
        expect(result.current.date).toEqual(date);
    });

    it('validates min date', () => {
        const minDate = new Date('2023-01-01');
        const { result } = renderHook(() => useDatePicker({ minDate }));

        act(() => {
            result.current.validate(new Date('2022-12-31'));
        });

        expect(result.current.error).toContain('La date doit être après');
    });

    it('validates max date', () => {
        const maxDate = new Date('2023-01-01');
        const { result } = renderHook(() => useDatePicker({ maxDate }));

        act(() => {
            result.current.validate(new Date('2023-01-02'));
        });

        expect(result.current.error).toContain('La date doit être avant');
    });

    it('formats date correctly', () => {
        const { result } = renderHook(() => useDatePicker());
        const date = new Date('2023-01-01');
        expect(result.current.formattedDate(date)).toBe('2023-01-01');
    });

    it('handles change event', () => {
        const onChange = jest.fn();
        const { result } = renderHook(() => useDatePicker({ onChange }));
        const date = new Date('2023-01-01');

        act(() => {
            result.current.handleChange({ type: 'set', nativeEvent: {} } as any, date);
        });

        expect(result.current.date).toEqual(date);
        expect(onChange).toHaveBeenCalledWith(date);
    });
});
