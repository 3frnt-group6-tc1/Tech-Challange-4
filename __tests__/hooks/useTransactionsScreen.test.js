import React from "react";
import { render, act } from "@testing-library/react-native";
import { Text, View } from "react-native";
import { useTransactionsScreen } from "../../hooks/useTransactionsScreen";

// Mock the TransactionsContext
const mockUpdateTransaction = jest.fn();
const mockDeleteTransaction = jest.fn();
const mockTransactions = [
  {
    id: "1",
    title: "Salary",
    category: "Income",
    amount: 5000,
    date: "2023-06-15",
    type: "income",
    description: "Monthly salary",
  },
  {
    id: "2",
    title: "Groceries",
    category: "Food",
    amount: 150,
    date: "2023-06-14",
    type: "expense",
    description: "Weekly shopping",
  },
  {
    id: "3",
    title: "Rent",
    category: "Housing",
    amount: 1200,
    date: "2023-06-01",
    type: "expense",
    description: "Monthly rent",
  },
];

jest.mock("../../contexts/TransactionsContext", () => ({
  useTransactions: () => ({
    transactions: mockTransactions,
    updateTransaction: mockUpdateTransaction,
    deleteTransaction: mockDeleteTransaction,
  }),
}));

describe("useTransactionsScreen", () => {
  // Test component to use the hook
  const TestComponent = () => {
    const hookResult = useTransactionsScreen();

    // Expose hook result for testing
    global.hookResult = hookResult;

    return (
      <View>
        <Text testID="count">{hookResult.paginatedTransactions.length}</Text>
      </View>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    global.hookResult = null;
  });

  afterEach(() => {
    delete global.hookResult;
  });

  describe("Initial State", () => {
    it("initializes with correct default values", () => {
      render(<TestComponent />);

      expect(global.hookResult.refreshing).toBe(false);
      expect(global.hookResult.editModalVisible).toBe(false);
      expect(global.hookResult.selectedTransaction).toBeNull();
      expect(global.hookResult.showFilters).toBe(false);
      expect(global.hookResult.currentPage).toBe(1);
    });

    it("initializes with default filters", () => {
      render(<TestComponent />);

      expect(global.hookResult.filters).toEqual({
        type: "all",
        category: "all",
        dateRange: "all",
        search: "",
      });
    });

    it("loads all transactions initially", () => {
      render(<TestComponent />);

      expect(global.hookResult.filteredTransactions.length).toBe(3);
      expect(global.hookResult.paginatedTransactions.length).toBe(3);
    });
  });

  describe("Filtering", () => {
    it("filters transactions by type - income", () => {
      render(<TestComponent />);

      act(() => {
        global.hookResult.handleTypeChange("income");
      });

      expect(global.hookResult.filteredTransactions.length).toBe(1);
      expect(global.hookResult.filteredTransactions[0].type).toBe("income");
    });

    it("filters transactions by type - expense", () => {
      render(<TestComponent />);

      act(() => {
        global.hookResult.handleTypeChange("expense");
      });

      expect(global.hookResult.filteredTransactions.length).toBe(2);
      expect(
        global.hookResult.filteredTransactions.every(
          (t) => t.type === "expense"
        )
      ).toBe(true);
    });

    it("filters transactions by category", () => {
      render(<TestComponent />);

      act(() => {
        global.hookResult.handleCategoryChange("Food");
      });

      expect(global.hookResult.filteredTransactions.length).toBe(1);
      expect(global.hookResult.filteredTransactions[0].category).toBe("Food");
    });

    it("filters transactions by search term in title", () => {
      render(<TestComponent />);

      act(() => {
        global.hookResult.handleSearchChange("salary");
      });

      expect(global.hookResult.filteredTransactions.length).toBe(1);
      expect(global.hookResult.filteredTransactions[0].title).toBe("Salary");
    });

    it("filters transactions by search term in category", () => {
      render(<TestComponent />);

      act(() => {
        global.hookResult.handleSearchChange("food");
      });

      expect(global.hookResult.filteredTransactions.length).toBe(1);
      expect(global.hookResult.filteredTransactions[0].category).toBe("Food");
    });

    it("filters transactions by search term in description", () => {
      render(<TestComponent />);

      act(() => {
        global.hookResult.handleSearchChange("weekly");
      });

      expect(global.hookResult.filteredTransactions.length).toBe(1);
      expect(global.hookResult.filteredTransactions[0].description).toContain(
        "Weekly"
      );
    });

    it("search is case insensitive", () => {
      render(<TestComponent />);

      act(() => {
        global.hookResult.handleSearchChange("SALARY");
      });

      expect(global.hookResult.filteredTransactions.length).toBe(1);
    });

    it("applies multiple filters simultaneously", () => {
      render(<TestComponent />);

      act(() => {
        global.hookResult.handleTypeChange("expense");
        global.hookResult.handleCategoryChange("Food");
      });

      expect(global.hookResult.filteredTransactions.length).toBe(1);
      expect(global.hookResult.filteredTransactions[0].title).toBe("Groceries");
    });
  });

  describe("Clear Filters", () => {
    it("clears all filters", () => {
      render(<TestComponent />);

      act(() => {
        global.hookResult.handleTypeChange("income");
        global.hookResult.handleCategoryChange("Income");
        global.hookResult.handleSearchChange("test");
      });

      expect(global.hookResult.filters.type).toBe("income");

      act(() => {
        global.hookResult.clearFilters();
      });

      expect(global.hookResult.filters).toEqual({
        type: "all",
        category: "all",
        dateRange: "all",
        search: "",
      });
    });

    it("restores all transactions after clearing filters", () => {
      render(<TestComponent />);

      act(() => {
        global.hookResult.handleTypeChange("income");
      });

      expect(global.hookResult.filteredTransactions.length).toBe(1);

      act(() => {
        global.hookResult.clearFilters();
      });

      expect(global.hookResult.filteredTransactions.length).toBe(3);
    });
  });

  describe("Active Filters Detection", () => {
    it("returns false when no filters are active", () => {
      render(<TestComponent />);

      expect(global.hookResult.hasActiveFilters()).toBe(false);
    });

    it("returns true when type filter is active", () => {
      render(<TestComponent />);

      act(() => {
        global.hookResult.handleTypeChange("income");
      });

      expect(global.hookResult.hasActiveFilters()).toBe(true);
    });

    it("returns true when category filter is active", () => {
      render(<TestComponent />);

      act(() => {
        global.hookResult.handleCategoryChange("Food");
      });

      expect(global.hookResult.hasActiveFilters()).toBe(true);
    });

    it("returns true when search filter is active", () => {
      render(<TestComponent />);

      act(() => {
        global.hookResult.handleSearchChange("test");
      });

      expect(global.hookResult.hasActiveFilters()).toBe(true);
    });

    it("returns true when date range filter is active", () => {
      render(<TestComponent />);

      act(() => {
        global.hookResult.handleDateRangeChange("today");
      });

      expect(global.hookResult.hasActiveFilters()).toBe(true);
    });
  });

  describe("Pagination", () => {
    it("calculates total pages correctly", () => {
      render(<TestComponent />);

      expect(global.hookResult.totalPages).toBe(1);
    });

    it("changes page correctly", () => {
      render(<TestComponent />);

      act(() => {
        global.hookResult.handlePageChange(2);
      });

      expect(global.hookResult.currentPage).toBe(2);
    });

    it("resets to page 1 when filters change", () => {
      render(<TestComponent />);

      act(() => {
        global.hookResult.handlePageChange(2);
      });

      expect(global.hookResult.currentPage).toBe(2);

      act(() => {
        global.hookResult.handleTypeChange("income");
      });

      expect(global.hookResult.currentPage).toBe(1);
    });
  });

  describe("Categories", () => {
    it("extracts unique categories from transactions", () => {
      render(<TestComponent />);

      expect(global.hookResult.categories).toContain("all");
      expect(global.hookResult.categories).toContain("Income");
      expect(global.hookResult.categories).toContain("Food");
      expect(global.hookResult.categories).toContain("Housing");
    });

    it("includes 'all' as first category", () => {
      render(<TestComponent />);

      expect(global.hookResult.categories[0]).toBe("all");
    });
  });

  describe("Edit Transaction", () => {
    it("opens edit modal with selected transaction", () => {
      render(<TestComponent />);

      const transaction = mockTransactions[0];

      act(() => {
        global.hookResult.handleEditTransaction(transaction);
      });

      expect(global.hookResult.editModalVisible).toBe(true);
      expect(global.hookResult.selectedTransaction).toEqual(transaction);
    });

    it("closes edit modal", () => {
      render(<TestComponent />);

      act(() => {
        global.hookResult.handleEditTransaction(mockTransactions[0]);
      });

      expect(global.hookResult.editModalVisible).toBe(true);

      act(() => {
        global.hookResult.handleCloseEditModal();
      });

      expect(global.hookResult.editModalVisible).toBe(false);
      expect(global.hookResult.selectedTransaction).toBeNull();
    });
  });

  describe("Save Transaction", () => {
    it("calls updateTransaction when saving changes", async () => {
      render(<TestComponent />);

      const updatedTransaction = { ...mockTransactions[0], amount: 6000 };

      await act(async () => {
        await global.hookResult.handleSaveTransaction(updatedTransaction);
      });

      expect(mockUpdateTransaction).toHaveBeenCalledWith(updatedTransaction);
      expect(global.hookResult.editModalVisible).toBe(false);
      expect(global.hookResult.selectedTransaction).toBeNull();
    });

    it("calls deleteTransaction when transaction has _delete flag", async () => {
      render(<TestComponent />);

      const transactionToDelete = { ...mockTransactions[0], _delete: true };

      await act(async () => {
        await global.hookResult.handleSaveTransaction(transactionToDelete);
      });

      expect(mockDeleteTransaction).toHaveBeenCalledWith(
        transactionToDelete.id
      );
      expect(global.hookResult.editModalVisible).toBe(false);
    });

    it("handles save errors gracefully", async () => {
      mockUpdateTransaction.mockRejectedValueOnce(new Error("Update failed"));
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      render(<TestComponent />);

      await act(async () => {
        await global.hookResult.handleSaveTransaction(mockTransactions[0]);
      });

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe("Refresh", () => {
    it("handles pull-to-refresh", async () => {
      jest.useFakeTimers();
      render(<TestComponent />);

      expect(global.hookResult.refreshing).toBe(false);

      act(() => {
        global.hookResult.onRefresh();
      });

      expect(global.hookResult.refreshing).toBe(true);

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(global.hookResult.refreshing).toBe(false);

      jest.useRealTimers();
    });
  });

  describe("Toggle Filters Modal", () => {
    it("toggles filters modal visibility", () => {
      render(<TestComponent />);

      expect(global.hookResult.showFilters).toBe(false);

      act(() => {
        global.hookResult.toggleFiltersModal();
      });

      expect(global.hookResult.showFilters).toBe(true);

      act(() => {
        global.hookResult.toggleFiltersModal();
      });

      expect(global.hookResult.showFilters).toBe(false);
    });
  });

  describe("Sorting", () => {
    it("sorts transactions by date in descending order", () => {
      render(<TestComponent />);

      const sorted = global.hookResult.filteredTransactions;
      expect(sorted[0].date).toBe("2023-06-15"); // Most recent first
      expect(sorted[1].date).toBe("2023-06-14");
      expect(sorted[2].date).toBe("2023-06-01");
    });
  });
});
