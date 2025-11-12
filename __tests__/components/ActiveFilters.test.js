import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import ActiveFilters from "../../components/ActiveFilters";
import { lightTheme, darkTheme } from "../../contexts/ThemeContext";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
}));

// Mock the useTheme hook
const mockUseTheme = jest.fn();
jest.mock("../../contexts/ThemeContext", () => {
  const originalModule = jest.requireActual("../../contexts/ThemeContext");
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
          <ActiveFilters filters={filters} onClearFilters={jest.fn()} />
        </TestWrapper>
      );

      expect(queryByText("Filtros Ativos")).toBeNull();
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
          <ActiveFilters filters={filters} onClearFilters={jest.fn()} />
        </TestWrapper>
      );

      expect(getByText("Filtros Ativos")).toBeTruthy();
      expect(getByText("Limpar")).toBeTruthy();
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
          <ActiveFilters filters={filters} onClearFilters={jest.fn()} />
        </TestWrapper>
      );

      expect(getByText("Receitas")).toBeTruthy();
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
          <ActiveFilters filters={filters} onClearFilters={jest.fn()} />
        </TestWrapper>
      );

      expect(getByText("Despesas")).toBeTruthy();
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
          <ActiveFilters filters={filters} onClearFilters={jest.fn()} />
        </TestWrapper>
      );

      expect(getByText("Alimentação")).toBeTruthy();
    });
  });

  describe("Date Range Filters", () => {
    it("displays today date range filter", () => {
      const filters = {
        type: "all",
        category: "all",
        dateRange: "today",
        search: "",
      };

      const { getByText } = render(
        <TestWrapper>
          <ActiveFilters filters={filters} onClearFilters={jest.fn()} />
        </TestWrapper>
      );

      expect(getByText("Hoje")).toBeTruthy();
    });

    it("displays week date range filter", () => {
      const filters = {
        type: "all",
        category: "all",
        dateRange: "week",
        search: "",
      };

      const { getByText } = render(
        <TestWrapper>
          <ActiveFilters filters={filters} onClearFilters={jest.fn()} />
        </TestWrapper>
      );

      expect(getByText("Esta semana")).toBeTruthy();
    });

    it("displays month date range filter", () => {
      const filters = {
        type: "all",
        category: "all",
        dateRange: "month",
        search: "",
      };

      const { getByText } = render(
        <TestWrapper>
          <ActiveFilters filters={filters} onClearFilters={jest.fn()} />
        </TestWrapper>
      );

      expect(getByText("Este mês")).toBeTruthy();
    });

    it("displays year date range filter", () => {
      const filters = {
        type: "all",
        category: "all",
        dateRange: "year",
        search: "",
      };

      const { getByText } = render(
        <TestWrapper>
          <ActiveFilters filters={filters} onClearFilters={jest.fn()} />
        </TestWrapper>
      );

      expect(getByText("Este ano")).toBeTruthy();
    });
  });

  describe("Search Filter", () => {
    it("displays search filter", () => {
      const filters = {
        type: "all",
        category: "all",
        dateRange: "all",
        search: "test search",
      };

      const { getByText } = render(
        <TestWrapper>
          <ActiveFilters filters={filters} onClearFilters={jest.fn()} />
        </TestWrapper>
      );

      expect(getByText('Busca: "test search"')).toBeTruthy();
    });
  });

  describe("Multiple Filters", () => {
    it("displays multiple active filters", () => {
      const filters = {
        type: "income",
        category: "Salário",
        dateRange: "month",
        search: "bonus",
      };

      const { getByText } = render(
        <TestWrapper>
          <ActiveFilters filters={filters} onClearFilters={jest.fn()} />
        </TestWrapper>
      );

      expect(getByText("Receitas")).toBeTruthy();
      expect(getByText("Salário")).toBeTruthy();
      expect(getByText("Este mês")).toBeTruthy();
      expect(getByText('Busca: "bonus"')).toBeTruthy();
    });
  });

  describe("Clear Filters", () => {
    it("calls onClearFilters when clear button is pressed", () => {
      const onClearFiltersMock = jest.fn();
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
            onClearFilters={onClearFiltersMock}
          />
        </TestWrapper>
      );

      fireEvent.press(getByText("Limpar"));
      expect(onClearFiltersMock).toHaveBeenCalledTimes(1);
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
          <ActiveFilters filters={filters} onClearFilters={jest.fn()} />
        </TestWrapper>
      );

      expect(getByText("Filtros Ativos")).toBeTruthy();
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
          <ActiveFilters filters={filters} onClearFilters={jest.fn()} />
        </TestWrapper>
      );

      expect(getByText("Filtros Ativos")).toBeTruthy();
    });
  });
});
