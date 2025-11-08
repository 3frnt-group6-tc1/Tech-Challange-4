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
}) => {
  const placeholder = `Digite o valor (ex: ${currency.symbol} 100,50)`;

  return (
    <Controller
      control={control}
      name="amount"
      rules={validationRules.amount}
      render={({
        field: { onChange, onBlur, value },
        fieldState: { error },
      }) => (
        <ValidatedInput
          label="Valor *"
          placeholder={placeholder}
          value={value ? formatCurrencyInput(value) : ""}
          onChangeText={(text) => {
            const numericValue = text.replace(/\D/g, "");
            onChange(numericValue);
          }}
          onBlur={onBlur}
          keyboardType="numeric"
          error={error?.message}
          hasError={!!error}
          sanitizeOnChange={false} // We handle currency formatting manually
        />
      )}
    />
  );
};

export default AmountField;
