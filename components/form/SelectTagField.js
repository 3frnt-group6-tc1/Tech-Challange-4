import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Controller } from "react-hook-form";
import { useTheme } from "../../contexts/ThemeContext";

/**
 * Tag selector field component for transaction forms
 * Displays available tags as selectable buttons
 */
const SelectTagField = ({
  control,
  validationRules,
  options = [],
  name = "category",
  label = "Categoria *",
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
            <View style={styles.tagContainer}>
              {options.map((tag) => (
                <TouchableOpacity
                  key={tag}
                  style={[
                    styles.tagButton,
                    {
                      backgroundColor:
                        value === tag
                          ? theme.colors.primary
                          : theme.colors.background,
                      borderColor: theme.colors.border,
                    },
                  ]}
                  onPress={() => onChange(tag)}
                >
                  <Text
                    style={[
                      styles.tagText,
                      {
                        color: value === tag ? "#ffffff" : theme.colors.text,
                      },
                    ]}
                  >
                    {tag}
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
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tagButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 12,
    fontWeight: "500",
  },
  errorText: {
    color: "#ff4444",
    fontSize: 12,
    marginTop: 4,
  },
});

export default SelectTagField;
