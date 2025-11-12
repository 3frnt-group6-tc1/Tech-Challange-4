import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from "react-native";
import { Card } from "./Card";
import { Button } from "./Button";
import { useTheme } from "../contexts/ThemeContext";

/**
 * Filter modal component for transaction filtering
 */
const TransactionFilterModal = ({
  visible,
  onClose,
  filters,
  categories,
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
      presentationStyle="pageSheet"
    >
      <View
        style={[
          styles.modalContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <View
          style={[
            styles.modalHeader,
            { borderBottomColor: theme.colors.border },
          ]}
        >
          <TouchableOpacity onPress={onClose}>
            <Text style={[styles.modalButton, { color: theme.colors.primary }]}>
              Cancelar
            </Text>
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
            Filtros
          </Text>
          <TouchableOpacity onPress={onClearFilters}>
            <Text style={[styles.modalButton, { color: theme.colors.primary }]}>
              Limpar
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          {/* Type Filter */}
          <Card style={styles.filterSection}>
            <Text style={[styles.filterTitle, { color: theme.colors.text }]}>
              Tipo de Transação
            </Text>
            <View style={styles.filterOptions}>
              {[
                { value: "all", label: "Todas" },
                { value: "income", label: "Receitas" },
                { value: "expense", label: "Despesas" },
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.filterOption,
                    {
                      backgroundColor:
                        filters.type === option.value
                          ? theme.colors.primary
                          : theme.colors.surface,
                      borderColor: theme.colors.border,
                    },
                  ]}
                  onPress={() => onTypeChange(option.value)}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      {
                        color:
                          filters.type === option.value
                            ? "white"
                            : theme.colors.text,
                      },
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          {/* Category Filter */}
          <Card style={styles.filterSection}>
            <Text style={[styles.filterTitle, { color: theme.colors.text }]}>
              Categoria
            </Text>
            <View style={styles.filterOptions}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.filterOption,
                    {
                      backgroundColor:
                        filters.category === category
                          ? theme.colors.primary
                          : theme.colors.surface,
                      borderColor: theme.colors.border,
                    },
                  ]}
                  onPress={() => onCategoryChange(category)}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      {
                        color:
                          filters.category === category
                            ? "white"
                            : theme.colors.text,
                      },
                    ]}
                  >
                    {category === "all" ? "Todas" : category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          {/* Date Range Filter */}
          <Card style={styles.filterSection}>
            <Text style={[styles.filterTitle, { color: theme.colors.text }]}>
              Período
            </Text>
            <View style={styles.filterOptions}>
              {[
                { value: "all", label: "Todos" },
                { value: "today", label: "Hoje" },
                { value: "week", label: "Esta semana" },
                { value: "month", label: "Este mês" },
                { value: "year", label: "Este ano" },
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.filterOption,
                    {
                      backgroundColor:
                        filters.dateRange === option.value
                          ? theme.colors.primary
                          : theme.colors.surface,
                      borderColor: theme.colors.border,
                    },
                  ]}
                  onPress={() => onDateRangeChange(option.value)}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      {
                        color:
                          filters.dateRange === option.value
                            ? "white"
                            : theme.colors.text,
                      },
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>
        </ScrollView>

        <View
          style={[styles.modalFooter, { borderTopColor: theme.colors.border }]}
        >
          <Button
            title="Aplicar Filtros"
            onPress={onClose}
            style={styles.applyButton}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  modalButton: {
    fontSize: 16,
    fontWeight: "600",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filterOption: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterOptionText: {
    fontSize: 14,
    fontWeight: "500",
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
  },
  applyButton: {
    width: "100%",
  },
});

export default TransactionFilterModal;
