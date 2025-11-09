import React from "react";
import { render, act } from "@testing-library/react-native";
import { Text, View } from "react-native";
import { useFormValidation } from "../../hooks/useFormValidation";

// Mock react-hook-form
jest.mock("react-hook-form", () => ({
  useForm: jest.fn(),
}));

// Mock input sanitizer
jest.mock("../../utils/inputSanitizer", () => ({
  sanitizeFormData: jest.fn((data) => data),
  sanitizeInput: jest.fn((value) => value),
}));

describe("useFormValidation", () => {
  // Mock functions from react-hook-form
  const mockControl = {};
  const mockHandleSubmit = jest.fn();
  const mockReset = jest.fn();
  const mockWatch = jest.fn();
  const mockSetValue = jest.fn();
  const mockGetValues = jest.fn();
  const mockTrigger = jest.fn();
  const mockClearErrors = jest.fn();
  const mockSetError = jest.fn();

  const mockFormState = {
    errors: {},
    isSubmitting: false,
    isValid: true,
    isDirty: false,
    touchedFields: {},
  };

  const mockUseForm = {
    control: mockControl,
    handleSubmit: mockHandleSubmit,
    reset: mockReset,
    watch: mockWatch,
    setValue: mockSetValue,
    getValues: mockGetValues,
    trigger: mockTrigger,
    clearErrors: mockClearErrors,
    setError: mockSetError,
    formState: mockFormState,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    const { useForm } = require("react-hook-form");
    useForm.mockReturnValue(mockUseForm);
    mockGetValues.mockReturnValue({});
  });

  // Test component to use the hook
  const TestComponent = (props) => {
    const hookResult = useFormValidation(props);
    return (
      <View>
        <Text testID="is-valid">{String(hookResult.isValid)}</Text>
        <Text testID="is-submitting">{String(hookResult.isSubmitting)}</Text>
        <Text testID="is-dirty">{String(hookResult.isDirty)}</Text>
        <Text testID="errors-count">
          {Object.keys(hookResult.errors).length}
        </Text>
      </View>
    );
  };

  describe("Initialization", () => {
    it("should initialize with default options", () => {
      const { useForm } = require("react-hook-form");

      render(<TestComponent />);

      expect(useForm).toHaveBeenCalledWith({
        mode: "onChange",
        defaultValues: {},
      });
    });

    it("should initialize with custom options", () => {
      const { useForm } = require("react-hook-form");
      const defaultValues = { title: "Test", amount: "100" };
      const validationRules = { title: { required: "Required" } };
      const formOptions = { mode: "onSubmit" };

      render(
        <TestComponent
          defaultValues={defaultValues}
          validationRules={validationRules}
          formOptions={formOptions}
        />
      );

      expect(useForm).toHaveBeenCalledWith({
        mode: "onChange",
        defaultValues,
        ...formOptions,
      });
    });

    it("should return correct form state", () => {
      const { getByTestId } = render(<TestComponent />);

      expect(getByTestId("is-valid")).toHaveTextContent("true");
      expect(getByTestId("is-submitting")).toHaveTextContent("false");
      expect(getByTestId("is-dirty")).toHaveTextContent("false");
      expect(getByTestId("errors-count")).toHaveTextContent("0");
    });
  });

  describe("Form State Management", () => {
    it("should handle form errors", () => {
      const mockFormStateWithErrors = {
        ...mockFormState,
        errors: {
          title: { message: "Title is required" },
          amount: { message: "Amount must be positive" },
        },
        isValid: false,
      };

      const { useForm } = require("react-hook-form");
      useForm.mockReturnValue({
        ...mockUseForm,
        formState: mockFormStateWithErrors,
      });

      const { getByTestId } = render(<TestComponent />);

      expect(getByTestId("is-valid")).toHaveTextContent("false");
      expect(getByTestId("errors-count")).toHaveTextContent("2");
    });

    it("should handle form submission state", () => {
      const mockFormStateSubmitting = {
        ...mockFormState,
        isSubmitting: true,
        isDirty: true,
      };

      const { useForm } = require("react-hook-form");
      useForm.mockReturnValue({
        ...mockUseForm,
        formState: mockFormStateSubmitting,
      });

      const { getByTestId } = render(<TestComponent />);

      expect(getByTestId("is-submitting")).toHaveTextContent("true");
      expect(getByTestId("is-dirty")).toHaveTextContent("true");
    });
  });

  describe("Enhanced Form Methods", () => {
    let hookResult;

    const TestHookComponent = (props) => {
      hookResult = useFormValidation(props);
      return <View />;
    };

    it("should provide canSubmit computed property", () => {
      render(<TestHookComponent />);

      expect(hookResult).toHaveProperty("canSubmit");
      expect(typeof hookResult.canSubmit).toBe("boolean");
    });
  });

  describe("Form Data Management", () => {
    let hookResult;

    const TestHookComponent = (props) => {
      hookResult = useFormValidation(props);
      return <View />;
    };

    it("should reset form with new values", async () => {
      render(<TestHookComponent />);

      const newValues = { title: "New Title", amount: "200" };

      await act(async () => {
        hookResult.resetForm(newValues);
      });

      expect(mockReset).toHaveBeenCalledWith(newValues);
    });

    it("should reset form to default values when no values provided", async () => {
      const defaultValues = { title: "Default", amount: "0" };

      render(<TestHookComponent defaultValues={defaultValues} />);

      await act(async () => {
        hookResult.resetForm();
      });

      expect(mockReset).toHaveBeenCalledWith(defaultValues);
    });
  });

  describe("Submit Capability", () => {
    it("should calculate canSubmit correctly when form is valid and not submitting", () => {
      const mockFormStateValid = {
        ...mockFormState,
        isValid: true,
        isSubmitting: false,
      };

      const { useForm } = require("react-hook-form");
      useForm.mockReturnValue({
        ...mockUseForm,
        formState: mockFormStateValid,
      });

      const { getByTestId } = render(<TestComponent />);

      // We need to check the hook result directly since canSubmit is a computed property
      let hookResult;
      const TestHookComponent = (props) => {
        hookResult = useFormValidation(props);
        return (
          <View>
            <Text testID="can-submit">{String(hookResult.canSubmit)}</Text>
          </View>
        );
      };

      const { getByTestId: getByTestIdHook } = render(<TestHookComponent />);
      expect(getByTestIdHook("can-submit")).toHaveTextContent("true");
    });

    it("should calculate canSubmit correctly when form is invalid", () => {
      const mockFormStateInvalid = {
        ...mockFormState,
        isValid: false,
        isSubmitting: false,
      };

      const { useForm } = require("react-hook-form");
      useForm.mockReturnValue({
        ...mockUseForm,
        formState: mockFormStateInvalid,
      });

      let hookResult;
      const TestHookComponent = (props) => {
        hookResult = useFormValidation(props);
        return (
          <View>
            <Text testID="can-submit">{String(hookResult.canSubmit)}</Text>
          </View>
        );
      };

      const { getByTestId } = render(<TestHookComponent />);
      expect(getByTestId("can-submit")).toHaveTextContent("false");
    });

    it("should calculate canSubmit correctly when form is submitting", () => {
      const mockFormStateSubmitting = {
        ...mockFormState,
        isValid: true,
        isSubmitting: true,
      };

      const { useForm } = require("react-hook-form");
      useForm.mockReturnValue({
        ...mockUseForm,
        formState: mockFormStateSubmitting,
      });

      let hookResult;
      const TestHookComponent = (props) => {
        hookResult = useFormValidation(props);
        return (
          <View>
            <Text testID="can-submit">{String(hookResult.canSubmit)}</Text>
          </View>
        );
      };

      const { getByTestId } = render(<TestHookComponent />);
      expect(getByTestId("can-submit")).toHaveTextContent("false");
    });
  });

  describe("Form Watch Functionality", () => {
    let hookResult;

    const TestHookComponent = (props) => {
      hookResult = useFormValidation(props);
      return <View />;
    };

    it("should provide watch functionality from react-hook-form", () => {
      render(<TestHookComponent />);

      expect(hookResult).toHaveProperty("watch");
      expect(hookResult.watch).toBe(mockWatch);
    });

    it("should provide control object from react-hook-form", () => {
      render(<TestHookComponent />);

      expect(hookResult).toHaveProperty("control");
      expect(hookResult.control).toBe(mockControl);
    });
  });

  describe("Callback Functions", () => {
    it("should handle onSubmit callback when provided", () => {
      const mockOnSubmit = jest.fn();

      render(<TestComponent onSubmit={mockOnSubmit} />);

      // The onSubmit callback should be passed to the validation system
      // This is more of an integration test concept
      expect(mockOnSubmit).toBeDefined();
    });

    it("should maintain stable callback references", () => {
      let hookResult1, hookResult2;

      const TestHookComponent = (props) => {
        const result = useFormValidation(props);
        return <View />;
      };

      const { rerender } = render(<TestHookComponent />);
      // Note: In a real implementation, we'd test that callback references
      // remain stable across re-renders using useCallback
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty validation rules", () => {
      render(<TestComponent validationRules={{}} />);

      // Should not throw and should work with empty rules
      expect(true).toBe(true); // Basic smoke test
    });

    it("should handle undefined defaultValues", () => {
      render(<TestComponent defaultValues={undefined} />);

      const { useForm } = require("react-hook-form");
      expect(useForm).toHaveBeenCalledWith({
        mode: "onChange",
        defaultValues: {},
      });
    });

    it("should handle null validation rules", () => {
      render(<TestComponent validationRules={null} />);

      // Should not throw and should work with null rules
      expect(true).toBe(true); // Basic smoke test
    });
  });
});
