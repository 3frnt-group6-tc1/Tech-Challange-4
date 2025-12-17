import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useTheme } from "../../../domain/contexts/ThemeContext";
import NativeDatePicker from "./NativeDatePicker";

const TransactionFilterModal = ({
  visible,
  onClose,
  filters,
  categories = [],
  onTypeChange,
  onCategoryChange,
  onDateRangeChange,
  onClearFilters,
}) => {
  const { theme } = useTheme();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContent,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <View
            style={[
              styles.modalHeader,
              { borderBottomColor: theme.colors.border },
            ]}
          >
            <TouchableOpacity onPress={onClose}>
              <Text
                style={[styles.headerButton, { color: theme.colors.primary }]}
              >
                Cancelar
              </Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Filtros
            </Text>
            <TouchableOpacity onPress={onClearFilters}>
              <Text
                style={[styles.headerButton, { color: theme.colors.primary }]}
              >
                Limpar
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.filterSection}>
              <Text
                style={[styles.filterLabel, { color: theme.colors.text }]}
              >
                Tipo
              </Text>
              <View style={styles.typeButtons}>
                {["all", "income", "expense"].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeButton,
                      {
                        backgroundColor:
                          filters.type === type
                            ? theme.colors.primary
                            : theme.colors.surface,
                        borderColor: theme.colors.border,
                      },
                    ]}
                    onPress={() => onTypeChange(type)}
                  >
                    <Text
                      style={[
                        styles.typeButtonText,
                        {
                          color:
                            filters.type === type
                              ? "#fff"
                              : theme.colors.text,
                        },
                      ]}
                    >
                      {type === "all"
                        ? "Todos"
                        : type === "income"
                        ? "Receitas"
                        : "Despesas"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text
                style={[styles.filterLabel, { color: theme.colors.text }]}
              >
                Categoria
              </Text>
              <View style={styles.categoryButtons}>
                <TouchableOpacity
                  style={[
                    styles.categoryButton,
                    {
                      backgroundColor:
                        filters.category === "all"
                          ? theme.colors.primary
                          : theme.colors.surface,
                      borderColor: theme.colors.border,
                    },
                  ]}
                  onPress={() => onCategoryChange("all")}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      {
                        color:
                          filters.category === "all"
                            ? "#fff"
                            : theme.colors.text,
                      },
                    ]}
                  >
                    Todas
                  </Text>
                </TouchableOpacity>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryButton,
                      {
                        backgroundColor:
                          filters.category === cat.name
                            ? theme.colors.primary
                            : theme.colors.surface,
                        borderColor: theme.colors.border,
                      },
                    ]}
                    onPress={() => onCategoryChange(cat.name)}
                  >
                    <Text
                      style={[
                        styles.categoryButtonText,
                        {
                          color:
                            filters.category === cat.name
                              ? "#fff"
                              : theme.colors.text,
                        },
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text
                style={[styles.filterLabel, { color: theme.colors.text }]}
              >
                Período
              </Text>
              <View style={styles.dateContainer}>
                <View style={styles.dateField}>
                  <Text
                    style={[
                      styles.dateLabel,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    De:
                  </Text>
                  <NativeDatePicker
                    value={filters.dateRange?.start}
                    onChange={(date) =>
                      onDateRangeChange({ ...filters.dateRange, start: date })
                    }
                    mode="date"
                  />
                </View>
                <View style={styles.dateField}>
                  <Text
                    style={[
                      styles.dateLabel,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    Até:
                  </Text>
                  <NativeDatePicker
                    value={filters.dateRange?.end}
                    onChange={(date) =>
                      onDateRangeChange({ ...filters.dateRange, end: date })
                    }
                    mode="date"
                  />
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
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
    fontWeight: "600",
  },
  headerButton: {
    fontSize: 16,
    fontWeight: "500",
  },
  modalBody: {
    padding: 16,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  typeButtons: {
    flexDirection: "row",
    gap: 8,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  categoryButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  categoryButtonText: {
    fontSize: 14,
  },
  dateContainer: {
    gap: 12,
  },
  dateField: {
    gap: 8,
  },
  dateLabel: {
    fontSize: 14,
  },
});

export default TransactionFilterModal;
