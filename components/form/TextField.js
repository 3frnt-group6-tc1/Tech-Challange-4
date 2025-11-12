import React from "react";
import { Controller } from "react-hook-form";
import ValidatedInput from "./ValidatedInput";

/**
 * Unified text field component for transaction forms
 * Handles both single-line and multiline text input with validation and character limits
 */
const TextField = ({
  control,
  validationRules,
  name,
  label,
  placeholder,
  multiline = false,
  numberOfLines = 1,
  maxLength = 100,
  secureTextEntry = false,
  keyboardType = "default",
  autoCapitalize = "sentences",
  ...props
}) => {
  // Get validation rules for the specific field
  const fieldRules = validationRules && validationRules[name];

  return (
    <Controller
      control={control}
      name={name}
      rules={fieldRules}
      render={({
        field: { onChange, onBlur, value },
        fieldState: { error },
      }) => (
        <ValidatedInput
          label={label}
          placeholder={placeholder}
          value={value}
          onChangeText={onChange}
          onBlur={onBlur}
          error={error?.message}
          hasError={!!error}
          multiline={multiline}
          numberOfLines={numberOfLines}
          maxLength={maxLength}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          {...props}
        />
      )}
    />
  );
};

export default TextField;
