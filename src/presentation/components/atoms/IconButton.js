import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { useTheme } from "../../../domain/contexts/ThemeContext";

export const IconButton = React.memo(
  ({
    icon,
    onPress,
    variant = "primary",
    size = "md",
    disabled = false,
    style,
    testID,
  }) => {
    const { theme } = useTheme();

    const getSizeStyle = () => {
      const sizes = {
        sm: { width: 32, height: 32, fontSize: 16 },
        md: { width: 40, height: 40, fontSize: 20 },
        lg: { width: 48, height: 48, fontSize: 24 },
      };

      return sizes[size];
    };

    const getVariantColors = () => {
      const variants = {
        primary: {
          backgroundColor: theme.colors.primary + "20",
          color: theme.colors.primary,
        },
        secondary: {
          backgroundColor: theme.colors.surface,
          color: theme.colors.textSecondary,
        },
        danger: {
          backgroundColor: theme.colors.error + "20",
          color: theme.colors.error,
        },
        success: {
          backgroundColor: theme.colors.success + "20",
          color: theme.colors.success,
        },
      };

      return variants[variant] || variants.primary;
    };

    /**
     * Computes button styles
     */
    const getButtonStyle = () => {
      const sizeStyle = getSizeStyle();
      const variantColors = getVariantColors();

      return [
        styles.button,
        {
          width: sizeStyle.width,
          height: sizeStyle.height,
          backgroundColor: variantColors.backgroundColor,
          borderRadius: theme.borderRadius.sm,
        },
        disabled && { opacity: 0.6 },
        style,
      ];
    };

    /**
     * Computes icon text styles
     */
    const getIconStyle = () => {
      const sizeStyle = getSizeStyle();
      const variantColors = getVariantColors();

      return {
        fontSize: sizeStyle.fontSize,
        color: variantColors.color,
      };
    };

    return (
      <TouchableOpacity
        style={getButtonStyle()}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
        testID={testID || `icon-button-${variant}`}
      >
        <Text style={getIconStyle()}>{icon}</Text>
      </TouchableOpacity>
    );
  }
);

IconButton.displayName = "IconButton";

const styles = StyleSheet.create({
  button: {
    justifyContent: "center",
    alignItems: "center",
  },
});
