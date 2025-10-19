import React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "../contexts/ThemeContext";

export const Card = ({
  children,
  style,
  padding = "md",
  margin = "sm",
  ...otherProps
}) => {
  const { theme } = useTheme();

  const cardStyle = [
    styles.card,
    {
      backgroundColor: theme.colors.card,
      padding: theme.spacing[padding],
      margin: theme.spacing[margin],
      borderRadius: theme.borderRadius.md,
      shadowColor: theme.colors.shadow,
    },
    ...(Array.isArray(style) ? style : [style]),
  ].filter(Boolean);

  return (
    <View style={cardStyle} {...otherProps}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
});
