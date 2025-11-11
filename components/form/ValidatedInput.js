import React from "react";
import { TextInput, View, Text, StyleSheet } from "react-native";
import { useTheme } from "../../contexts/ThemeContext";
import { sanitizeInput } from "../../utils/inputSanitizer";

/**
 * Enhanced Input component with built-in validation display and sanitization
 * Works seamlessly with useFormValidation hook
 */
export const ValidatedInput = ({
  label,
  value,
  onChangeText,
  onBlur,
  placeholder,
  secureTextEntry = false,
  keyboardType = "default",
  autoCapitalize = "sentences",
  error,
  hasError,
  multiline = false,
  numberOfLines = 1,
  style,
  inputStyle,
  labelStyle,
  errorStyle,
  sanitizeOnChange = true,
  maxLength,
  ...props
}) => {
  const { theme } = useTheme();

  // Enhanced change handler with sanitization
  const handleChangeText = (text) => {
    if (typeof onChangeText !== "function") {
      return;
    }

    if (sanitizeOnChange && typeof text === "string") {
      const sanitized = sanitizeInput(text);
      onChangeText(sanitized);
    } else {
      onChangeText(text);
    }
  };

  const containerStyle = [styles.container, style];

  const enhancedInputStyle = [
    styles.input,
    {
      backgroundColor: theme.colors.surface,
      borderColor: hasError || error ? theme.colors.error : theme.colors.border,
      color: theme.colors.text,
      borderRadius: theme.borderRadius.sm,
      padding: theme.spacing.md,
      fontSize: theme.fontSize.md,
    },
    multiline && styles.multilineInput,
    inputStyle,
  ];

  const enhancedLabelStyle = [
    styles.label,
    {
      color: theme.colors.text,
      fontSize: theme.fontSize.sm,
    },
    labelStyle,
  ];

  const enhancedErrorStyle = [
    styles.errorText,
    { color: theme.colors.error },
    errorStyle,
  ];

  return (
    <View style={containerStyle}>
      {label && <Text style={enhancedLabelStyle}>{label}</Text>}
      <TextInput
        style={enhancedInputStyle}
        value={value}
        onChangeText={handleChangeText}
        onBlur={onBlur}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textSecondary}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        multiline={multiline}
        numberOfLines={numberOfLines}
        maxLength={maxLength}
        {...props}
      />
      {(error || hasError) && (
        <Text style={enhancedErrorStyle}>
          {typeof error === "string" ? error : error?.message}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    minHeight: 48,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
});

export default ValidatedInput;
