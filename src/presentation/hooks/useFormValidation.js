import { useForm } from "react-hook-form";
import { useCallback, useMemo, useRef } from "react";
import { sanitizeFormData, sanitizeInput } from "../../domain/utils/inputSanitizer";

export const useFormValidation = ({
  defaultValues = {},
  validationRules = {},
  onSubmit,
  sanitizeOnChange = true,
  formOptions = {},
} = {}) => {
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    getValues,
    trigger,
    clearErrors,
    setError,
    formState: { errors, isSubmitting, isValid, isDirty, touchedFields },
  } = useForm({
    mode: "onChange", // Enable real-time validation
    defaultValues,
    ...formOptions,
  });

  // Use a ref to track the current form values without causing re-renders
  const formValuesRef = useRef({});

  // Memoize the watch function to prevent unnecessary re-renders
  const watchAllFields = useCallback(() => {
    const currentValues = getValues();
    formValuesRef.current = currentValues;
    return currentValues;
  }, [getValues]);

  const sanitizeField = useCallback(
    (fieldName, value) => {
      if (typeof value === "string") {
        const sanitized = sanitizeInput(value);
        if (sanitized !== value) {
          setValue(fieldName, sanitized, {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true,
          });
        }
      }
    },
    [setValue]
  );

  const createSanitizedChangeHandler = useCallback(
    (fieldName, originalOnChange) => {
      return (value) => {
        // Call original onChange first (only if it's a function)
        if (typeof originalOnChange === "function") {
          originalOnChange(value);
        }

        // Apply sanitization if enabled
        if (sanitizeOnChange && typeof value === "string") {
          // Use setTimeout to avoid interference with react-hook-form's internal state
          setTimeout(() => {
            sanitizeField(fieldName, value);
          }, 0);
        }
      };
    },
    [sanitizeOnChange, sanitizeField]
  );

  const getFieldProps = useCallback(
    (fieldName, validationRule = {}) => ({
      control,
      name: fieldName,
      rules: validationRules[fieldName] || validationRule,
      render: ({ field: { onChange, onBlur, value, name } }) => ({
        value,
        onBlur,
        onChange: createSanitizedChangeHandler(fieldName, onChange),
        name,
        error: errors[fieldName],
        hasError: !!errors[fieldName],
      }),
    }),
    [control, validationRules, errors, createSanitizedChangeHandler]
  );

  const sanitizeAndSubmit = useCallback(
    async (data) => {
      try {
        // Sanitize all form data
        const sanitizedData = sanitizeFormData(data);

        // Call the provided onSubmit handler
        if (onSubmit) {
          await onSubmit(sanitizedData);
        }

        return sanitizedData;
      } catch (error) {
        // Handle submission errors
        console.error("Form submission error:", error);
        throw error;
      }
    },
    [onSubmit]
  );

  const enhancedHandleSubmit = useMemo(
    () => handleSubmit(sanitizeAndSubmit),
    [handleSubmit, sanitizeAndSubmit]
  );

  const validateAllFields = useCallback(async () => {
    return await trigger();
  }, [trigger]);

  const resetForm = useCallback(
    (newDefaultValues) => {
      reset(newDefaultValues || defaultValues);
    },
    [reset, defaultValues]
  );

  const setFieldValue = useCallback(
    (fieldName, value, options = {}) => {
      const sanitizedValue =
        typeof value === "string" ? sanitizeInput(value) : value;
      setValue(fieldName, sanitizedValue, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
        ...options,
      });
    },
    [setValue]
  );

  const getSanitizedValues = useCallback(() => {
    const values = getValues();
    return sanitizeFormData(values);
  }, [getValues]);

  const getCurrentValues = useCallback(() => {
    return watchAllFields();
  }, [watchAllFields]);

  const setFieldError = useCallback(
    (fieldName, error) => {
      const errorObj = typeof error === "string" ? { message: error } : error;
      setError(fieldName, errorObj);
    },
    [setError]
  );

  const clearFieldErrors = useCallback(
    (fieldNames) => {
      if (fieldNames) {
        const fields = Array.isArray(fieldNames) ? fieldNames : [fieldNames];
        fields.forEach((field) => clearErrors(field));
      } else {
        clearErrors();
      }
    },
    [clearErrors]
  );

  const hasFieldError = useCallback(
    (fieldName) => {
      return !!(touchedFields[fieldName] && errors[fieldName]);
    },
    [touchedFields, errors]
  );

  const getFieldError = useCallback(
    (fieldName) => {
      return errors[fieldName]?.message || null;
    },
    [errors]
  );

  const canSubmit = useMemo(() => {
    const result = isValid && !isSubmitting;
    return result;
  }, [isValid, isSubmitting, errors, isDirty, touchedFields]);

  const formStats = useMemo(() => {
    // Get current field count from default values to avoid re-renders
    const totalFields = Object.keys(defaultValues).length;
    return {
      totalFields,
      errorCount: Object.keys(errors).length,
      touchedCount: Object.keys(touchedFields).length,
      isDirty,
      isValid,
      isSubmitting,
      canSubmit,
    };
  }, [
    defaultValues,
    errors,
    touchedFields,
    isDirty,
    isValid,
    isSubmitting,
    canSubmit,
  ]);

  return {
    // Core react-hook-form methods
    control,
    handleSubmit: enhancedHandleSubmit,
    resetForm,
    watch,

    // Enhanced methods
    getFieldProps,
    validateAllFields,
    setFieldValue,
    getSanitizedValues,
    getCurrentValues,
    sanitizeField,

    // Error handling
    setFieldError,
    clearFieldErrors,
    hasFieldError,
    getFieldError,

    // Form state
    errors,
    isSubmitting,
    isValid,
    isDirty,
    touchedFields,
    canSubmit,
    formStats,

    // Raw form values (use getSanitizedValues for sanitized version)
    get values() {
      return getValues();
    },
  };
};

export const useCommonForm = (formType, options = {}) => {
  // This could be extended to automatically configure forms for common patterns
  // For now, it's a wrapper that can be enhanced in the future
  return useFormValidation(options);
};

export default useFormValidation;
