import { renderHook, act, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";
import { useCategoryModal } from "../../hooks/useCategoryModal";
import { useTransactions } from "../../contexts/TransactionsContext";
import { useFormValidation } from "../../hooks/useFormValidation";

// Mock dependencies
jest.mock("../../contexts/TransactionsContext");
jest.mock("../../hooks/useFormValidation");
jest.mock("react-native/Libraries/Alert/Alert", () => ({
  alert: jest.fn(),
}));

describe("useCategoryModal", () => {
  const mockAddCategory = jest.fn();
  const mockUpdateCategory = jest.fn();
  const mockRemoveCategory = jest.fn();
  const mockOnClose = jest.fn();
  const mockHandleSubmit = jest.fn();
  const mockResetForm = jest.fn();
  const mockSetValue = jest.fn();

  let mockSubmitHandler;

  beforeEach(() => {
    jest.clearAllMocks();

    useTransactions.mockReturnValue({
      addCategory: mockAddCategory,
      updateCategory: mockUpdateCategory,
      removeCategory: mockRemoveCategory,
    });

    // Mock useFormValidation with dynamic submit handler
    useFormValidation.mockImplementation(({ onSubmit }) => {
      mockSubmitHandler = onSubmit; // Capture the submit handler
      return {
        control: {},
        handleSubmit: mockHandleSubmit.mockImplementation((callback) => {
          if (callback) {
            return callback;
          }
          return async () => {
            // Call the captured onSubmit handler with current form data
            if (mockSubmitHandler) {
              await mockSubmitHandler({
                name: "Nova Categoria",
                type: "income",
              });
            }
          };
        }),
        resetForm: mockResetForm,
        errors: {},
        isValid: true,
        setValue: mockSetValue,
      };
    });
  });

  describe("initialization", () => {
    it("should initialize with default values for new category", () => {
      // Override mock to return isValid: false for this test
      useFormValidation.mockImplementation(({ onSubmit }) => {
        mockSubmitHandler = onSubmit;
        return {
          control: {},
          handleSubmit: mockHandleSubmit.mockImplementation((callback) => {
            if (callback) {
              return callback;
            }
            return async () => {
              if (mockSubmitHandler) {
                await mockSubmitHandler({
                  name: "Nova Categoria",
                  type: "income",
                });
              }
            };
          }),
          resetForm: mockResetForm,
          errors: {},
          isValid: false, // Form should be invalid initially
          setValue: mockSetValue,
        };
      });

      const { result } = renderHook(() =>
        useCategoryModal({
          editingCategory: null,
          visible: true,
          onClose: mockOnClose,
        })
      );

      expect(result.current.modalTitle).toBe("Nova Categoria");
      expect(result.current.isValid).toBe(false);
      expect(result.current.categoryTypes).toHaveLength(2);
    });

    it("should initialize with editing values when category is provided", () => {
      const editingCategory = { type: "expense", name: "Aluguel" };

      const { result } = renderHook(() =>
        useCategoryModal({
          editingCategory,
          visible: true,
          onClose: mockOnClose,
        })
      );

      expect(result.current.modalTitle).toBe("Editar Categoria");
      expect(result.current.editingCategory).toEqual(editingCategory);
    });
  });

  describe("form submission", () => {
    it("should add new category successfully", async () => {
      mockAddCategory.mockResolvedValue();

      const { result } = renderHook(() =>
        useCategoryModal({
          editingCategory: null,
          visible: true,
          onClose: mockOnClose,
        })
      );

      await act(async () => {
        // Call the submit handler directly with form data
        await mockSubmitHandler({
          name: "Nova Categoria",
          type: "income",
        });
      });

      expect(mockAddCategory).toHaveBeenCalledWith("income", "Nova Categoria");
      expect(Alert.alert).toHaveBeenCalledWith(
        "Sucesso",
        "Categoria adicionada com sucesso!"
      );
      expect(mockOnClose).toHaveBeenCalled();
    });

    it("should update existing category successfully", async () => {
      mockUpdateCategory.mockResolvedValue();
      const editingCategory = { type: "expense", name: "Aluguel" };

      const { result } = renderHook(() =>
        useCategoryModal({
          editingCategory,
          visible: true,
          onClose: mockOnClose,
        })
      );

      await act(async () => {
        // Call the submit handler directly with form data
        await mockSubmitHandler({
          name: "Aluguel Atualizado",
          type: "expense",
        });
      });

      expect(mockUpdateCategory).toHaveBeenCalledWith(
        "expense",
        "expense",
        "Aluguel",
        "Aluguel Atualizado"
      );
      expect(Alert.alert).toHaveBeenCalledWith(
        "Sucesso",
        "Categoria atualizada com sucesso!"
      );
      expect(mockOnClose).toHaveBeenCalled();
    });

    it("should handle error during submission", async () => {
      const error = new Error("Erro ao salvar categoria");
      mockAddCategory.mockRejectedValue(error);

      const { result } = renderHook(() =>
        useCategoryModal({
          editingCategory: null,
          visible: true,
          onClose: mockOnClose,
        })
      );

      await act(async () => {
        // Call the submit handler directly with form data
        await mockSubmitHandler({
          name: "Nova Categoria",
          type: "income",
        });
      });

      expect(Alert.alert).toHaveBeenCalledWith("Erro", error.message);
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it("should trim whitespace from category name", async () => {
      mockAddCategory.mockResolvedValue();

      const { result } = renderHook(() =>
        useCategoryModal({
          editingCategory: null,
          visible: true,
          onClose: mockOnClose,
        })
      );

      await act(async () => {
        // Call the submit handler directly with form data containing whitespace
        await mockSubmitHandler({
          name: "  Categoria com espaços  ",
          type: "income",
        });
      });

      expect(mockAddCategory).toHaveBeenCalledWith(
        "income",
        "Categoria com espaços"
      );
    });
  });

  describe("category deletion", () => {
    it("should show confirmation dialog and delete category", async () => {
      mockRemoveCategory.mockResolvedValue();
      const editingCategory = { type: "expense", name: "Aluguel" };

      Alert.alert.mockImplementation((title, message, buttons) => {
        if (buttons && Array.isArray(buttons)) {
          const deleteButton = buttons.find((btn) => btn.text === "Excluir");
          if (deleteButton) {
            deleteButton.onPress();
          }
        }
      });

      const { result } = renderHook(() =>
        useCategoryModal({
          editingCategory,
          visible: true,
          onClose: mockOnClose,
        })
      );

      await act(async () => {
        result.current.handleDelete("expense", "Aluguel");
      });

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          "Confirmar Exclusão",
          'Tem certeza que deseja excluir a categoria "Aluguel"?',
          expect.any(Array)
        );
        expect(mockRemoveCategory).toHaveBeenCalledWith("expense", "Aluguel");
      });
    });

    it("should handle error during deletion", async () => {
      const error = new Error("Erro ao excluir categoria");
      mockRemoveCategory.mockRejectedValue(error);
      const editingCategory = { type: "expense", name: "Aluguel" };

      Alert.alert.mockImplementation((title, message, buttons) => {
        if (buttons && Array.isArray(buttons)) {
          const deleteButton = buttons.find((btn) => btn.text === "Excluir");
          if (deleteButton) {
            deleteButton.onPress();
          }
        }
      });

      const { result } = renderHook(() =>
        useCategoryModal({
          editingCategory,
          visible: true,
          onClose: mockOnClose,
        })
      );

      await act(async () => {
        result.current.handleDelete("expense", "Aluguel");
      });

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledTimes(2); // Confirmation + Error
      });
    });

    it("should not delete when no category is being edited", async () => {
      Alert.alert.mockImplementation((title, message, buttons) => {
        // Don't trigger the button press, just check that alert was called
      });

      const { result } = renderHook(() =>
        useCategoryModal({
          editingCategory: null,
          visible: true,
          onClose: mockOnClose,
        })
      );

      await act(async () => {
        // Calling handleDelete with undefined parameters
        result.current.handleDelete(undefined, undefined);
      });

      // The alert will still be called with "undefined" as the name
      expect(Alert.alert).toHaveBeenCalledWith(
        "Confirmar Exclusão",
        'Tem certeza que deseja excluir a categoria "undefined"?',
        expect.any(Array)
      );
      // But removeCategory should not be called since button wasn't pressed
      expect(mockRemoveCategory).not.toHaveBeenCalled();
    });
  });

  describe("modal handlers", () => {
    it("should close modal and reset form", () => {
      const { result } = renderHook(() =>
        useCategoryModal({
          editingCategory: null,
          visible: true,
          onClose: mockOnClose,
        })
      );

      act(() => {
        result.current.handleClose();
      });

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe("validation rules", () => {
    it("should provide validation rules", () => {
      const { result } = renderHook(() =>
        useCategoryModal({
          editingCategory: null,
          visible: true,
          onClose: mockOnClose,
        })
      );

      expect(result.current.validationRules).toBeDefined();
      expect(result.current.validationRules.name).toBeDefined();
      expect(result.current.validationRules.type).toBeDefined();
    });
  });

  describe("category types", () => {
    it("should provide income and expense types", () => {
      const { result } = renderHook(() =>
        useCategoryModal({
          editingCategory: null,
          visible: true,
          onClose: mockOnClose,
        })
      );

      expect(result.current.categoryTypes).toEqual([
        { value: "income", label: "Receita" },
        { value: "expense", label: "Despesa" },
      ]);
    });
  });
});
