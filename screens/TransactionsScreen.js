import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  FlatList,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../contexts/ThemeContext";
import { useTransactions } from "../contexts/TransactionsContext";
import { useCurrency } from "../contexts/CurrencyContext";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import UnifiedTransactionModal from "../components/UnifiedTransactionModal";
import ImagePreviewModal from "../components/ImagePreviewModal";
import { formatDate } from "../utils/dateFormatter";

const TransactionsScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { transactions, updateTransaction, deleteTransaction } =
    useTransactions();
  const { formatCurrency } = useCurrency();
  const [refreshing, setRefreshing] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  // Estados para preview de imagem
  const [imagePreviewVisible, setImagePreviewVisible] = useState(false);
  const [imagePreviewUri, setImagePreviewUri] = useState(null);

  const [filters, setFilters] = useState({
    type: "all",
    category: "all",
    dateRange: "all",
    search: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const getFirstName = (email) => {
    if (!email) return "Usuário";
    const name = email.split("@")[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  const getFilteredTransactions = () => {
    let filtered = [...transactions];

    if (filters.type !== "all") {
      filtered = filtered.filter((t) => t.type === filters.type);
    }

    if (filters.category !== "all") {
      filtered = filtered.filter((t) => t.category === filters.category);
    }

    if (filters.search) {
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          t.category.toLowerCase().includes(filters.search.toLowerCase()) ||
          (t.description &&
            t.description.toLowerCase().includes(filters.search.toLowerCase()))
      );
    }

    const now = new Date();
    if (filters.dateRange !== "all") {
      filtered = filtered.filter((t) => {
        const transactionDate = new Date(t.date);

        if (isNaN(transactionDate.getTime())) {
          return false;
        }

        switch (filters.dateRange) {
          case "today":
            return transactionDate.toDateString() === now.toDateString();
          case "week":
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return transactionDate >= weekAgo;
          case "month":
            return (
              transactionDate.getMonth() === now.getMonth() &&
              transactionDate.getFullYear() === now.getFullYear()
            );
          case "year":
            return transactionDate.getFullYear() === now.getFullYear();
          default:
            return true;
        }
      });
    }

    return filtered.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);

      if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
        return dateB - dateA;
      }

      if (!isNaN(dateA.getTime()) && isNaN(dateB.getTime())) {
        return -1;
      }
      if (isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
        return 1;
      }

      return 0;
    });
  };

  const filteredTransactions = getFilteredTransactions();

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(
    startIndex,
    endIndex
  );

  React.useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const categories = ["all", ...new Set(transactions.map((t) => t.category))];

  const getTypeLabel = (type) => {
    return type === "income" ? "Receita" : "Despesa";
  };

  const getTypeColor = (type) => {
    return type === "income" ? theme.colors.success : theme.colors.error;
  };

  const getTypeIcon = (type) => {
    return type === "income" ? "↗" : "↙";
  };

  const clearFilters = () => {
    setFilters({
      type: "all",
      category: "all",
      dateRange: "all",
      search: "",
    });
  };

  const hasActiveFilters = () => {
    return (
      filters.type !== "all" ||
      filters.category !== "all" ||
      filters.dateRange !== "all" ||
      filters.search !== ""
    );
  };

  const handleEditTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setEditModalVisible(true);
  };

  const handleSaveTransaction = async (updatedTransaction) => {
    try {
      if (updatedTransaction._delete) {
        await deleteTransaction(updatedTransaction.id);
      } else {
        await updateTransaction(updatedTransaction);
      }
      setEditModalVisible(false);
      setSelectedTransaction(null);
    } catch (error) {
      console.error("Erro ao salvar transação:", error);
    }
  };

  const handleCloseEditModal = () => {
    setEditModalVisible(false);
    setSelectedTransaction(null);
  };

  // Função para abrir preview da imagem
  const handleOpenImagePreview = (uri) => {
    setImagePreviewUri(uri);
    setImagePreviewVisible(true);
  };

  const FilterModal = () => (
    <Modal
      visible={showFilters}
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
          <TouchableOpacity onPress={() => setShowFilters(false)}>
            <Text style={[styles.modalButton, { color: theme.colors.primary }]}>
              Cancelar
            </Text>
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
            Filtros
          </Text>
          <TouchableOpacity onPress={clearFilters}>
            <Text style={[styles.modalButton, { color: theme.colors.primary }]}>
              Limpar
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
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
                  onPress={() =>
                    setFilters((prev) => ({ ...prev, type: option.value }))
                  }
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
                  onPress={() => setFilters((prev) => ({ ...prev, category }))}
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
                  onPress={() =>
                    setFilters((prev) => ({ ...prev, dateRange: option.value }))
                  }
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
            onPress={() => setShowFilters(false)}
            style={styles.applyButton}
          />
        </View>
      </View>
    </Modal>
  );

  const TransactionItem = ({ transaction }) => (
    <Card style={styles.transactionCard}>
      <View style={styles.transactionItem}>
        <View style={styles.transactionLeft}>
          <View
            style={[
              styles.transactionIconContainer,
              { backgroundColor: getTypeColor(transaction.type) + "20" },
            ]}
          >
            <Text
              style={[
                styles.transactionIcon,
                { color: getTypeColor(transaction.type) },
              ]}
            >
              {getTypeIcon(transaction.type)}
            </Text>
          </View>
          <View style={styles.transactionInfo}>
            <Text
              style={[styles.transactionTitle, { color: theme.colors.text }]}
            >
              {transaction.title}
            </Text>
            <Text
              style={[
                styles.transactionCategory,
                { color: theme.colors.textSecondary },
              ]}
            >
              {transaction.category} • {formatDate(transaction.date)}
            </Text>
            {transaction.description && (
              <Text
                style={[
                  styles.transactionDescription,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {transaction.description}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.transactionRight}>
          <Text
            style={[
              styles.transactionAmount,
              { color: getTypeColor(transaction.type) },
            ]}
          >
            {transaction.type === "income" ? "+ " : "- "}
            {formatCurrency(transaction.amount)}
          </Text>
          <Text
            style={[
              styles.transactionType,
              { color: theme.colors.textSecondary },
            ]}
          >
            {getTypeLabel(transaction.type)}
          </Text>
        </View>
      </View>
      <View style={styles.transactionActions}>
        {transaction.imageUrl && (
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: theme.colors.success + "20" },
            ]}
            onPress={() => handleOpenImagePreview(transaction.imageUrl)}
          >
            <Text
              style={[styles.actionButtonText, { color: theme.colors.success }]}
            >
              🖼️ Ver Imagem
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: theme.colors.primary + "20" },
          ]}
          onPress={() => handleEditTransaction(transaction)}
        >
          <Text
            style={[styles.actionButtonText, { color: theme.colors.primary }]}
          >
            ✏️ Editar
          </Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <LinearGradient
        colors={theme.colors.gradient}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Transações</Text>
            <Text style={styles.headerSubtitle}>
              {filteredTransactions.length} transação
              {filteredTransactions.length !== 1 ? "ões" : ""}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(true)}
          >
            <Text style={styles.filterButtonText}>🔍</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <Card style={styles.searchCard}>
          <Input
            placeholder="Buscar transações..."
            value={filters.search}
            onChangeText={(text) =>
              setFilters((prev) => ({ ...prev, search: text }))
            }
            style={styles.searchInput}
          />
        </Card>
        {hasActiveFilters() && (
          <Card style={styles.activeFiltersCard}>
            <View style={styles.activeFiltersHeader}>
              <Text
                style={[
                  styles.activeFiltersTitle,
                  { color: theme.colors.text },
                ]}
              >
                Filtros Ativos
              </Text>
              <TouchableOpacity onPress={clearFilters}>
                <Text
                  style={[
                    styles.clearFiltersText,
                    { color: theme.colors.primary },
                  ]}
                >
                  Limpar
                </Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.activeFiltersList}>
                {filters.type !== "all" && (
                  <View
                    style={[
                      styles.activeFilterTag,
                      { backgroundColor: theme.colors.primary + "20" },
                    ]}
                  >
                    <Text
                      style={[
                        styles.activeFilterText,
                        { color: theme.colors.primary },
                      ]}
                    >
                      {filters.type === "income" ? "Receitas" : "Despesas"}
                    </Text>
                  </View>
                )}
                {filters.category !== "all" && (
                  <View
                    style={[
                      styles.activeFilterTag,
                      { backgroundColor: theme.colors.primary + "20" },
                    ]}
                  >
                    <Text
                      style={[
                        styles.activeFilterText,
                        { color: theme.colors.primary },
                      ]}
                    >
                      {filters.category}
                    </Text>
                  </View>
                )}
                {filters.dateRange !== "all" && (
                  <View
                    style={[
                      styles.activeFilterTag,
                      { backgroundColor: theme.colors.primary + "20" },
                    ]}
                  >
                    <Text
                      style={[
                        styles.activeFilterText,
                        { color: theme.colors.primary },
                      ]}
                    >
                      {filters.dateRange === "today"
                        ? "Hoje"
                        : filters.dateRange === "week"
                        ? "Esta semana"
                        : filters.dateRange === "month"
                        ? "Este mês"
                        : "Este ano"}
                    </Text>
                  </View>
                )}
              </View>
            </ScrollView>
          </Card>
        )}

        <FlatList
          data={paginatedTransactions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <TransactionItem transaction={item} />}
          contentContainerStyle={styles.transactionsList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <Card style={styles.emptyCard}>
              <Text
                style={[
                  styles.emptyText,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {hasActiveFilters()
                  ? "Nenhuma transação encontrada com os filtros aplicados"
                  : "Nenhuma transação cadastrada"}
              </Text>
            </Card>
          }
        />
        {totalPages > 1 && (
          <Card style={styles.paginationCard}>
            <View style={styles.paginationInfo}>
              <Text
                style={[
                  styles.paginationText,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Página {currentPage} de {totalPages} •{" "}
                {filteredTransactions.length} transação
                {filteredTransactions.length !== 1 ? "ões" : ""}
              </Text>
            </View>
            <View style={styles.paginationControls}>
              <TouchableOpacity
                style={[
                  styles.paginationButton,
                  {
                    backgroundColor:
                      currentPage === 1
                        ? theme.colors.border
                        : theme.colors.primary,
                    opacity: currentPage === 1 ? 0.5 : 1,
                  },
                ]}
                onPress={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <Text
                  style={[
                    styles.paginationButtonText,
                    {
                      color:
                        currentPage === 1
                          ? theme.colors.textSecondary
                          : "white",
                    },
                  ]}
                >
                  Anterior
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.paginationButton,
                  {
                    backgroundColor:
                      currentPage === totalPages
                        ? theme.colors.border
                        : theme.colors.primary,
                    opacity: currentPage === totalPages ? 0.5 : 1,
                  },
                ]}
                onPress={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
              >
                <Text
                  style={[
                    styles.paginationButtonText,
                    {
                      color:
                        currentPage === totalPages
                          ? theme.colors.textSecondary
                          : "white",
                    },
                  ]}
                >
                  Próxima
                </Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}
      </View>

      <FilterModal />
      <UnifiedTransactionModal
        visible={editModalVisible}
        onClose={handleCloseEditModal}
        onSave={handleSaveTransaction}
        transaction={selectedTransaction}
      />
      <ImagePreviewModal
        visible={imagePreviewVisible}
        imageUri={imagePreviewUri}
        onClose={() => setImagePreviewVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 24,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 20,
    color: "white",
    fontWeight: "bold",
  },
  headerText: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  filterButtonText: {
    fontSize: 18,
    color: "white",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  searchCard: {
    marginBottom: 16,
  },
  searchInput: {
    margin: 0,
  },
  activeFiltersCard: {
    marginBottom: 16,
  },
  activeFiltersHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  activeFiltersTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  clearFiltersText: {
    fontSize: 14,
    fontWeight: "600",
  },
  activeFiltersList: {
    flexDirection: "row",
    gap: 8,
  },
  activeFilterTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  activeFilterText: {
    fontSize: 12,
    fontWeight: "600",
  },
  transactionsList: {
    paddingBottom: 24,
  },
  transactionCard: {
    marginBottom: 12,
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  transactionLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
  },
  transactionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  transactionIcon: {
    fontSize: 18,
    fontWeight: "bold",
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  transactionCategory: {
    fontSize: 12,
    marginBottom: 2,
  },
  transactionDescription: {
    fontSize: 12,
    fontStyle: "italic",
  },
  transactionRight: {
    alignItems: "flex-end",
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
  },
  transactionType: {
    fontSize: 12,
  },
  emptyCard: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  modalButton: {
    fontSize: 16,
    fontWeight: "600",
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 24,
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterOptionText: {
    fontSize: 14,
    fontWeight: "500",
  },
  modalFooter: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  applyButton: {
    margin: 0,
  },
  paginationCard: {
    marginTop: 16,
    marginBottom: 24,
  },
  paginationInfo: {
    alignItems: "center",
    marginBottom: 12,
  },
  paginationText: {
    fontSize: 14,
    fontWeight: "500",
  },
  paginationControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  paginationButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  paginationButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  transactionActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
});

export default TransactionsScreen;
