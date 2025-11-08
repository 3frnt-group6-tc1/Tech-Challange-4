import React from "react";
import { Controller } from "react-hook-form";
import ValidatedInput from "./ValidatedInput";

/**
 * Description field component for transaction forms
 * Handles multiline text input with validation and character limits
 */
const DescriptionField = ({
  control,
  validationRules,
  placeholder = "Digite a descrição (mín. 3 caracteres)",
  numberOfLines = 3,
  maxLength = 500,
}) => {
  return (
    <Controller
      control={control}
      name="description"
      rules={validationRules.description}
      render={({
        field: { onChange, onBlur, value },
        fieldState: { error },
      }) => (
        <ValidatedInput
          label="Descrição *"
          placeholder={placeholder}
          value={value}
          onChangeText={onChange}
          onBlur={onBlur}
          error={error?.message}
          hasError={!!error}
          multiline
          numberOfLines={numberOfLines}
          maxLength={maxLength}
        />
      )}
    />
  );
};

export default DescriptionField;
