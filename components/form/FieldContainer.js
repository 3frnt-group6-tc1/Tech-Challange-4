import React from "react";
import { View, StyleSheet } from "react-native";

/**
 * Field container component for consistent form field spacing
 * Provides uniform styling for all form fields
 */
const FieldContainer = ({ children, style, ...props }) => {
  return (
    <View style={[styles.container, style]} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
});

export default FieldContainer;
