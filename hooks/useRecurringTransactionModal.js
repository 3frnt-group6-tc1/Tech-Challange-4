import { useState, useMemo, useCallback, useEffect } from "react";
import { Alert } from "react-native";
import { useTransactions } from "../contexts/TransactionsContext";
import { useCurrency } from "../contexts/CurrencyContext";
import { useFormValidation } from "./useFormValidation";
import { formValidationSets } from "../utils/formFieldRules";

/**
 * Custom hook for managing recurring transaction modal state and operations
 * @param {Object} params - Hook parameters
 * @param {Object|null} params.transaction - Transaction to edit (null for new transaction)
 * @param {boolean} params.visible - Modal visibility state
 * @param {Function} params.onSave - Callback for saving transaction
 * @param {Function} params.onClose - Callback for closing modal
 * @returns {Object} Hook state and handlers
 */
export const useRecurringTransactionModal = ({
  transaction = null,
  visible,
  onSave,
  onClose,
}) => {
  const { categories } = useTransactions();
  const { formatCurrencyInput, parseCurrency, currency } = useCurrency();

  // Frequency options
  const frequencies = useMemo(
    () => [
      { value: "daily", label: "Diário" },
      { value: "weekly", label: "Semanal" },
      { value: "monthly", label: "Mensal" },
      { value: "yearly", label: "Anual" },
    ],
    []
  );

  // Available categories for expense transactions (recurring transactions are typically expenses)
  const availableCategories = useMemo(() => {
    if (!categories) return [];
    return categories.expense || [];
  }, [categories]);

  // Memoize validation rules to prevent re-computation
  const validationRules = useMemo(() => {
    return formValidationSets.recurringTransaction(
      availableCategories,
      parseCurrency
    );
  }, [availableCategories, parseCurrency]);

  // Submit handler
  const onSubmitHandler = useCallback(
    async (data) => {
      const amount = parseFloat(parseCurrency(data.amount));
      const transactionData = {
        title: data.title.trim(),
        description: data.description.trim(),
        amount: amount,
        category: data.category,
        type: transaction ? transaction.type : "expense",
        frequency: data.frequency,
        nextDueDate: data.nextDueDate,
      };

      if (transaction) {
        await onSave({ ...transaction, ...transactionData });
      } else {
        await onSave(transactionData);
      }

      onClose();
    },
    [transaction, onSave, onClose, parseCurrency]
  );

  // Define form values function
  const getFormValues = useCallback(
    (transaction = null) => ({
      title: transaction?.title || "",
      description: transaction?.description || "",
      amount: transaction?.amount?.toString() || "",
      category: transaction?.category || "",
      frequency: transaction?.frequency || "monthly",
      nextDueDate:
        transaction?.nextDueDate || new Date().toISOString().split("T")[0],
    }),
    []
  );

  // Reset form when modal opens/closes or transaction changes
  useEffect(() => {
    const formData = getFormValues(transaction);
    resetForm(formData);
  }, [transaction, visible, resetForm, getFormValues]);

  // Form setup using the validation hook
  const { control, handleSubmit, resetForm, errors, isValid } =
    useFormValidation({
      defaultValues: getFormValues(transaction),
      validationRules: validationRules,
      onSubmit: onSubmitHandler,
      sanitizeOnChange: true,
    });

  // Close handler
  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  // Delete handler
  const handleDelete = useCallback(() => {
    Alert.alert(
      "Confirmar Exclusão",
      "Tem certeza que deseja excluir esta transação recorrente?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () => {
            onSave({ ...transaction, _delete: true });
            onClose();
          },
        },
      ]
    );
  }, [transaction, onSave, onClose]);

  // Modal title
  const modalTitle = useMemo(
    () =>
      transaction ? "Editar Transação Recorrente" : "Nova Transação Recorrente",
    [transaction]
  );

  return {
    // Form controls
    control,
    errors,
    isValid,

    // Data
    availableCategories,
    frequencies,
    currency,
    modalTitle,

    // Handlers
    handleSubmit,
    handleClose,
    handleDelete,
    formatCurrencyInput,

    // Utilities
    transaction,
    validationRules,
  };
};

export default useRecurringTransactionModal;
