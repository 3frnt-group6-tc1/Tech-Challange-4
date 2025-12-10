import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Card } from "../atoms";
import { useTheme } from "../../../domain/contexts/ThemeContext";

export const FilterChip = React.memo(
  ({ label, selected = false, onPress, testID }) => {
    const { theme } = useTheme();

    const chipStyle = [
      styles.chip,
      {
        backgroundColor: selected
          ? theme.colors.primary
          : theme.colors.surface,
        borderColor: selected ? theme.colors.primary : theme.colors.border,
      },
    ];

    const textStyle = [
      styles.chipText,
      {
        color: selected ? "#FFFFFF" : theme.colors.text,
      },
    ];

    return (
      <TouchableOpacity
        style={chipStyle}
        onPress={onPress}
        activeOpacity={0.8}
        testID={testID || `filter-chip-${label}`}
      >
        <Text style={textStyle}>{label}</Text>
      </TouchableOpacity>
    );
  }
);

FilterChip.displayName = "FilterChip";

export const FilterGroup = React.memo(
  ({ title, options = [], selectedValue, onSelect }) => {
    const { theme } = useTheme();

    return (
      <Card padding="md" margin="sm">
        <Text style={[styles.groupTitle, { color: theme.colors.text }]}>
          {title}
        </Text>
        <View style={styles.filterOptions}>
          {options.map((option) => (
            <FilterChip
              key={option.value}
              label={option.label}
              selected={selectedValue === option.value}
              onPress={() => onSelect(option.value)}
            />
          ))}
        </View>
      </Card>
    );
  }
);

FilterGroup.displayName = "FilterGroup";

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: {
    fontSize: 14,
    fontWeight: "600",
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
});
