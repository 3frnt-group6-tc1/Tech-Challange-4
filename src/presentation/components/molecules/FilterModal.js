import React from "react";
import { View, Text, StyleSheet, Modal, ScrollView } from "react-native";
import { Card } from "../atoms";
import { FilterGroup } from "./FilterGroup";
import { FormActions } from "./FormActions";
import { useTheme } from "../../../domain/contexts/ThemeContext";

export const ModalHeader = React.memo(
  ({ title, onClose, onClear }) => {
    const { theme } = useTheme();

    return (
      <View
        style={[
          styles.modalHeader,
          { borderBottomColor: theme.colors.border },
        ]}
      >
        <Text
          style={[styles.headerButton, { color: theme.colors.primary }]}
          onPress={onClose}
        >
          Cancelar
        </Text>
        <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
          {title}
        </Text>
        <Text
          style={[styles.headerButton, { color: theme.colors.primary }]}
          onPress={onClear}
        >
          Limpar
        </Text>
      </View>
    );
  }
);

ModalHeader.displayName = "ModalHeader";

export const FilterModal = React.memo(
  ({
    visible,
    onClose,
    filterGroups = [],
    onFilterChange,
    onClearFilters,
    title = "Filtros",
  }) => {
    const { theme } = useTheme();

    return (
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: theme.colors.background },
          ]}
        >
          <ModalHeader
            title={title}
            onClose={onClose}
            onClear={onClearFilters}
          />

          <ScrollView style={styles.modalContent}>
            {filterGroups.map((group, index) => (
              <FilterGroup
                key={group.id || index}
                title={group.title}
                options={group.options}
                selectedValue={group.selectedValue}
                onSelect={(value) => onFilterChange(group.filterKey, value)}
              />
            ))}
          </ScrollView>
        </View>
      </Modal>
    );
  }
);

FilterModal.displayName = "FilterModal";

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  headerButton: {
    fontSize: 16,
    fontWeight: "600",
  },
  modalContent: {
    flex: 1,
  },
});
