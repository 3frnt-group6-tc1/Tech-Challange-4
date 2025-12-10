import { useState, useCallback, useMemo, useEffect } from "react";
import { useTransactions } from "../../domain/contexts/TransactionsContext";

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

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

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

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(
    startIndex,
    endIndex
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const categories = useMemo(
    () => ["all", ...new Set(transactions.map((t) => t.category))],
    [transactions]
  );

  const clearFilters = useCallback(() => {
    setFilters({
      type: "all",
      category: "all",
      dateRange: "all",
      search: "",
    });
  }, []);

  const hasActiveFilters = useCallback(() => {
    return (
      filters.type !== "all" ||
      filters.category !== "all" ||
      filters.dateRange !== "all" ||
      filters.search !== ""
    );
  }, [filters]);

  const handleSearchChange = useCallback((text) => {
    setFilters((prev) => ({ ...prev, search: text }));
  }, []);

  const handleTypeChange = useCallback((type) => {
    setFilters((prev) => ({ ...prev, type }));
  }, []);

  const handleCategoryChange = useCallback((category) => {
    setFilters((prev) => ({ ...prev, category }));
  }, []);

  const handleDateRangeChange = useCallback((dateRange) => {
    setFilters((prev) => ({ ...prev, dateRange }));
  }, []);

  const handleEditTransaction = useCallback((transaction) => {
    setSelectedTransaction(transaction);
    setEditModalVisible(true);
  }, []);

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

  const handleCloseEditModal = useCallback(() => {
    setEditModalVisible(false);
    setSelectedTransaction(null);
  }, []);

  const toggleFiltersModal = useCallback(() => {
    setShowFilters((prev) => !prev);
  }, []);

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
