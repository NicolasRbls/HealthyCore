// __tests__/hooks/useForm.test.ts
import { renderHook, act } from '@testing-library/react-native';
import { useForm } from '../../hooks/useForm';

// Mock React Native Alert
// __tests__/hooks/useForm.test.ts

describe('useForm hook', () => {
  it('initializes with default values', () => {
    const { result } = renderHook(() => 
      useForm({
        initialValues: { name: "", email: "" }
      })
    );
    
    expect(result.current.values).toEqual({ name: "", email: "" });
    expect(result.current.errors).toEqual({});
    expect(result.current.touched).toEqual({});
    expect(result.current.isSubmitting).toBe(false);
  });

  it('updates a field value correctly', () => {
    const { result } = renderHook(() => 
      useForm({
        initialValues: { name: "", email: "" }
      })
    );
    
    act(() => {
      result.current.handleChange('name', 'John');
    });
    
    expect(result.current.values.name).toBe('John');
  });
  
  it('validates fields on blur', () => {
    const validateFn = jest.fn((values) => {
      const errors: Record<string, string> = {};
      if (!values.name) {
        errors.name = 'Name is required';
      }
      return errors;
    });
    
    const { result } = renderHook(() => 
      useForm({
        initialValues: { name: "", email: "" },
        validate: validateFn
      })
    );
    
    act(() => {
      result.current.handleBlur('name');
    });
    
    expect(validateFn).toHaveBeenCalled();
    expect(result.current.touched.name).toBe(true);
    expect(result.current.errors.name).toBe('Name is required');
  });
  
  it('submits the form when valid', async () => {
    const onSubmitMock = jest.fn();
    const { result } = renderHook(() => 
      useForm({
        initialValues: { name: "John", email: "john@example.com" },
        onSubmit: onSubmitMock
      })
    );
    
    await act(async () => {
      await result.current.handleSubmit();
    });
    
    expect(onSubmitMock).toHaveBeenCalledWith({ 
      name: "John", 
      email: "john@example.com" 
    });
  });
});