import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Controller } from "react-hook-form";
import { useTheme } from "../../contexts/ThemeContext";

/**
 * Category selector field component for transaction forms
 * Displays available categories as selectable buttons
 */
const CategoryField = ({
  control,
  validationRules,
  availableCategories = [],
}) => {
  const { theme } = useTheme();

  return (
    <View style={styles.fieldContainer}>
      <Text style={[styles.label, { color: theme.colors.text }]}>
        Categoria *
      </Text>
      <Controller
        control={control}
        name="category"
        rules={validationRules.category}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <>
            <View style={styles.categoryContainer}>
              {availableCategories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryButton,
                    {
                      backgroundColor:
                        value === cat
                          ? theme.colors.primary
                          : theme.colors.background,
                      borderColor: theme.colors.border,
                    },
                  ]}
                  onPress={() => onChange(cat)}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      {
                        color: value === cat ? "#ffffff" : theme.colors.text,
                      },
                    ]}
                  >
                    {cat}
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
    marginBottom: 4,
  },
  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "500",
  },
  errorText: {
    color: "#ff4444",
    fontSize: 12,
    marginTop: 4,
  },
});

export default CategoryField;
