import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Controller } from "react-hook-form";
import { useTheme } from "../../contexts/ThemeContext";
import NativeDatePicker from "../NativeDatePicker";

/**
 * Date picker field component for transaction forms
 * Handles date and time selection with validation
 */
const DateField = ({
  control,
  validationRules,
  mode = "datetime",
  placeholder = "Selecionar data e horário",
}) => {
  const { theme } = useTheme();

  return (
    <View style={styles.fieldContainer}>
      <Text style={[styles.label, { color: theme.colors.text }]}>
        Data e Horário *
      </Text>
      <Controller
        control={control}
        name="date"
        rules={validationRules.date}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <>
            <NativeDatePicker
              value={value ? new Date(value) : null}
              onChange={(selectedDate) => {
                if (selectedDate) {
                  onChange(selectedDate.toISOString().split("T")[0]);
                }
              }}
              mode={mode}
              placeholder={placeholder}
              error={!!error}
            />
            {error && <Text style={styles.errorText}>{error.message}</Text>}
          </>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  errorText: {
    color: "#ff4444",
    fontSize: 12,
    marginTop: 4,
  },
});

export default DateField;
