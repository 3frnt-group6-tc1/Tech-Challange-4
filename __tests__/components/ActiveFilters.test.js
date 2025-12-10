import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import ActiveFilters from "../../src/presentation/components/legacy/ActiveFilters";
import { lightTheme, darkTheme } from "../../src/domain/contexts/ThemeContext";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
}));

// Mock the useTheme hook
const mockUseTheme = jest.fn();
jest.mock("../../src/domain/contexts/ThemeContext", () => {
  const originalModule = jest.requireActual("../../src/domain/contexts/ThemeContext");
  return {
    ...originalModule,
    useTheme: () => mockUseTheme(),
  };
});

// Test wrapper component
const TestWrapper = ({ children, theme = "light" }) => {
  const selectedTheme = theme === "light" ? lightTheme : darkTheme;
  mockUseTheme.mockReturnValue({
    theme: selectedTheme,
    isDarkMode: theme === "dark",
    toggleTheme: jest.fn(),
    isLoading: false,
  });

  return <>{children}</>;
};

describe("ActiveFilters Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("returns null when no filters are active", () => {
      const filters = {
        type: "all",
        category: "all",
        dateRange: "all",
        search: "",
      };

      const { queryByText } = render(
        <TestWrapper>
          <ActiveFilters filters={filters} onClearAll={jest.fn()} />
        </TestWrapper>
      );

      expect(queryByText("Limpar")).toBeNull();
    });

    it("renders when filters are active", () => {
      const filters = {
        type: "income",
        category: "all",
        dateRange: "all",
        search: "",
      };

      const { getByText } = render(
        <TestWrapper>
          <ActiveFilters filters={filters} onClearAll={jest.fn()} />
        </TestWrapper>
      );

      expect(getByText("Limpar todos")).toBeTruthy();
    });
  });

  describe("Filter Types", () => {
    it("displays income type filter", () => {
      const filters = {
        type: "income",
        category: "all",
        dateRange: "all",
        search: "",
      };

      const { getByText } = render(
        <TestWrapper>
          <ActiveFilters filters={filters} onClearAll={jest.fn()} />
        </TestWrapper>
      );

      expect(getByText("Tipo: Receitas")).toBeTruthy();
    });

    it("displays expense type filter", () => {
      const filters = {
        type: "expense",
        category: "all",
        dateRange: "all",
        search: "",
      };

      const { getByText } = render(
        <TestWrapper>
          <ActiveFilters filters={filters} onClearAll={jest.fn()} />
        </TestWrapper>
      );

      expect(getByText("Tipo: Despesas")).toBeTruthy();
    });

    it("displays category filter", () => {
      const filters = {
        type: "all",
        category: "Alimentação",
        dateRange: "all",
        search: "",
      };

      const { getByText } = render(
        <TestWrapper>
          <ActiveFilters filters={filters} onClearAll={jest.fn()} />
        </TestWrapper>
      );

      expect(getByText("Categoria: Alimentação")).toBeTruthy();
    });
  });

  describe("Date Range Filters", () => {
    it("displays custom date range filter", () => {
      const filters = {
        type: "all",
        category: "all",
        dateRange: { start: "2023-01-01", end: "2023-01-31" },
        search: "",
      };

      const { getByText } = render(
        <TestWrapper>
          <ActiveFilters filters={filters} onClearAll={jest.fn()} />
        </TestWrapper>
      );

      expect(getByText("Período personalizado")).toBeTruthy();
    });
  });

  describe("Search Filter", () => {
    it("does not display search filter (not supported)", () => {
      const filters = {
        type: "all",
        category: "all",
        dateRange: "all",
        search: "test search",
      };

      const { queryByText } = render(
        <TestWrapper>
          <ActiveFilters filters={filters} onClearAll={jest.fn()} />
        </TestWrapper>
      );

      expect(queryByText('Busca: "test search"')).toBeNull();
    });
  });

  describe("Multiple Filters", () => {
    it("displays multiple active filters", () => {
      const filters = {
        type: "income",
        category: "Salário",
        dateRange: { start: "2024-01-01", end: "2024-01-31" },
      };

      const { getByText } = render(
        <TestWrapper>
          <ActiveFilters filters={filters} onClearAll={jest.fn()} />
        </TestWrapper>
      );

      expect(getByText("Tipo: Receitas")).toBeTruthy();
      expect(getByText("Categoria: Salário")).toBeTruthy();
      expect(getByText("Período personalizado")).toBeTruthy();
    });
  });

  describe("Clear Filters", () => {
    it("calls onClearAll when clear button is pressed", () => {
      const onClearAllMock = jest.fn();
      const filters = {
        type: "income",
        category: "all",
        dateRange: "all",
        search: "",
      };

      const { getByText } = render(
        <TestWrapper>
          <ActiveFilters
            filters={filters}
            onClearAll={onClearAllMock}
          />
        </TestWrapper>
      );

      fireEvent.press(getByText("Limpar todos"));
      expect(onClearAllMock).toHaveBeenCalledTimes(1);
    });
  });

  describe("Theme Support", () => {
    it("renders correctly with light theme", () => {
      const filters = {
        type: "income",
        category: "all",
        dateRange: "all",
        search: "",
      };

      const { getByText } = render(
        <TestWrapper theme="light">
          <ActiveFilters filters={filters} onClearAll={jest.fn()} />
        </TestWrapper>
      );

      expect(getByText("Limpar todos")).toBeTruthy();
    });

    it("renders correctly with dark theme", () => {
      const filters = {
        type: "income",
        category: "all",
        dateRange: "all",
        search: "",
      };

      const { getByText } = render(
        <TestWrapper theme="dark">
          <ActiveFilters filters={filters} onClearAll={jest.fn()} />
        </TestWrapper>
      );

      expect(getByText("Limpar todos")).toBeTruthy();
    });
  });
});
