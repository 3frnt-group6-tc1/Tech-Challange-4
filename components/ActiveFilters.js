import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Card } from "./Card";
import { useTheme } from "../contexts/ThemeContext";

/**
 * Active filters display component
 */
const ActiveFilters = ({ filters, onClearFilters }) => {
  const { theme } = useTheme();

  const getActiveFilterLabels = () => {
    const labels = [];

    if (filters.type !== "all") {
      labels.push(filters.type === "income" ? "Receitas" : "Despesas");
    }

    if (filters.category !== "all") {
      labels.push(filters.category);
    }

    if (filters.dateRange !== "all") {
      const dateRangeLabels = {
        today: "Hoje",
        week: "Esta semana",
        month: "Este mês",
        year: "Este ano",
      };
      labels.push(dateRangeLabels[filters.dateRange]);
    }

    if (filters.search) {
      labels.push(`Busca: "${filters.search}"`);
    }

    return labels;
  };

  const activeLabels = getActiveFilterLabels();

  if (activeLabels.length === 0) {
    return null;
  }

  return (
    <Card style={styles.activeFiltersCard}>
      <View style={styles.activeFiltersHeader}>
        <Text style={[styles.activeFiltersTitle, { color: theme.colors.text }]}>
          Filtros Ativos
        </Text>
        <TouchableOpacity onPress={onClearFilters}>
          <Text
            style={[styles.clearFiltersText, { color: theme.colors.primary }]}
          >
            Limpar
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.activeFiltersContent}>
        {activeLabels.map((label, index) => (
          <View
            key={index}
            style={[
              styles.filterChip,
              { backgroundColor: theme.colors.primary + "20" },
            ]}
          >
            <Text
              style={[styles.filterChipText, { color: theme.colors.primary }]}
            >
              {label}
            </Text>
          </View>
        ))}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  activeFiltersCard: {
    marginBottom: 12,
  },
  activeFiltersHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  activeFiltersTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  clearFiltersText: {
    fontSize: 14,
    fontWeight: "600",
  },
  activeFiltersContent: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: "500",
  },
});

export default ActiveFilters;
