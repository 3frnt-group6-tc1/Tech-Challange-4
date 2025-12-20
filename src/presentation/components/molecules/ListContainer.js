import React, { memo } from "react";
import { View, StyleSheet } from "react-native";

/**
 * List container with consistent padding and spacing
 * Reduces duplication of list rendering logic
 * @component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Conteúdo da lista
 * @param {Object} [props.style] - Estilos adicionais
 */
export const ListContainer = memo(({ children, style }) => {
  return <View style={[styles.container, style]}>{children}</View>;
});

ListContainer.displayName = "ListContainer";

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
