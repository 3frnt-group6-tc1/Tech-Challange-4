import React from "react";
import { View, StyleSheet } from "react-native";

/**
 * List container with consistent padding and spacing
 * Reduces duplication of list rendering logic
 */
export const ListContainer = ({ children, style }) => {
  return <View style={[styles.container, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
