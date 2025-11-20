import React from "react";
import { Controller } from "react-hook-form";
import ValidatedInput from "./ValidatedInput";

/**
 * Amount field component for transaction forms
 * Handles currency input with formatting and validation
 */
const AmountField = ({
  control,
  validationRules,
  formatCurrencyInput,
  currency,
  name = "amount",
  label = "Valor *",
  placeholder,
}) => {
  const defaultPlaceholder = `Digite o valor (ex: ${currency.symbol} 100,50)`;
  const fieldPlaceholder = placeholder || defaultPlaceholder;

  const fieldRules = validationRules && validationRules[name];

  return (
    <Controller
      control={control}
      name={name}
      rules={fieldRules}
      render={({
        field: { onChange, onBlur, value },
        fieldState: { error },
      }) => {
        const handleChangeText = (text) => {
          const numericValue = text.replace(/\D/g, "");
          onChange(numericValue);
        };

        const formattedValue = value ? formatCurrencyInput(value) : "";

        return (
          <ValidatedInput
            label={label}
            placeholder={fieldPlaceholder}
            value={formattedValue}
            onChangeText={handleChangeText}
            onBlur={onBlur}
            keyboardType="numeric"
            error={error?.message}
            hasError={!!error}
            sanitizeOnChange={false}
          />
        );
      }}
    />
  );
};

export default AmountField;
