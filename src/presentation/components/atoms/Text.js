import React from "react";
import { Text as RNText, StyleSheet } from "react-native";
import { useTheme } from "../../../domain/contexts/ThemeContext";

export const ThemedText = React.memo(
  ({
    children,
    variant = "body",
    color = "text",
    weight = "normal",
    align = "left",
    style,
    testID,
    ...props
  }) => {
    const { theme } = useTheme();

    const getVariantStyle = () => {
      const variants = {
        h1: { fontSize: theme.fontSize.xl, fontWeight: "bold" },
        h2: { fontSize: theme.fontSize.lg, fontWeight: "bold" },
        h3: { fontSize: theme.fontSize.md, fontWeight: "600" },
        body: { fontSize: theme.fontSize.md },
        caption: { fontSize: theme.fontSize.sm },
        label: { fontSize: theme.fontSize.sm, fontWeight: "600" },
      };

      return variants[variant] || variants.body;
    };

    const getWeightStyle = () => {
      const weights = {
        normal: "normal",
        medium: "500",
        semibold: "600",
        bold: "bold",
      };

      return { fontWeight: weights[weight] };
    };

    /**
     * Computes text styles based on props and theme
     */
    const getTextStyle = () => {
      return [
        getVariantStyle(),
        getWeightStyle(),
        { color: theme.colors[color] || color },
        { textAlign: align },
        style,
      ];
    };

    return (
      <RNText style={getTextStyle()} testID={testID} {...props}>
        {children}
      </RNText>
    );
  }
);

ThemedText.displayName = "ThemedText";
