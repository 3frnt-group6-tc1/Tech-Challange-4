import { renderHook, act, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";
import { useLogin } from "../../hooks/useLogin";
import { useAuth } from "../../contexts/AuthContext";
import { useFormValidation } from "../../hooks/useFormValidation";
import { formValidationSets } from "../../utils/formFieldRules";

// Mock dependencies
jest.mock("../../contexts/AuthContext");
jest.mock("../../hooks/useFormValidation");
jest.mock("react-native/Libraries/Alert/Alert", () => ({
  alert: jest.fn(),
}));

describe("useLogin", () => {
  const mockLogin = jest.fn();
  const mockControl = { register: jest.fn() };
  const mockHandleSubmit = jest.fn();
  const mockErrors = {};

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock useAuth
    useAuth.mockReturnValue({
      login: mockLogin,
    });

    // Mock useFormValidation
    useFormValidation.mockReturnValue({
      control: mockControl,
      handleSubmit: mockHandleSubmit,
      errors: mockErrors,
    });
  });

  describe("Hook Initialization", () => {
    it("should initialize with correct default values", () => {
      const { result } = renderHook(() => useLogin());

      expect(result.current.control).toBe(mockControl);
      expect(result.current.errors).toBe(mockErrors);
      expect(result.current.loading).toBe(false);
      expect(result.current.handleSubmit).toBe(mockHandleSubmit);
      expect(result.current.validationRules).toEqual(formValidationSets.login);
    });

    it("should call useFormValidation with correct configuration", () => {
      renderHook(() => useLogin());

      expect(useFormValidation).toHaveBeenCalledWith({
        defaultValues: {
          email: "",
          password: "",
        },
        validationRules: formValidationSets.login,
        onSubmit: expect.any(Function),
      });
    });

    it("should call useAuth to get login function", () => {
      renderHook(() => useLogin());

      expect(useAuth).toHaveBeenCalled();
    });
  });

  describe("Login Submission", () => {
    it("should handle successful login", async () => {
      mockLogin.mockResolvedValue({ success: true });

      renderHook(() => useLogin());

      // Get the onSubmit function that was passed to useFormValidation
      const onSubmitCall = useFormValidation.mock.calls[0][0];
      const onSubmit = onSubmitCall.onSubmit;

      const testData = {
        email: "test@example.com",
        password: "password123",
      };

      await act(async () => {
        await onSubmit(testData);
      });

      expect(mockLogin).toHaveBeenCalledWith("test@example.com", "password123");
      expect(Alert.alert).not.toHaveBeenCalled();
    });

    it("should handle login failure with error message", async () => {
      const errorMessage = "Invalid credentials";
      mockLogin.mockResolvedValue({
        success: false,
        error: errorMessage,
      });

      renderHook(() => useLogin());

      const onSubmitCall = useFormValidation.mock.calls[0][0];
      const onSubmit = onSubmitCall.onSubmit;

      const testData = {
        email: "test@example.com",
        password: "wrongpassword",
      };

      await act(async () => {
        await onSubmit(testData);
      });

      expect(mockLogin).toHaveBeenCalledWith(
        "test@example.com",
        "wrongpassword"
      );
      expect(Alert.alert).toHaveBeenCalledWith("Erro de Login", errorMessage);
    });

    it("should handle unexpected errors during login", async () => {
      mockLogin.mockRejectedValue(new Error("Network error"));

      renderHook(() => useLogin());

      const onSubmitCall = useFormValidation.mock.calls[0][0];
      const onSubmit = onSubmitCall.onSubmit;

      const testData = {
        email: "test@example.com",
        password: "password123",
      };

      await act(async () => {
        await onSubmit(testData);
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        "Erro",
        "Ocorreu um erro inesperado. Tente novamente."
      );
    });

    it("should set loading state correctly during login", async () => {
      let resolveLogin;
      const loginPromise = new Promise((resolve) => {
        resolveLogin = resolve;
      });
      mockLogin.mockReturnValue(loginPromise);

      const { result } = renderHook(() => useLogin());

      const onSubmitCall = useFormValidation.mock.calls[0][0];
      const onSubmit = onSubmitCall.onSubmit;

      const testData = {
        email: "test@example.com",
        password: "password123",
      };

      // Start login
      let submitPromise;
      act(() => {
        submitPromise = onSubmit(testData);
      });

      // Loading should be true during login
      await waitFor(() => {
        expect(result.current.loading).toBe(true);
      });

      // Resolve login
      await act(async () => {
        resolveLogin({ success: true });
        await submitPromise;
      });

      // Loading should be false after login completes
      expect(result.current.loading).toBe(false);
    });

    it("should set loading to false even if login fails", async () => {
      mockLogin.mockRejectedValue(new Error("Network error"));

      const { result } = renderHook(() => useLogin());

      const onSubmitCall = useFormValidation.mock.calls[0][0];
      const onSubmit = onSubmitCall.onSubmit;

      const testData = {
        email: "test@example.com",
        password: "password123",
      };

      await act(async () => {
        await onSubmit(testData);
      });

      expect(result.current.loading).toBe(false);
    });
  });

  describe("Validation Rules", () => {
    it("should use login validation rules from formValidationSets", () => {
      const { result } = renderHook(() => useLogin());

      expect(result.current.validationRules).toEqual(formValidationSets.login);
      expect(result.current.validationRules).toHaveProperty("email");
      expect(result.current.validationRules).toHaveProperty("password");
    });
  });

  describe("Hook Dependencies", () => {
    it("should update onSubmit when login function changes", () => {
      const { rerender } = renderHook(() => useLogin());

      const firstCall = useFormValidation.mock.calls[0][0];
      const firstOnSubmit = firstCall.onSubmit;

      // Change the login mock
      const newMockLogin = jest.fn();
      useAuth.mockReturnValue({ login: newMockLogin });

      rerender();

      const secondCall = useFormValidation.mock.calls[1][0];
      const secondOnSubmit = secondCall.onSubmit;

      // onSubmit should be different when login changes
      expect(firstOnSubmit).not.toBe(secondOnSubmit);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty form data", async () => {
      mockLogin.mockResolvedValue({ success: true });

      const { result } = renderHook(() => useLogin());

      const onSubmitCall = useFormValidation.mock.calls[0][0];
      const onSubmit = onSubmitCall.onSubmit;

      const testData = {
        email: "",
        password: "",
      };

      await act(async () => {
        await onSubmit(testData);
      });

      expect(mockLogin).toHaveBeenCalledWith("", "");
    });

    it("should handle null/undefined success in login result", async () => {
      mockLogin.mockResolvedValue({ success: null, error: "Error" });

      const { result } = renderHook(() => useLogin());

      const onSubmitCall = useFormValidation.mock.calls[0][0];
      const onSubmit = onSubmitCall.onSubmit;

      const testData = {
        email: "test@example.com",
        password: "password123",
      };

      await act(async () => {
        await onSubmit(testData);
      });

      expect(Alert.alert).toHaveBeenCalledWith("Erro de Login", "Error");
    });
  });
});
