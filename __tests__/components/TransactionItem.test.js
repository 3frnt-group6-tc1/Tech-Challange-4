import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import TransactionItem from "../../components/TransactionItem";
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

// Mock the useCurrency hook
const mockUseCurrency = jest.fn();
jest.mock("../../contexts/CurrencyContext", () => ({
  useCurrency: () => mockUseCurrency(),
}));

// Mock the useImagePreview hook
const mockUseImagePreview = jest.fn();
jest.mock("../../hooks/useImagePreview", () => ({
  useImagePreview: () => mockUseImagePreview(),
}));

// Mock formatDate utility
jest.mock("../../utils/dateFormatter", () => ({
  formatDate: (date) => "01/01/2023",
}));

// Test wrapper component
const TestWrapper = ({ children, theme = "light" }) => {
  const selectedTheme = theme === "light" ? lightTheme : darkTheme;
  mockUseTheme.mockReturnValue({
    theme: selectedTheme,
    isDarkMode: theme === "dark",
    toggleTheme: jest.fn(),
    isLoading: false,
  });

  mockUseCurrency.mockReturnValue({
    formatCurrency: (amount) => `R$ ${amount.toFixed(2)}`,
  });

  mockUseImagePreview.mockReturnValue({
    imagePreviewVisible: false,
    imagePreviewUri: null,
    openImagePreview: jest.fn(),
    closeImagePreview: jest.fn(),
  });

  return <>{children}</>;
};

