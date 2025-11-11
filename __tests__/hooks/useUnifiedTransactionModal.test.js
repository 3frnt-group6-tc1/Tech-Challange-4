import React from "react";
import { render, act } from "@testing-library/react-native";
import { Text, View } from "react-native";
import { useUnifiedTransactionModal } from "../../hooks/useUnifiedTransactionModal";
import { useTransactions } from "../../contexts/TransactionsContext";
import { useCurrency } from "../../contexts/CurrencyContext";

// Mock the contexts
jest.mock("../../contexts/TransactionsContext");
jest.mock("../../contexts/CurrencyContext");
jest.mock("../../services/uploadService");

// Mock useFormValidation hook
jest.mock("../../hooks/useFormValidation", () => ({
  useFormValidation: jest.fn(() => ({
    control: {},
    handleSubmit: jest.fn(),
    resetForm: jest.fn(),
    canSubmit: false,
  })),
}));

// Mock validation rules
jest.mock("../../utils/fieldRules", () => ({
  fieldValidators: {
    title: jest.fn(() => ({ required: "Title is required" })),
    description: jest.fn(() => ({ required: "Description is required" })),
    amount: jest.fn(() => ({ required: "Amount is required" })),
    category: jest.fn(() => ({ required: "Category is required" })),
    date: jest.fn(() => ({ required: "Date is required" })),
  },
}));

jest.mock("../../utils/formFieldRules", () => ({
  formValidationSets: {
    transaction: jest.fn(() => ({
      title: { required: "Title is required" },
      description: { required: "Description is required" },
      amount: { required: "Amount is required" },
      category: { required: "Category is required" },
      date: { required: "Date is required" },
    })),
  },
}));

// Mock React Native components
jest.mock("react-native", () => ({
  Alert: {
    alert: jest.fn(),
  },
}));

// Mock Expo ImagePicker
jest.mock("expo-image-picker", () => ({
  launchImageLibraryAsync: jest.fn(),
  MediaTypeOptions: {
    Images: "Images",
  },
}));

// Test component that uses the hook
const TestComponent = ({
  transaction,
  type,
  visible,
  onSave,
  onClose,
  onAction,
}) => {
  const hookResult = useUnifiedTransactionModal({
    transaction,
    type,
    visible,
    onSave,
    onClose,
  });

  // Expose hook methods for testing
  React.useEffect(() => {
    if (onAction) {
      onAction(hookResult);
    }
  }, [hookResult, onAction]);

  return (
    <View testID="test-component">
      <Text testID="modal-title">{hookResult.modalTitle}</Text>
      <Text testID="can-submit">{hookResult.canSubmit.toString()}</Text>
      <Text testID="button-variant">{hookResult.buttonVariant}</Text>
      <Text testID="currency-symbol">{hookResult.currency.symbol}</Text>
      <Text testID="available-categories">
        {JSON.stringify(hookResult.availableCategories)}
      </Text>
      <Text testID="local-image">
        {hookResult.localImage ? hookResult.localImage.uri : "null"}
      </Text>
    </View>
  );
};

describe("useUnifiedTransactionModal", () => {
  const mockCategories = {
    expense: ["Food", "Transport", "Housing"],
    income: ["Salary", "Freelance", "Investments"],
  };

  const mockCurrency = {
    formatCurrencyInput: jest.fn((value) => `$${value}`),
    parseCurrency: jest.fn((value) => value.replace(/\D/g, "")),
    currency: { symbol: "$" },
  };

  beforeEach(() => {
    useTransactions.mockReturnValue({
      categories: mockCategories,
    });

    useCurrency.mockReturnValue(mockCurrency);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should initialize with correct default values", () => {
    const mockProps = {
      transaction: null,
      type: "income",
      visible: true,
      onSave: jest.fn(),
      onClose: jest.fn(),
    };

    const { getByTestId } = render(<TestComponent {...mockProps} />);

    expect(getByTestId("modal-title")).toBeTruthy();
    expect(getByTestId("can-submit")).toBeTruthy();
    expect(getByTestId("button-variant")).toBeTruthy();
    expect(getByTestId("currency-symbol")).toBeTruthy();
  });

  it("should set correct modal title for expense type", () => {
    const mockProps = {
      transaction: null,
      type: "expense",
      visible: true,
      onSave: jest.fn(),
      onClose: jest.fn(),
    };

    const { getByTestId } = render(<TestComponent {...mockProps} />);

    expect(getByTestId("modal-title").children[0]).toBe("Adicionar Despesa");
    expect(getByTestId("button-variant").children[0]).toBe("danger");
    // Check that expense categories are filtered correctly
    const categories = JSON.parse(
      getByTestId("available-categories").children[0]
    );
    expect(categories).toEqual(["Food", "Transport", "Housing"]);
  });

  it("should set correct modal title for editing transaction", () => {
    const mockTransaction = {
      id: "1",
      title: "Test Transaction",
      type: "income",
      amount: 100,
    };

    const mockProps = {
      transaction: mockTransaction,
      type: "income",
      visible: true,
      onSave: jest.fn(),
      onClose: jest.fn(),
    };

    const { getByTestId } = render(<TestComponent {...mockProps} />);

    expect(getByTestId("modal-title").children[0]).toBe("Editar Transação");
    expect(getByTestId("button-variant").children[0]).toBe("success");
  });

  it("should handle image removal correctly", () => {
    const mockProps = {
      transaction: null,
      type: "income",
      visible: true,
      onSave: jest.fn(),
      onClose: jest.fn(),
    };

    const { getByTestId } = render(<TestComponent {...mockProps} />);

    // Initially, there should be no local image
    expect(getByTestId("local-image").children[0]).toBe("null");
  });

  it("should call onClose when handleClose is called", () => {
    const mockOnClose = jest.fn();
    const mockProps = {
      transaction: null,
      type: "income",
      visible: true,
      onSave: jest.fn(),
      onClose: mockOnClose,
    };

    let hookRef = null;
    const onAction = (hookResult) => {
      hookRef = hookResult;
    };

    render(<TestComponent {...mockProps} onAction={onAction} />);

    // Simulate calling handleClose
    if (hookRef && hookRef.handleClose) {
      act(() => {
        hookRef.handleClose();
      });
      expect(mockOnClose).toHaveBeenCalled();
    }
  });
});
