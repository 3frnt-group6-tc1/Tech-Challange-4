import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Controller } from "react-hook-form";
import { useTheme } from "../../contexts/ThemeContext";

/**
 * Frequency selector field component for recurring transaction forms
 * Displays available frequencies as selectable buttons
 */
const FrequencyField = ({
  control,
  validationRules,
  options = [],
  name = "frequency",
  label = "Frequência *",
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
            <View style={styles.frequencyContainer}>
              {options.map((freq) => (
                <TouchableOpacity
                  key={freq.value}
                  style={[
                    styles.frequencyButton,
                    {
                      backgroundColor:
                        value === freq.value
                          ? theme.colors.primary
                          : theme.colors.background,
                      borderColor: theme.colors.border,
                    },
                  ]}
                  onPress={() => onChange(freq.value)}
                >
                  <Text
                    style={[
                      styles.frequencyText,
                      {
                        color:
                          value === freq.value ? "#ffffff" : theme.colors.text,
                      },
                    ]}
                  >
                    {freq.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
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
    marginBottom: 8,
  },
  frequencyContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  frequencyButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    minWidth: 80,
    alignItems: "center",
  },
  frequencyText: {
    fontSize: 14,
    fontWeight: "500",
  },
  errorText: {
    color: "#ff4444",
    fontSize: 12,
    marginTop: 4,
  },
});

export default FrequencyField;
