import { useForm } from "react-hook-form";
import { useCallback, useMemo, useRef } from "react";
import { sanitizeFormData, sanitizeInput } from "../utils/validationRules";

/**
 * Enhanced form validation hook that extends react-hook-form with:
 * - Automatic input sanitization
 * - Centralized validation rules
 * - Enhanced error handling
 * - Real-time validation feedback
 *
 * @param {Object} options - Configuration options
 * @param {Object} options.defaultValues - Default form values
 * @param {Object} options.validationRules - Validation rules object
 * @param {Function} options.onSubmit - Submit handler
 * @param {boolean} options.sanitizeOnChange - Whether to sanitize inputs on change
 * @param {Object} options.formOptions - Additional react-hook-form options
 * @returns {Object} Enhanced form methods and state
 */
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

  /**
   * Sanitizes a single field value and updates the form
   * @param {string} fieldName - Name of the field to sanitize
   * @param {any} value - Value to sanitize
   */
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

  /**
   * Enhanced onChange handler that includes sanitization
   * @param {string} fieldName - Name of the field
   * @param {Function} originalOnChange - Original react-hook-form onChange
   * @returns {Function} Enhanced onChange handler
   */
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

  /**
   * Enhanced Controller render prop that includes sanitization
   * @param {string} fieldName - Name of the field
   * @param {Object} validationRule - Validation rules for the field
   * @returns {Object} Controller configuration
   */
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

  /**
   * Sanitizes all form data before submission
   * @param {Object} data - Form data to sanitize
   * @returns {Object} Sanitized form data
   */
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

  /**
   * Enhanced submit handler with sanitization
   */
  const enhancedHandleSubmit = useMemo(
    () => handleSubmit(sanitizeAndSubmit),
    [handleSubmit, sanitizeAndSubmit]
  );

  /**
   * Validates a specific field
   * @param {string} fieldName - Name of the field to validate
   * @returns {Promise<boolean>} Validation result
   */
  const validateField = useCallback(
    async (fieldName) => {
      return await trigger(fieldName);
    },
    [trigger]
  );

  /**
   * Validates all fields
   * @returns {Promise<boolean>} Validation result
   */
  const validateAllFields = useCallback(async () => {
    return await trigger();
  }, [trigger]);

  /**
   * Resets the form with optional new default values
   * @param {Object} newDefaultValues - New default values
   */
  const resetForm = useCallback(
    (newDefaultValues) => {
      reset(newDefaultValues);
    },
    [reset]
  );

  /**
   * Sets a field value with automatic sanitization
   * @param {string} fieldName - Name of the field
   * @param {any} value - Value to set
   * @param {Object} options - Additional options
   */
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

  /**
   * Gets sanitized form values
   * @returns {Object} Sanitized form values
   */
  const getSanitizedValues = useCallback(() => {
    const values = getValues();
    return sanitizeFormData(values);
  }, [getValues]);

  /**
   * Gets current form values without causing re-renders
   * @returns {Object} Current form values
   */
  const getCurrentValues = useCallback(() => {
    return watchAllFields();
  }, [watchAllFields]);

  /**
   * Manually sets an error for a field
   * @param {string} fieldName - Name of the field
   * @param {string|Object} error - Error message or error object
   */
  const setFieldError = useCallback(
    (fieldName, error) => {
      const errorObj = typeof error === "string" ? { message: error } : error;
      setError(fieldName, errorObj);
    },
    [setError]
  );

  /**
   * Clears errors for specific fields or all fields
   * @param {string|Array<string>} fieldNames - Field names to clear errors for
   */
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

  /**
   * Checks if a field has been touched and has errors
   * @param {string} fieldName - Name of the field
   * @returns {boolean} True if field has validation errors and was touched
   */
  const hasFieldError = useCallback(
    (fieldName) => {
      return !!(touchedFields[fieldName] && errors[fieldName]);
    },
    [touchedFields, errors]
  );

  /**
   * Gets the error message for a field
   * @param {string} fieldName - Name of the field
   * @returns {string|null} Error message or null
   */
  const getFieldError = useCallback(
    (fieldName) => {
      return errors[fieldName]?.message || null;
    },
    [errors]
  );

  /**
   * Checks if the form is ready to submit (valid and not submitting)
   * @returns {boolean} True if form can be submitted
   */
  const canSubmit = useMemo(() => {
    const result = isValid && !isSubmitting;
    return result;
  }, [isValid, isSubmitting, errors, isDirty, touchedFields]);

  /**
   * Gets form statistics
   * @returns {Object} Form statistics
   */
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
    validateField,
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

/**
 * Simplified hook for common form patterns
 * @param {string} formType - Type of form ('login', 'register', 'transaction', etc.)
 * @param {Object} options - Additional options
 * @returns {Object} Form methods and state
 */
export const useCommonForm = (formType, options = {}) => {
  // This could be extended to automatically configure forms for common patterns
  // For now, it's a wrapper that can be enhanced in the future
  return useFormValidation(options);
};

export default useFormValidation;
