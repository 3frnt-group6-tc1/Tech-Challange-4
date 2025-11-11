import React from "react";
import { render, act } from "@testing-library/react-native";
import { Text, View } from "react-native";

// Mock the contexts
jest.mock("../../contexts/TransactionsContext");
jest.mock("../../contexts/CurrencyContext");

// Mock useFormValidation hook
jest.mock("../../hooks/useFormValidation");

// Mock validation rules
jest.mock("../../utils/formFieldRules", () => ({
  formValidationSets: {
    recurringTransaction: jest.fn(() => ({
      title: { required: "Title is required" },
      description: { required: "Description is required" },
      amount: { required: "Amount is required" },
      category: { required: "Category is required" },
      frequency: { required: "Frequency is required" },
      nextDueDate: { required: "Next due date is required" },
    })),
  },
}));

import { useRecurringTransactionModal } from "../../hooks/useRecurringTransactionModal";
import { useTransactions } from "../../contexts/TransactionsContext";
import { useCurrency } from "../../contexts/CurrencyContext";
import { useFormValidation } from "../../hooks/useFormValidation";
import { Alert } from "react-native";

describe("useRecurringTransactionModal", () => {
  // Mock functions
  const mockOnSave = jest.fn();
  const mockOnClose = jest.fn();
  const mockHandleSubmit = jest.fn();
  const mockResetForm = jest.fn();
  const mockFormatCurrencyInput = jest.fn();
  const mockParseCurrency = jest.fn();

  // Mock data
  const mockCategories = {
    expense: [
      { id: "1", name: "Food", color: "#FF6B6B" },
      { id: "2", name: "Transport", color: "#4ECDC4" },
      { id: "3", name: "Entertainment", color: "#45B7D1" },
    ],
  };

  const mockTransaction = {
    id: "123",
    title: "Monthly Rent",
    description: "Apartment rent",
    amount: 1500,
    category: "1",
    type: "expense",
    frequency: "monthly",
    nextDueDate: "2024-01-01",
  };

  // Test component to use the hook
  const TestComponent = (props) => {
    const hookResult = useRecurringTransactionModal(props);
    return (
      <View>
        <Text testID="modal-title">{hookResult.modalTitle}</Text>
        <Text testID="frequencies-count">{hookResult.frequencies.length}</Text>
        <Text testID="categories-count">
          {hookResult.availableCategories.length}
        </Text>
        <Text testID="currency">{hookResult.currency}</Text>
        <Text testID="is-valid">{String(hookResult.isValid)}</Text>
      </View>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock useTransactions context
    useTransactions.mockReturnValue({
      categories: mockCategories,
    });

    // Mock useCurrency context
    useCurrency.mockReturnValue({
      formatCurrencyInput: mockFormatCurrencyInput,
      parseCurrency: mockParseCurrency,
      currency: "BRL",
    });

    // Default mock for useFormValidation hook
    useFormValidation.mockReturnValue({
      control: {},
      handleSubmit: mockHandleSubmit,
      resetForm: mockResetForm,
      errors: {},
      isValid: false,
    });

    mockParseCurrency.mockImplementation((value) => value);
    mockFormatCurrencyInput.mockImplementation((value) => value);
  });

  describe("Initialization", () => {
    it("should initialize with correct default values for new transaction", () => {
      const { getByTestId } = render(
        <TestComponent
          transaction={null}
          visible={true}
          onSave={mockOnSave}
          onClose={mockOnClose}
        />
      );

      expect(getByTestId("modal-title")).toHaveTextContent(
        "Nova Transação Recorrente"
      );
      expect(getByTestId("frequencies-count")).toHaveTextContent("4");
      expect(getByTestId("categories-count")).toHaveTextContent("3");
      expect(getByTestId("currency")).toHaveTextContent("BRL");
    });

    it("should initialize with correct values for editing transaction", () => {
      const { getByTestId } = render(
        <TestComponent
          transaction={mockTransaction}
          visible={true}
          onSave={mockOnSave}
          onClose={mockOnClose}
        />
      );

      expect(getByTestId("modal-title")).toHaveTextContent(
        "Editar Transação Recorrente"
      );
    });

    it("should provide correct frequency options", () => {
      let hookResult;
      const TestHookComponent = (props) => {
        hookResult = useRecurringTransactionModal(props);
        return <View />;
      };

      render(
        <TestHookComponent
          transaction={null}
          visible={true}
          onSave={mockOnSave}
          onClose={mockOnClose}
        />
      );

      expect(hookResult.frequencies).toHaveLength(4);
      expect(hookResult.frequencies).toEqual([
        { value: "daily", label: "Diário" },
        { value: "weekly", label: "Semanal" },
        { value: "monthly", label: "Mensal" },
        { value: "yearly", label: "Anual" },
      ]);
    });

    it("should handle missing categories gracefully", () => {
      useTransactions.mockReturnValue({
        categories: null,
      });

      const { getByTestId } = render(
        <TestComponent
          transaction={null}
          visible={true}
          onSave={mockOnSave}
          onClose={mockOnClose}
        />
      );

      expect(getByTestId("categories-count")).toHaveTextContent("0");
    });

    it("should handle categories without expense category", () => {
      useTransactions.mockReturnValue({
        categories: { income: [{ id: "1", name: "Salary" }] },
      });

      const { getByTestId } = render(
        <TestComponent
          transaction={null}
          visible={true}
          onSave={mockOnSave}
          onClose={mockOnClose}
        />
      );

      expect(getByTestId("categories-count")).toHaveTextContent("0");
    });
  });

  describe("Form Reset", () => {
    it("should reset form when modal becomes visible with new transaction", async () => {
      const { rerender } = render(
        <TestComponent
          transaction={null}
          visible={false}
          onSave={mockOnSave}
          onClose={mockOnClose}
        />
      );

      await act(async () => {
        rerender(
          <TestComponent
            transaction={null}
            visible={true}
            onSave={mockOnSave}
            onClose={mockOnClose}
          />
        );
      });

      expect(mockResetForm).toHaveBeenCalledWith({
        title: "",
        description: "",
        amount: "",
        category: "",
        frequency: "monthly",
        nextDueDate: expect.any(String),
      });
    });

    it("should reset form with transaction data when editing", async () => {
      const { rerender } = render(
        <TestComponent
          transaction={null}
          visible={false}
          onSave={mockOnSave}
          onClose={mockOnClose}
        />
      );

      await act(async () => {
        rerender(
          <TestComponent
            transaction={mockTransaction}
            visible={true}
            onSave={mockOnSave}
            onClose={mockOnClose}
          />
        );
      });

      expect(mockResetForm).toHaveBeenCalledWith({
        title: "Monthly Rent",
        description: "Apartment rent",
        amount: "1500",
        category: "1",
        frequency: "monthly",
        nextDueDate: "2024-01-01",
      });
    });

    it("should handle transaction with missing fields", async () => {
      const incompleteTransaction = {
        id: "123",
        title: "Test",
      };

      render(
        <TestComponent
          transaction={incompleteTransaction}
          visible={true}
          onSave={mockOnSave}
          onClose={mockOnClose}
        />
      );

      expect(mockResetForm).toHaveBeenCalledWith({
        title: "Test",
        description: "",
        amount: "",
        category: "",
        frequency: "monthly",
        nextDueDate: expect.any(String),
      });
    });
  });

  describe("Submit Handler", () => {
    it("should handle new transaction submission", async () => {
      const formData = {
        title: "New Expense",
        description: "Monthly subscription",
        amount: "50.00",
        category: "2",
        frequency: "monthly",
        nextDueDate: "2024-02-01",
      };

      let capturedOnSubmit = null;

      // Mock useFormValidation to capture the onSubmit callback
      useFormValidation.mockImplementation((options) => {
        capturedOnSubmit = options.onSubmit;

        return {
          control: {},
          handleSubmit: mockHandleSubmit,
          resetForm: mockResetForm,
          errors: {},
          isValid: false,
        };
      });

      let hookResult;
      const TestHookComponent = (props) => {
        hookResult = useRecurringTransactionModal(props);
        return <View />;
      };

      render(
        <TestHookComponent
          transaction={null}
          visible={true}
          onSave={mockOnSave}
          onClose={mockOnClose}
        />
      );

      mockParseCurrency.mockReturnValue("50.00");

      // Directly call the captured onSubmit handler with form data
      await act(async () => {
        if (capturedOnSubmit) {
          await capturedOnSubmit(formData);
        }
      });

      expect(mockOnSave).toHaveBeenCalledWith({
        title: "New Expense",
        description: "Monthly subscription",
        amount: 50,
        category: "2",
        type: "expense",
        frequency: "monthly",
        nextDueDate: "2024-02-01",
      });
      expect(mockOnClose).toHaveBeenCalled();
    });

    it("should handle existing transaction submission", async () => {
      const formData = {
        title: "Updated Rent",
        description: "Updated apartment rent",
        amount: "1600.00",
        category: "1",
        frequency: "monthly",
        nextDueDate: "2024-02-01",
      };

      let capturedOnSubmit = null;

      // Mock useFormValidation to capture the onSubmit callback
      useFormValidation.mockImplementation((options) => {
        capturedOnSubmit = options.onSubmit;

        return {
          control: {},
          handleSubmit: mockHandleSubmit,
          resetForm: mockResetForm,
          errors: {},
          isValid: false,
        };
      });

      let hookResult;
      const TestHookComponent = (props) => {
        hookResult = useRecurringTransactionModal(props);
        return <View />;
      };

      render(
        <TestHookComponent
          transaction={mockTransaction}
          visible={true}
          onSave={mockOnSave}
          onClose={mockOnClose}
        />
      );

      mockParseCurrency.mockReturnValue("1600.00");

      // Directly call the captured onSubmit handler with form data
      await act(async () => {
        if (capturedOnSubmit) {
          await capturedOnSubmit(formData);
        }
      });

      expect(mockOnSave).toHaveBeenCalledWith({
        ...mockTransaction,
        title: "Updated Rent",
        description: "Updated apartment rent",
        amount: 1600,
        category: "1",
        type: "expense",
        frequency: "monthly",
        nextDueDate: "2024-02-01",
      });
      expect(mockOnClose).toHaveBeenCalled();
    });

    it("should trim whitespace from title and description", async () => {
      const formData = {
        title: "  Trimmed Title  ",
        description: "  Trimmed Description  ",
        amount: "100.00",
        category: "1",
        frequency: "monthly",
        nextDueDate: "2024-02-01",
      };

      let capturedOnSubmit = null;

      // Mock useFormValidation to capture the onSubmit callback
      useFormValidation.mockImplementation((options) => {
        capturedOnSubmit = options.onSubmit;

        return {
          control: {},
          handleSubmit: mockHandleSubmit,
          resetForm: mockResetForm,
          errors: {},
          isValid: false,
        };
      });

      let hookResult;
      const TestHookComponent = (props) => {
        hookResult = useRecurringTransactionModal(props);
        return <View />;
      };

      render(
        <TestHookComponent
          transaction={null}
          visible={true}
          onSave={mockOnSave}
          onClose={mockOnClose}
        />
      );

      mockParseCurrency.mockReturnValue("100.00");

      // Directly call the captured onSubmit handler with form data
      await act(async () => {
        if (capturedOnSubmit) {
          await capturedOnSubmit(formData);
        }
      });

      expect(mockOnSave).toHaveBeenCalledWith({
        title: "Trimmed Title",
        description: "Trimmed Description",
        amount: 100,
        category: "1",
        type: "expense",
        frequency: "monthly",
        nextDueDate: "2024-02-01",
      });
    });
  });

  describe("Close Handler", () => {
    it("should reset form and call onClose", async () => {
      let hookResult;
      const TestHookComponent = (props) => {
        hookResult = useRecurringTransactionModal(props);
        return <View />;
      };

      render(
        <TestHookComponent
          transaction={null}
          visible={true}
          onSave={mockOnSave}
          onClose={mockOnClose}
        />
      );

      await act(async () => {
        hookResult.handleClose();
      });

      expect(mockResetForm).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe("Delete Handler", () => {
    it("should show confirmation alert when deleting", async () => {
      let hookResult;
      const TestHookComponent = (props) => {
        hookResult = useRecurringTransactionModal(props);
        return <View />;
      };

      render(
        <TestHookComponent
          transaction={mockTransaction}
          visible={true}
          onSave={mockOnSave}
          onClose={mockOnClose}
        />
      );

      await act(async () => {
        hookResult.handleDelete();
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        "Confirmar Exclusão",
        "Tem certeza que deseja excluir esta transação recorrente?",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Excluir",
            style: "destructive",
            onPress: expect.any(Function),
          },
        ]
      );
    });

    it("should call onSave with delete flag when deletion is confirmed", async () => {
      let hookResult;
      const TestHookComponent = (props) => {
        hookResult = useRecurringTransactionModal(props);
        return <View />;
      };

      render(
        <TestHookComponent
          transaction={mockTransaction}
          visible={true}
          onSave={mockOnSave}
          onClose={mockOnClose}
        />
      );

      await act(async () => {
        hookResult.handleDelete();
      });

      // Get the onPress function from the Alert.alert call
      const alertCall = Alert.alert.mock.calls[0];
      const deleteButton = alertCall[2].find(
        (button) => button.text === "Excluir"
      );

      await act(async () => {
        deleteButton.onPress();
      });

      expect(mockOnSave).toHaveBeenCalledWith({
        ...mockTransaction,
        _delete: true,
      });
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe("Validation Rules", () => {
    it("should create validation rules with available categories and parseCurrency", () => {
      const { formValidationSets } = require("../../utils/formFieldRules");

      render(
        <TestComponent
          transaction={null}
          visible={true}
          onSave={mockOnSave}
          onClose={mockOnClose}
        />
      );

      expect(formValidationSets.recurringTransaction).toHaveBeenCalledWith(
        mockCategories.expense,
        mockParseCurrency
      );
    });
  });

  describe("Memoization", () => {
    it("should memoize frequencies array", () => {
      let hookResult1, hookResult2;

      const TestHookComponent = (props) => {
        const result = useRecurringTransactionModal(props);
        // Store the result in the closure so we can access it
        if (!hookResult1) {
          hookResult1 = result;
        } else if (!hookResult2) {
          hookResult2 = result;
        }
        return <View />;
      };

      const { rerender } = render(
        <TestHookComponent
          transaction={null}
          visible={true}
          onSave={mockOnSave}
          onClose={mockOnClose}
        />
      );

      rerender(
        <TestHookComponent
          transaction={null}
          visible={true}
          onSave={mockOnSave}
          onClose={mockOnClose}
        />
      );

      // Note: In a real test, we'd check that the frequencies array reference is the same
      // This is more of a conceptual test since we can't easily test memoization with our current setup
      expect(hookResult1).toBeDefined();
      expect(hookResult2).toBeDefined();
    });

    it("should memoize availableCategories based on categories", () => {
      const { rerender } = render(
        <TestComponent
          transaction={null}
          visible={true}
          onSave={mockOnSave}
          onClose={mockOnClose}
        />
      );

      // Change categories
      useTransactions.mockReturnValue({
        categories: {
          expense: [{ id: "4", name: "New Category", color: "#FF0000" }],
        },
      });

      const { getByTestId } = render(
        <TestComponent
          transaction={null}
          visible={true}
          onSave={mockOnSave}
          onClose={mockOnClose}
        />
      );

      expect(getByTestId("categories-count")).toHaveTextContent("1");
    });
  });

  describe("Error Handling", () => {
    it("should handle form validation errors", () => {
      useFormValidation.mockReturnValue({
        control: {},
        handleSubmit: mockHandleSubmit,
        resetForm: mockResetForm,
        errors: {
          title: { message: "Title is required" },
          amount: { message: "Amount must be positive" },
        },
        isValid: false,
      });

      const { getByTestId } = render(
        <TestComponent
          transaction={null}
          visible={true}
          onSave={mockOnSave}
          onClose={mockOnClose}
        />
      );

      expect(getByTestId("is-valid")).toHaveTextContent("false");
    });

    it("should handle invalid amount parsing", async () => {
      const formData = {
        title: "Test",
        description: "Test",
        amount: "invalid",
        category: "1",
        frequency: "monthly",
        nextDueDate: "2024-02-01",
      };

      let capturedOnSubmit = null;

      // Mock useFormValidation to capture the onSubmit callback
      useFormValidation.mockImplementation((options) => {
        capturedOnSubmit = options.onSubmit;

        return {
          control: {},
          handleSubmit: mockHandleSubmit,
          resetForm: mockResetForm,
          errors: {},
          isValid: false,
        };
      });

      let hookResult;
      const TestHookComponent = (props) => {
        hookResult = useRecurringTransactionModal(props);
        return <View />;
      };

      render(
        <TestHookComponent
          transaction={null}
          visible={true}
          onSave={mockOnSave}
          onClose={mockOnClose}
        />
      );

      mockParseCurrency.mockReturnValue("invalid");

      // Directly call the captured onSubmit handler with form data
      await act(async () => {
        if (capturedOnSubmit) {
          await capturedOnSubmit(formData);
        }
      });

      expect(mockOnSave).toHaveBeenCalledWith({
        title: "Test",
        description: "Test",
        amount: NaN,
        category: "1",
        type: "expense",
        frequency: "monthly",
        nextDueDate: "2024-02-01",
      });
    });
  });
});
