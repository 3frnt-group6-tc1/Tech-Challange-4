import React from "react";
import { TextInput, View, Text, StyleSheet } from "react-native";
import { useTheme } from "../../../domain/contexts/ThemeContext";

export const Input = React.memo(
  ({
    label,
    value,
    onChangeText,
    placeholder,
    secureTextEntry = false,
    keyboardType = "default",
    autoCapitalize = "sentences",
    error,
    multiline = false,
    numberOfLines = 1,
    maxLength,
    style,
    containerStyle,
    testID,
    ...props
  }) => {
    const { theme } = useTheme();

    const getInputStyle = () => {
      const baseStyle = {
        backgroundColor: theme.colors.surface,
        borderColor: error ? theme.colors.error : theme.colors.border,
        color: theme.colors.text,
        borderRadius: theme.borderRadius.sm,
        padding: theme.spacing.md,
        fontSize: theme.fontSize.md,
        borderWidth: 1,
        minHeight: multiline ? 80 : 48,
      };

      return [baseStyle, style];
    };

    const getLabelStyle = () => {
      return {
        color: theme.colors.text,
        fontSize: theme.fontSize.sm,
        fontWeight: "600",
        marginBottom: 8,
      };
    };

    /**
     * Computes error text styles based on theme
     */
    const getErrorStyle = () => {
      return {
        color: theme.colors.error,
        fontSize: 12,
        marginTop: 4,
      };
    };

    return (
      <View style={[styles.container, containerStyle]}>
        {label && <Text style={getLabelStyle()}>{label}</Text>}
        <TextInput
          style={getInputStyle()}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textSecondary}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
          maxLength={maxLength}
          testID={testID || `input-${label?.toLowerCase().replace(/\s+/g, "-")}`}
          {...props}
        />
        {error && <Text style={getErrorStyle()}>{error}</Text>}
      </View>
    );
  }
);

Input.displayName = "Input";

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
});
