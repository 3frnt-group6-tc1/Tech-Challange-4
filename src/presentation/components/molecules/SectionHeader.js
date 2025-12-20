import React, { memo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

/**
 * Section Header component for category/list sections
 * Reduces duplication across screens with add buttons and titles
 * @component
 * @param {Object} props
 * @param {string} props.title - Título da seção
 * @param {string} [props.icon] - Ícone/emoji do título
 * @param {Function} [props.onAdd] - Callback do botão adicionar
 * @param {string} [props.addButtonColor] - Cor do botão adicionar
 * @param {Object} props.theme - Objeto de tema
 */
export const SectionHeader = memo(({ title, icon, onAdd, addButtonColor, theme }) => {
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.colors.text }]}>
        {icon} {title}
      </Text>
      {onAdd && (
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: addButtonColor }]}
          onPress={onAdd}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      )}
    </View>
  );
});

SectionHeader.displayName = "SectionHeader";

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
});
