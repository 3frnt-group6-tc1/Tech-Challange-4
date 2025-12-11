import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Controller } from "react-hook-form";
import { useTheme } from "../../../../domain/contexts/ThemeContext";

/**
 * Generic button selector field component
 * Reusable for categories, frequencies, and other button-based selections
 */
const SelectButtonField = ({
  control,
  validationRules,
  options = [],
  name,
  label,
  getOptionKey = (option) => option,
  getOptionValue = (option) => option,
  getOptionLabel = (option) => option,
}) => {
  const { theme } = useTheme();

  const fieldRules = validationRules && validationRules[name];

  return (
    <View style={styles.fieldContainer}>
      <Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text>
      <Controller
        control={control}
        name={name}
        rules={fieldRules}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <>
            <View style={styles.buttonContainer}>
              {options.map((option) => {
                const optionValue = getOptionValue(option);
                const isSelected = value === optionValue;
                
                return (
                  <TouchableOpacity
                    key={getOptionKey(option)}
                    style={[
                      styles.button,
                      {
                        backgroundColor: isSelected
                          ? theme.colors.primary
                          : theme.colors.background,
                        borderColor: theme.colors.border,
                      },
                    ]}
                    onPress={() => onChange(optionValue)}
                  >
                    <Text
                      style={[
                        styles.buttonText,
                        {
                          color: isSelected ? "#ffffff" : theme.colors.text,
                        },
                      ]}
                    >
                      {getOptionLabel(option)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {error && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {error.message}
              </Text>
            )}
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
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
});

export default SelectButtonField;
