import React from "react";
import { Controller } from "react-hook-form";
import ValidatedInput from "./ValidatedInput";

/**
 * Title field component for transaction forms
 * Handles title input with validation and character limits
 */
const TitleField = ({
  control,
  validationRules,
  placeholder = "Digite o título",
  maxLength = 100,
}) => {
  return (
    <Controller
      control={control}
      name="title"
      rules={validationRules.title}
      render={({
        field: { onChange, onBlur, value },
        fieldState: { error },
      }) => (
        <ValidatedInput
          label="Título *"
          placeholder={placeholder}
          value={value}
          onChangeText={onChange}
          onBlur={onBlur}
          error={error?.message}
          hasError={!!error}
          maxLength={maxLength}
        />
      )}
    />
  );
};

export default TitleField;
