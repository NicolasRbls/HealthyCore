import { renderHook, act } from '@testing-library/react-native';
import { useForm } from '../../hooks/useForm';

describe('useForm', () => {
  const initialValues = { email: '', password: '' };
  const mockValidate = jest.fn((values) => {
    const errors: any = {};
    if (!values.email) errors.email = 'Required';
    return errors;
  });
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with default values', () => {
    const { result } = renderHook(() =>
      useForm({ initialValues })
    );

    expect(result.current.values).toEqual(initialValues);
    expect(result.current.errors).toEqual({});
    expect(result.current.touched).toEqual({});
  });

  it('updates values on change', () => {
    const { result } = renderHook(() =>
      useForm({ initialValues })
    );

    act(() => {
      result.current.handleChange('email', 'test@example.com');
    });

    expect(result.current.values.email).toBe('test@example.com');
  });

  it('validates on blur', () => {
    const { result } = renderHook(() =>
      useForm({ initialValues, validate: mockValidate })
    );

    act(() => {
      result.current.handleBlur('email');
    });

    expect(result.current.touched.email).toBe(true);
    expect(result.current.errors.email).toBe('Required');
  });

  it('submits form when valid', async () => {
    const { result } = renderHook(() =>
      useForm({ initialValues, validate: mockValidate, onSubmit: mockOnSubmit })
    );

    act(() => {
      result.current.handleChange('email', 'test@example.com');
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(mockOnSubmit).toHaveBeenCalledWith({ email: 'test@example.com', password: '' });
  });

  it('does not submit when invalid', async () => {
    const { result } = renderHook(() =>
      useForm({ initialValues, validate: mockValidate, onSubmit: mockOnSubmit })
    );

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
    expect(result.current.errors.email).toBe('Required');
  });

  it('resets form', () => {
    const { result } = renderHook(() =>
      useForm({ initialValues })
    );

    act(() => {
      result.current.handleChange('email', 'changed');
      result.current.resetForm();
    });

    expect(result.current.values).toEqual(initialValues);
  });
});