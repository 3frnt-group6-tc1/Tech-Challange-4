import React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "../../../domain/contexts/ThemeContext";

export const Card = React.memo(
  ({ children, style, padding = "md", margin = "sm", testID, ...otherProps }) => {
    const { theme } = useTheme();

    const getCardStyle = () => {
      const baseStyle = {
        backgroundColor: theme.colors.card,
        padding: theme.spacing[padding],
        margin: theme.spacing[margin],
        borderRadius: theme.borderRadius.md,
        shadowColor: theme.colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
      };

      return [baseStyle, ...(Array.isArray(style) ? style : [style])].filter(
        Boolean
      );
    };

    return (
      <View style={getCardStyle()} testID={testID || "card"} {...otherProps}>
        {children}
      </View>
    );
  }
);

Card.displayName = "Card";
