import { renderHook, act, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";
import { useRegister } from "../../hooks/useRegister";
import { useAuth } from "../../contexts/AuthContext";
import { useFormValidation } from "../../hooks/useFormValidation";

// Mock dependencies
jest.mock("../../contexts/AuthContext");
jest.mock("../../hooks/useFormValidation");
jest.mock("react-native/Libraries/Alert/Alert", () => ({
  alert: jest.fn(),
}));

describe("useRegister", () => {
  const mockRegister = jest.fn();
  const mockControl = { register: jest.fn() };
  const mockHandleSubmit = jest.fn();
  const mockErrors = {};
  const mockWatch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock useAuth
    useAuth.mockReturnValue({
      register: mockRegister,
    });

    // Mock useFormValidation
    useFormValidation.mockReturnValue({
      control: mockControl,
      handleSubmit: mockHandleSubmit,
      errors: mockErrors,
      watch: mockWatch,
    });

    // Default watch behavior
    mockWatch.mockReturnValue("password123");
  });

  describe("Hook Initialization", () => {
    it("should initialize with correct default values", () => {
      const { result } = renderHook(() => useRegister());

      expect(result.current.control).toBe(mockControl);
      expect(result.current.errors).toBe(mockErrors);
      expect(result.current.loading).toBe(false);
      expect(result.current.handleSubmit).toBe(mockHandleSubmit);
      expect(result.current.validationRules).toBeDefined();
    });

    it("should call useFormValidation with correct configuration", () => {
      renderHook(() => useRegister());

      expect(useFormValidation).toHaveBeenCalledWith({
        defaultValues: {
          email: "",
          password: "",
          confirmPassword: "",
        },
        onSubmit: expect.any(Function),
      });
    });

    it("should call useAuth to get register function", () => {
      renderHook(() => useRegister());

      expect(useAuth).toHaveBeenCalled();
    });

    it("should watch password field for validation", () => {
      renderHook(() => useRegister());

      expect(mockWatch).toHaveBeenCalledWith("password");
    });
  });

  describe("Validation Rules", () => {
    it("should generate validation rules based on password value", () => {
      const passwordValue = "testpass123";
      mockWatch.mockReturnValue(passwordValue);

      const { result } = renderHook(() => useRegister());

      // Compare structure, not function references
      expect(result.current.validationRules).toHaveProperty("email");
      expect(result.current.validationRules).toHaveProperty("password");
      expect(result.current.validationRules).toHaveProperty("confirmPassword");
      expect(
        result.current.validationRules.confirmPassword.validate
      ).toBeDefined();
    });

    it("should update validation rules when password changes", () => {
      mockWatch.mockReturnValue("password1");

      const { result, rerender } = renderHook(() => useRegister());

      const firstRules = result.current.validationRules;

      mockWatch.mockReturnValue("password2");
      rerender();

      const secondRules = result.current.validationRules;

      // Rules should be regenerated with new password value
      expect(firstRules).not.toBe(secondRules);
    });

    it("should have email, password, and confirmPassword rules", () => {
      const { result } = renderHook(() => useRegister());

      expect(result.current.validationRules).toHaveProperty("email");
      expect(result.current.validationRules).toHaveProperty("password");
      expect(result.current.validationRules).toHaveProperty("confirmPassword");
    });
  });

  describe("Registration Submission", () => {
    it("should handle successful registration", async () => {
      mockRegister.mockResolvedValue({ success: true });

      renderHook(() => useRegister());

      // Get the onSubmit function that was passed to useFormValidation
      const onSubmitCall = useFormValidation.mock.calls[0][0];
      const onSubmit = onSubmitCall.onSubmit;

      const testData = {
        email: "test@example.com",
        password: "password123",
        confirmPassword: "password123",
      };

      await act(async () => {
        await onSubmit(testData);
      });

      expect(mockRegister).toHaveBeenCalledWith(
        "test@example.com",
        "password123"
      );
      expect(Alert.alert).toHaveBeenCalledWith(
        "Sucesso",
        "Conta criada com sucesso!"
      );
    });

    it("should handle registration failure with error message", async () => {
      const errorMessage = "Email already exists";
      mockRegister.mockResolvedValue({
        success: false,
        error: errorMessage,
      });

      renderHook(() => useRegister());

      const onSubmitCall = useFormValidation.mock.calls[0][0];
      const onSubmit = onSubmitCall.onSubmit;

      const testData = {
        email: "existing@example.com",
        password: "password123",
        confirmPassword: "password123",
      };

      await act(async () => {
        await onSubmit(testData);
      });

      expect(mockRegister).toHaveBeenCalledWith(
        "existing@example.com",
        "password123"
      );
      expect(Alert.alert).toHaveBeenCalledWith(
        "Erro de Registro",
        errorMessage
      );
    });

    it("should handle unexpected errors during registration", async () => {
      mockRegister.mockRejectedValue(new Error("Network error"));

      renderHook(() => useRegister());

      const onSubmitCall = useFormValidation.mock.calls[0][0];
      const onSubmit = onSubmitCall.onSubmit;

      const testData = {
        email: "test@example.com",
        password: "password123",
        confirmPassword: "password123",
      };

      await act(async () => {
        await onSubmit(testData);
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        "Erro",
        "Ocorreu um erro inesperado. Tente novamente."
      );
    });

    it("should set loading state correctly during registration", async () => {
      let resolveRegister;
      const registerPromise = new Promise((resolve) => {
        resolveRegister = resolve;
      });
      mockRegister.mockReturnValue(registerPromise);

      const { result } = renderHook(() => useRegister());

      const onSubmitCall = useFormValidation.mock.calls[0][0];
      const onSubmit = onSubmitCall.onSubmit;

      const testData = {
        email: "test@example.com",
        password: "password123",
        confirmPassword: "password123",
      };

      // Start registration
      let submitPromise;
      act(() => {
        submitPromise = onSubmit(testData);
      });

      // Loading should be true during registration
      await waitFor(() => {
        expect(result.current.loading).toBe(true);
      });

      // Resolve registration
      await act(async () => {
        resolveRegister({ success: true });
        await submitPromise;
      });

      // Loading should be false after registration completes
      expect(result.current.loading).toBe(false);
    });

    it("should set loading to false even if registration fails", async () => {
      mockRegister.mockRejectedValue(new Error("Network error"));

      const { result } = renderHook(() => useRegister());

      const onSubmitCall = useFormValidation.mock.calls[0][0];
      const onSubmit = onSubmitCall.onSubmit;

      const testData = {
        email: "test@example.com",
        password: "password123",
        confirmPassword: "password123",
      };

      await act(async () => {
        await onSubmit(testData);
      });

      expect(result.current.loading).toBe(false);
    });

    it("should not show success alert on failure", async () => {
      mockRegister.mockResolvedValue({
        success: false,
        error: "Registration failed",
      });

      renderHook(() => useRegister());

      const onSubmitCall = useFormValidation.mock.calls[0][0];
      const onSubmit = onSubmitCall.onSubmit;

      const testData = {
        email: "test@example.com",
        password: "password123",
        confirmPassword: "password123",
      };

      await act(async () => {
        await onSubmit(testData);
      });

      const successAlertCalls = Alert.alert.mock.calls.filter(
        (call) => call[0] === "Sucesso"
      );
      expect(successAlertCalls).toHaveLength(0);
    });
  });

  describe("Hook Dependencies", () => {
    it("should update onSubmit when register function changes", () => {
      const { rerender } = renderHook(() => useRegister());

      const firstCall = useFormValidation.mock.calls[0][0];
      const firstOnSubmit = firstCall.onSubmit;

      // Change the register mock
      const newMockRegister = jest.fn();
      useAuth.mockReturnValue({ register: newMockRegister });

      rerender();

      const secondCall = useFormValidation.mock.calls[1][0];
      const secondOnSubmit = secondCall.onSubmit;

      // onSubmit should be different when register changes
      expect(firstOnSubmit).not.toBe(secondOnSubmit);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty form data", async () => {
      mockRegister.mockResolvedValue({ success: true });

      const { result } = renderHook(() => useRegister());

      const onSubmitCall = useFormValidation.mock.calls[0][0];
      const onSubmit = onSubmitCall.onSubmit;

      const testData = {
        email: "",
        password: "",
        confirmPassword: "",
      };

      await act(async () => {
        await onSubmit(testData);
      });

      expect(mockRegister).toHaveBeenCalledWith("", "");
    });

    it("should handle mismatched passwords in data", async () => {
      mockRegister.mockResolvedValue({ success: true });

      renderHook(() => useRegister());

      const onSubmitCall = useFormValidation.mock.calls[0][0];
      const onSubmit = onSubmitCall.onSubmit;

      const testData = {
        email: "test@example.com",
        password: "password123",
        confirmPassword: "different123",
      };

      // Even though passwords don't match, onSubmit still attempts registration
      // (validation should prevent this from happening in practice)
      await act(async () => {
        await onSubmit(testData);
      });

      expect(mockRegister).toHaveBeenCalledWith(
        "test@example.com",
        "password123"
      );
    });

    it("should handle null/undefined success in register result", async () => {
      mockRegister.mockResolvedValue({ success: null, error: "Error" });

      renderHook(() => useRegister());

      const onSubmitCall = useFormValidation.mock.calls[0][0];
      const onSubmit = onSubmitCall.onSubmit;

      const testData = {
        email: "test@example.com",
        password: "password123",
        confirmPassword: "password123",
      };

      await act(async () => {
        await onSubmit(testData);
      });

      expect(Alert.alert).toHaveBeenCalledWith("Erro de Registro", "Error");
    });

    it("should handle empty password value from watch", () => {
      mockWatch.mockReturnValue("");

      const { result } = renderHook(() => useRegister());

      // Verify structure of validation rules
      expect(result.current.validationRules).toHaveProperty("email");
      expect(result.current.validationRules).toHaveProperty("password");
      expect(result.current.validationRules).toHaveProperty("confirmPassword");
      expect(
        result.current.validationRules.confirmPassword.validate
      ).toBeDefined();
    });
  });
});
