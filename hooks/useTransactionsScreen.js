import { useState, useCallback, useMemo, useEffect } from "react";
import { useTransactions } from "../contexts/TransactionsContext";

/**
 * Custom hook for managing TransactionsScreen state and logic
 * Handles filtering, pagination, search, and transaction management
 */
export const useTransactionsScreen = () => {
  const { transactions, updateTransaction, deleteTransaction } =
    useTransactions();

  const [refreshing, setRefreshing] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const [filters, setFilters] = useState({
    type: "all",
    category: "all",
    dateRange: "all",
    search: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  /**
   * Handle pull-to-refresh
   */
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  /**
   * Get filtered and sorted transactions
   */
  const getFilteredTransactions = useCallback(() => {
    let filtered = [...transactions];

    if (filters.type !== "all") {
      filtered = filtered.filter((t) => t.type === filters.type);
    }

    if (filters.category !== "all") {
      filtered = filtered.filter((t) => t.category === filters.category);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(searchLower) ||
          t.category.toLowerCase().includes(searchLower) ||
          (t.description && t.description.toLowerCase().includes(searchLower))
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
  }, [transactions, filters]);

  const filteredTransactions = useMemo(
    () => getFilteredTransactions(),
    [getFilteredTransactions]
  );

  /**
   * Pagination calculations
   */
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(
    startIndex,
    endIndex
  );

  /**
   * Reset to first page when filters change
   */
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  /**
   * Get unique categories from transactions
   */
  const categories = useMemo(
    () => ["all", ...new Set(transactions.map((t) => t.category))],
    [transactions]
  );

  /**
   * Clear all active filters
   */
  const clearFilters = useCallback(() => {
    setFilters({
      type: "all",
      category: "all",
      dateRange: "all",
      search: "",
    });
  }, []);

  /**
   * Check if any filters are active
   */
  const hasActiveFilters = useCallback(() => {
    return (
      filters.type !== "all" ||
      filters.category !== "all" ||
      filters.dateRange !== "all" ||
      filters.search !== ""
    );
  }, [filters]);

  /**
   * Update search filter
   */
  const handleSearchChange = useCallback((text) => {
    setFilters((prev) => ({ ...prev, search: text }));
  }, []);

  /**
   * Update type filter
   */
  const handleTypeChange = useCallback((type) => {
    setFilters((prev) => ({ ...prev, type }));
  }, []);

  /**
   * Update category filter
   */
  const handleCategoryChange = useCallback((category) => {
    setFilters((prev) => ({ ...prev, category }));
  }, []);

  /**
   * Update date range filter
   */
  const handleDateRangeChange = useCallback((dateRange) => {
    setFilters((prev) => ({ ...prev, dateRange }));
  }, []);

  /**
   * Open transaction edit modal
   */
  const handleEditTransaction = useCallback((transaction) => {
    setSelectedTransaction(transaction);
    setEditModalVisible(true);
  }, []);

  /**
   * Save transaction (update or delete)
   */
  const handleSaveTransaction = useCallback(
    async (updatedTransaction) => {
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
    },
    [deleteTransaction, updateTransaction]
  );

  /**
   * Close edit modal
   */
  const handleCloseEditModal = useCallback(() => {
    setEditModalVisible(false);
    setSelectedTransaction(null);
  }, []);

  /**
   * Toggle filters modal
   */
  const toggleFiltersModal = useCallback(() => {
    setShowFilters((prev) => !prev);
  }, []);

  /**
   * Change page
   */
  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  return {
    // State
    refreshing,
    editModalVisible,
    selectedTransaction,
    filters,
    showFilters,
    currentPage,
    totalPages,

    // Data
    paginatedTransactions,
    filteredTransactions,
    categories,

    // Handlers
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
  };
};
