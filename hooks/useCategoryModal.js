import { useMemo, useCallback, useEffect } from "react";
import { Alert } from "react-native";
import { useTransactions } from "../contexts/TransactionsContext";
import { useFormValidation } from "./useFormValidation";
import { formValidationSets } from "../utils/formFieldRules";

/**
 * Custom hook for managing category modal state and operations
 * @param {Object} params - Hook parameters
 * @param {Object|null} params.editingCategory - Category to edit (null for new category)
 * @param {boolean} params.visible - Modal visibility state
 * @param {Function} params.onClose - Callback for closing modal
 * @returns {Object} Hook state and handlers
 */
export const useCategoryModal = ({
  editingCategory = null,
  visible,
  onClose,
}) => {
  const { addCategory, updateCategory, removeCategory } = useTransactions();

  // Category type options
  const categoryTypes = useMemo(
    () => [
      { value: "income", label: "Receita" },
      { value: "expense", label: "Despesa" },
    ],
    []
  );

  // Memoize validation rules
  const validationRules = useMemo(() => {
    return formValidationSets.category();
  }, []);

  // Submit handler
  const onSubmitHandler = useCallback(
    async (data) => {
      try {
        const categoryName = data.name.trim();
        const categoryType = data.type;

        if (editingCategory) {
          // Update existing category
          await updateCategory(
            editingCategory.type,
            categoryType,
            editingCategory.name,
            categoryName
          );
          Alert.alert("Sucesso", "Categoria atualizada com sucesso!");
        } else {
          // Add new category
          await addCategory(categoryType, categoryName);
          Alert.alert("Sucesso", "Categoria adicionada com sucesso!");
        }

        onClose();
      } catch (error) {
        Alert.alert("Erro", error.message);
      }
    },
    [editingCategory, addCategory, updateCategory, onClose]
  );

  // Memoize default values to prevent infinite loop
  const defaultValues = useMemo(
    () => ({
      name: editingCategory?.name || "",
      type: editingCategory?.type || "income",
    }),
    [editingCategory]
  );

  // Form setup using the validation hook
  const { control, handleSubmit, resetForm, errors, isValid, setValue } =
    useFormValidation({
      defaultValues,
      validationRules: validationRules,
      onSubmit: onSubmitHandler,
      sanitizeOnChange: true,
    });

  // Reset form when modal opens/closes or category changes
  useEffect(() => {
    if (visible) {
      resetForm(defaultValues);
    }
  }, [editingCategory, visible, resetForm, defaultValues]);

  // Close handler
  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  // Delete handler
  const handleDelete = useCallback(
    (type, name) => {
      Alert.alert(
        "Confirmar Exclusão",
        `Tem certeza que deseja excluir a categoria "${name}"?`,
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Excluir",
            style: "destructive",
            onPress: async () => {
              try {
                await removeCategory(type, name);
                Alert.alert("Sucesso", "Categoria excluída com sucesso!");
              } catch (error) {
                Alert.alert("Erro", error.message);
              }
            },
          },
        ]
      );
    },
    [removeCategory]
  );

  // Modal title
  const modalTitle = useMemo(
    () => (editingCategory ? "Editar Categoria" : "Nova Categoria"),
    [editingCategory]
  );

  return {
    // Form controls
    control,
    errors,
    isValid,
    setValue,

    // Data
    categoryTypes,
    modalTitle,

    // Handlers
    handleSubmit,
    handleClose,
    handleDelete,

    // Utilities
    editingCategory,
    validationRules,
  };
};

export default useCategoryModal;
