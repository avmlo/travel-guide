import { useState, useCallback } from 'react';
import { z, ZodSchema } from 'zod';
import { validateFormData } from '@/lib/validation';

interface UseFormValidationOptions<T> {
  schema: ZodSchema<T>;
  initialValues: T;
  onSubmit?: (data: T) => void | Promise<void>;
}

interface FormState<T> {
  values: T;
  errors: Record<string, string[]>;
  isSubmitting: boolean;
  isValid: boolean;
}

export function useFormValidation<T extends Record<string, any>>({
  schema,
  initialValues,
  onSubmit,
}: UseFormValidationOptions<T>) {
  const [state, setState] = useState<FormState<T>>({
    values: initialValues,
    errors: {},
    isSubmitting: false,
    isValid: false,
  });

  const validate = useCallback((values: T) => {
    const result = validateFormData(schema, values);
    setState(prev => ({
      ...prev,
      errors: result.errors || {},
      isValid: result.success,
    }));
    return result.success;
  }, [schema]);

  const setValue = useCallback((field: keyof T, value: any) => {
    const newValues = { ...state.values, [field]: value };
    setState(prev => ({ ...prev, values: newValues }));
    validate(newValues);
  }, [state.values, validate]);

  const setValues = useCallback((values: Partial<T>) => {
    const newValues = { ...state.values, ...values };
    setState(prev => ({ ...prev, values: newValues }));
    validate(newValues);
  }, [state.values, validate]);

  const setError = useCallback((field: keyof T, message: string) => {
    setState(prev => ({
      ...prev,
      errors: {
        ...prev.errors,
        [field as string]: [message],
      },
    }));
  }, []);

  const clearErrors = useCallback(() => {
    setState(prev => ({ ...prev, errors: {} }));
  }, []);

  const clearError = useCallback((field: keyof T) => {
    setState(prev => {
      const newErrors = { ...prev.errors };
      delete newErrors[field as string];
      return { ...prev, errors: newErrors };
    });
  }, []);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!validate(state.values)) {
      return;
    }

    if (!onSubmit) {
      return;
    }

    setState(prev => ({ ...prev, isSubmitting: true }));
    
    try {
      await onSubmit(state.values);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }));
    }
  }, [state.values, validate, onSubmit]);

  const reset = useCallback(() => {
    setState({
      values: initialValues,
      errors: {},
      isSubmitting: false,
      isValid: false,
    });
  }, [initialValues]);

  return {
    values: state.values,
    errors: state.errors,
    isSubmitting: state.isSubmitting,
    isValid: state.isValid,
    setValue,
    setValues,
    setError,
    clearErrors,
    clearError,
    handleSubmit,
    reset,
    validate: () => validate(state.values),
  };
}