describe("TransactionItem Component", () => {
  const mockTransaction = {
    id: "1",
    title: "Salary",
    category: "Income",
    amount: 5000,
    date: "2023-01-01",
    type: "income",
    description: "Monthly salary",
    imageUrl: "https://example.com/image.jpg",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders transaction details correctly", () => {
      const { getByText } = render(
        <TestWrapper>
          <TransactionItem transaction={mockTransaction} />
        </TestWrapper>
      );

      expect(getByText("Salary")).toBeTruthy();
      expect(getByText("Income • 01/01/2023")).toBeTruthy();
      expect(getByText("Monthly salary")).toBeTruthy();
    });

    it("renders income transaction with correct styling", () => {
      const { getByText } = render(
        <TestWrapper>
          <TransactionItem transaction={mockTransaction} />
        </TestWrapper>
      );

      expect(getByText("+ R$ 5000.00")).toBeTruthy();
      expect(getByText("Receita")).toBeTruthy();
    });

    it("renders expense transaction with correct styling", () => {
      const expenseTransaction = {
        ...mockTransaction,
        type: "expense",
        amount: 150,
      };

      const { getByText } = render(
        <TestWrapper>
          <TransactionItem transaction={expenseTransaction} />
        </TestWrapper>
      );

      expect(getByText("- R$ 150.00")).toBeTruthy();
      expect(getByText("Despesa")).toBeTruthy();
    });
  });

  describe("Transaction Types", () => {
    it("displays correct icon for income", () => {
      const { getByText } = render(
        <TestWrapper>
          <TransactionItem transaction={mockTransaction} />
        </TestWrapper>
      );

      expect(getByText("↗")).toBeTruthy();
    });

    it("displays correct icon for expense", () => {
      const expenseTransaction = {
        ...mockTransaction,
        type: "expense",
      };

      const { getByText } = render(
        <TestWrapper>
          <TransactionItem transaction={expenseTransaction} />
        </TestWrapper>
      );

      expect(getByText("↙")).toBeTruthy();
    });

    it("displays correct type label for income", () => {
      const { getByText } = render(
        <TestWrapper>
          <TransactionItem transaction={mockTransaction} />
        </TestWrapper>
      );

      expect(getByText("Receita")).toBeTruthy();
    });

    it("displays correct type label for expense", () => {
      const expenseTransaction = {
        ...mockTransaction,
        type: "expense",
      };

      const { getByText } = render(
        <TestWrapper>
          <TransactionItem transaction={expenseTransaction} />
        </TestWrapper>
      );

      expect(getByText("Despesa")).toBeTruthy();
    });
  });

  describe("Description Display", () => {
    it("shows description when showDescription is true", () => {
      const { getByText } = render(
        <TestWrapper>
          <TransactionItem
            transaction={mockTransaction}
            showDescription={true}
          />
        </TestWrapper>
      );

      expect(getByText("Monthly salary")).toBeTruthy();
    });

    it("hides description when showDescription is false", () => {
      const { queryByText } = render(
        <TestWrapper>
          <TransactionItem
            transaction={mockTransaction}
            showDescription={false}
          />
        </TestWrapper>
      );

      expect(queryByText("Monthly salary")).toBeNull();
    });

    it("does not render description section when description is empty", () => {
      const transactionWithoutDescription = {
        ...mockTransaction,
        description: "",
      };

      const { queryByText } = render(
        <TestWrapper>
          <TransactionItem
            transaction={transactionWithoutDescription}
            showDescription={true}
          />
        </TestWrapper>
      );

      expect(queryByText("Monthly salary")).toBeNull();
    });
  });

  describe("Action Buttons", () => {
    it("shows edit button when showEditButton is true and onEdit is provided", () => {
      const { getByText } = render(
        <TestWrapper>
          <TransactionItem
            transaction={mockTransaction}
            onEdit={jest.fn()}
            showEditButton={true}
          />
        </TestWrapper>
      );

      expect(getByText("✏️ Editar")).toBeTruthy();
    });

    it("hides edit button when showEditButton is false", () => {
      const { queryByText } = render(
        <TestWrapper>
          <TransactionItem
            transaction={mockTransaction}
            onEdit={jest.fn()}
            showEditButton={false}
          />
        </TestWrapper>
      );

      expect(queryByText("✏️ Editar")).toBeNull();
    });

    it("shows image button when showImageButton is true and imageUrl exists", () => {
      const { getByText } = render(
        <TestWrapper>
          <TransactionItem
            transaction={mockTransaction}
            showImageButton={true}
          />
        </TestWrapper>
      );

      expect(getByText("🖼️ Ver Imagem")).toBeTruthy();
    });

    it("hides image button when showImageButton is false", () => {
      const { queryByText } = render(
        <TestWrapper>
          <TransactionItem
            transaction={mockTransaction}
            showImageButton={false}
          />
        </TestWrapper>
      );

      expect(queryByText("🖼️ Ver Imagem")).toBeNull();
    });

    it("hides image button when imageUrl is not provided", () => {
      const transactionWithoutImage = {
        ...mockTransaction,
        imageUrl: null,
      };

      const { queryByText } = render(
        <TestWrapper>
          <TransactionItem
            transaction={transactionWithoutImage}
            showImageButton={true}
          />
        </TestWrapper>
      );

      expect(queryByText("🖼️ Ver Imagem")).toBeNull();
    });
  });

  describe("Interaction", () => {
    it("calls onEdit when edit button is pressed", () => {
      const onEditMock = jest.fn();
      const { getByText } = render(
        <TestWrapper>
          <TransactionItem
            transaction={mockTransaction}
            onEdit={onEditMock}
            showEditButton={true}
          />
        </TestWrapper>
      );

      fireEvent.press(getByText("✏️ Editar"));
      expect(onEditMock).toHaveBeenCalledWith(mockTransaction);
    });

    it("calls openImagePreview when image button is pressed", () => {
      const openImagePreviewMock = jest.fn();

      // Setup theme mock
      mockUseTheme.mockReturnValue({
        theme: lightTheme,
        isDarkMode: false,
        toggleTheme: jest.fn(),
        isLoading: false,
      });

      // Setup currency mock
      mockUseCurrency.mockReturnValue({
        formatCurrency: (amount) => `R$ ${amount.toFixed(2)}`,
      });

      // Setup image preview mock with custom function
      mockUseImagePreview.mockReturnValue({
        imagePreviewVisible: false,
        imagePreviewUri: null,
        openImagePreview: openImagePreviewMock,
        closeImagePreview: jest.fn(),
      });

      const { getByText } = render(
        <TransactionItem transaction={mockTransaction} showImageButton={true} />
      );

      fireEvent.press(getByText("🖼️ Ver Imagem"));
      expect(openImagePreviewMock).toHaveBeenCalledWith(
        mockTransaction.imageUrl
      );
    });
  });

  describe("Theme Support", () => {
    it("renders correctly with light theme", () => {
      const { getByText } = render(
        <TestWrapper theme="light">
          <TransactionItem transaction={mockTransaction} />
        </TestWrapper>
      );

      expect(getByText("Salary")).toBeTruthy();
    });

    it("renders correctly with dark theme", () => {
      const { getByText } = render(
        <TestWrapper theme="dark">
          <TransactionItem transaction={mockTransaction} />
        </TestWrapper>
      );

      expect(getByText("Salary")).toBeTruthy();
    });
  });

  describe("Currency Formatting", () => {
    it("formats currency correctly", () => {
      const { getByText } = render(
        <TestWrapper>
          <TransactionItem transaction={mockTransaction} />
        </TestWrapper>
      );

      expect(getByText("+ R$ 5000.00")).toBeTruthy();
    });

    it("formats negative amounts for expenses", () => {
      const expenseTransaction = {
        ...mockTransaction,
        type: "expense",
        amount: 250.5,
      };

      const { getByText } = render(
        <TestWrapper>
          <TransactionItem transaction={expenseTransaction} />
        </TestWrapper>
      );

      expect(getByText("- R$ 250.50")).toBeTruthy();
    });
  });
});
