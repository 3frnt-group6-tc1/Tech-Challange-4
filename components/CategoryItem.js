import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "../contexts/ThemeContext";

/**
 * CategoryItem Component
 * Displays a single category with edit and delete actions
 */
const CategoryItem = ({ category, type, onEdit, onDelete }) => {
  const { theme } = useTheme();

  return (
    <View
      style={[styles.categoryItem, { borderBottomColor: theme.colors.border }]}
    >
      <Text style={[styles.categoryName, { color: theme.colors.text }]}>
        {category}
      </Text>
      <View style={styles.categoryActions}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: theme.colors.primary },
          ]}
          onPress={() => onEdit(type, category)}
        >
          <Text style={styles.actionButtonText}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.error }]}
          onPress={() => onDelete(type, category)}
        >
          <Text style={styles.actionButtonText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  categoryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  categoryName: {
    fontSize: 16,
    flex: 1,
  },
  categoryActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  actionButtonText: {
    fontSize: 14,
  },
});

export default CategoryItem;
