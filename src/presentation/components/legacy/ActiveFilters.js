import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "../../../domain/contexts/ThemeContext";

const ActiveFilters = ({ filters, onClearFilter, onClearAll }) => {
  const { theme } = useTheme();

  const activeFilters = [];

  if (filters.type && filters.type !== "all") {
    activeFilters.push({
      key: "type",
      label:
        filters.type === "income"
          ? "Tipo: Receitas"
          : "Tipo: Despesas",
    });
  }

  if (filters.category && filters.category !== "all") {
    activeFilters.push({
      key: "category",
      label: `Categoria: ${filters.category}`,
    });
  }

  if (filters.dateRange?.start || filters.dateRange?.end) {
    activeFilters.push({
      key: "dateRange",
      label: "Período personalizado",
    });
  }

  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.filtersRow}>
        {activeFilters.map((filter) => (
          <View
            key={filter.key}
            style={[
              styles.filterChip,
              { backgroundColor: theme.colors.primaryLight },
            ]}
          >
            <Text
              style={[styles.filterText, { color: theme.colors.primary }]}
            >
              {filter.label}
            </Text>
            <TouchableOpacity
              onPress={() => onClearFilter(filter.key)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text
                style={[styles.closeIcon, { color: theme.colors.primary }]}
              >
                ×
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
      <TouchableOpacity onPress={onClearAll}>
        <Text style={[styles.clearAll, { color: theme.colors.primary }]}>
          Limpar todos
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  filtersRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    flex: 1,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingLeft: 12,
    paddingRight: 8,
    borderRadius: 16,
    gap: 4,
  },
  filterText: {
    fontSize: 13,
    fontWeight: "500",
  },
  closeIcon: {
    fontSize: 20,
    fontWeight: "600",
    lineHeight: 20,
  },
  clearAll: {
    fontSize: 13,
    fontWeight: "500",
    marginLeft: 8,
  },
});

export default ActiveFilters;
