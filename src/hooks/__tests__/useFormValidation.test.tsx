import { renderHook, act } from '@testing-library/react';
import { useFormValidation } from '../../hooks/useFormValidation';

type FormShape = { name: string; email: string };

const rules = {
  name: (v: string) => (!v ? 'required' : ''),
  email: (v: string) => (!v || v.indexOf('@') === -1 ? 'bad' : ''),
};

describe('useFormValidation', () => {
  it('validates email and name correctly', () => {
    const { result } = renderHook(() => useFormValidation<FormShape>(rules));
    expect(result.current.validateEmail('a@b.com')).toBe(true);
    expect(result.current.validateEmail('bad')).toBe(false);
    expect(result.current.validateName('Juan Perez')).toBe(true);
    expect(result.current.validateName('x')).toBe(false);
  });

  it('validateAllFields sets errors and returns false when invalid', () => {
    const { result } = renderHook(() => useFormValidation<FormShape>(rules));
    act(() => {
      const ok = result.current.validateAllFields({ name: '', email: 'nope' });
      expect(ok).toBe(false);
    });
    expect(result.current.hasErrors()).toBe(true);
  });

  it('setFieldError and clearFieldError work', () => {
    const { result } = renderHook(() => useFormValidation<FormShape>(rules));
    act(() => result.current.setFieldError('name', 'oops'));
    expect(result.current.getFieldError('name')).toBe('oops');
    act(() => result.current.clearFieldError('name'));
    expect(result.current.getFieldError('name')).toBe('');
  });

  it('clearAllErrors removes all', () => {
    const { result } = renderHook(() => useFormValidation<FormShape>(rules));
    act(() => {
      result.current.setFieldError('name', 'err');
      result.current.setFieldError('email', 'err2');
    });
    act(() => result.current.clearAllErrors());
    expect(result.current.hasErrors()).toBe(false);
  });

  it('validateField uses custom validator', () => {
    const { result } = renderHook(() => useFormValidation<FormShape>(rules));
    expect(result.current.validateField('email', 'a@b.com')).toBe('');
    expect(result.current.validateField('email', 'bad')).toBe('bad');
  });
});
