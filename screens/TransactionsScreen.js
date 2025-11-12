import React from "react";
import { View, StyleSheet, RefreshControl, FlatList, Text } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { Card } from "../components/Card";
import { ValidatedInput } from "../components/form/ValidatedInput";
import UnifiedTransactionModal from "../components/UnifiedTransactionModal";
import TransactionsHeader from "../components/TransactionsHeader";
import TransactionItem from "../components/TransactionItem";
import TransactionFilterModal from "../components/TransactionFilterModal";
import ActiveFilters from "../components/ActiveFilters";
import Pagination from "../components/Pagination";
import { useTransactionsScreen } from "../hooks/useTransactionsScreen";

const TransactionsScreen = ({ navigation }) => {
  const { theme } = useTheme();

  const {
    refreshing,
    editModalVisible,
    selectedTransaction,
    filters,
    showFilters,
    currentPage,
    totalPages,
    paginatedTransactions,
    filteredTransactions,
    categories,
    onRefresh,
    handleSearchChange,
    handleTypeChange,
    handleCategoryChange,
    handleDateRangeChange,
    clearFilters,
    hasActiveFilters,
    handleEditTransaction,
    handleSaveTransaction,
    handleCloseEditModal,
    toggleFiltersModal,
    handlePageChange,
  } = useTransactionsScreen();

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <TransactionsHeader
        onBack={() => navigation.goBack()}
        onOpenFilters={toggleFiltersModal}
        transactionCount={filteredTransactions.length}
      />

      <View style={styles.content}>
        <Card style={styles.searchCard}>
          <ValidatedInput
            placeholder="Buscar transações..."
            value={filters.search}
            onChangeText={handleSearchChange}
            style={styles.searchInput}
          />
        </Card>

        {hasActiveFilters() && (
          <ActiveFilters filters={filters} onClearFilters={clearFilters} />
        )}

        <FlatList
          data={paginatedTransactions}
          keyExtractor={(item, index) => item.id || `transaction-${index}`}
          renderItem={({ item }) => (
            <Card style={styles.transactionCard}>
              <TransactionItem
                transaction={item}
                onEdit={handleEditTransaction}
                showBorder={true}
              />
            </Card>
          )}
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

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </View>

      <TransactionFilterModal
        visible={showFilters}
        onClose={toggleFiltersModal}
        filters={filters}
        categories={categories}
        onTypeChange={handleTypeChange}
        onCategoryChange={handleCategoryChange}
        onDateRangeChange={handleDateRangeChange}
        onClearFilters={clearFilters}
      />

      <UnifiedTransactionModal
        visible={editModalVisible}
        onClose={handleCloseEditModal}
        onSave={handleSaveTransaction}
        transaction={selectedTransaction}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  transactionCard: {
    marginBottom: 12,
  },
  transactionsList: {
    paddingBottom: 24,
  },
  emptyCard: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
  },
});

export default TransactionsScreen;
