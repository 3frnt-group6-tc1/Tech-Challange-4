import { useState, useMemo, useCallback, useEffect } from "react";
import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";
import { uploadFileToStorage } from "../services/uploadService";
import { useTransactions } from "../contexts/TransactionsContext";
import { useCurrency } from "../contexts/CurrencyContext";
import { useFormValidation } from "./useFormValidation";
import { formValidationSets } from "../utils/formFieldRules";

/**
 * Custom hook for managing transaction modal state and operations
 * @param {Object} params - Hook parameters
 * @param {Object|null} params.transaction - Transaction to edit (null for new transaction)
 * @param {string} params.type - Transaction type ('income' or 'expense')
 * @param {boolean} params.visible - Modal visibility state
 * @param {Function} params.onSave - Callback for saving transaction
 * @param {Function} params.onClose - Callback for closing modal
 * @returns {Object} Hook state and handlers
 */
export const useUnifiedTransactionModal = ({
  transaction = null,
  type = "income",
  visible,
  onSave,
  onClose,
}) => {
  const { categories } = useTransactions();
  const { formatCurrencyInput, parseCurrency, currency } = useCurrency();

  // State for local image selection
  const [localImage, setLocalImage] = useState(null);

  // Memoize available categories based on transaction type
  const availableCategories = useMemo(() => {
    if (!categories) return [];
    const currentType = transaction ? transaction.type : type;
    return categories[currentType] || [];
  }, [categories, transaction, type]);

  // Memoize validation rules to prevent re-computation
  const validationRules = useMemo(
    () => formValidationSets.transaction(availableCategories, parseCurrency),
    [availableCategories, parseCurrency]
  );

  // Memoize submit handler to prevent re-creation
  const onSubmitHandler = useCallback(
    async (sanitizedData) => {
      const amount = parseFloat(parseCurrency(sanitizedData.amount));
      let imageUrl = null;

      // Handle image URL based on localImage state
      if (localImage?.uri) {
        // If there's a local image and it's not an existing URL, upload it
        if (!localImage.uri.startsWith("http")) {
          imageUrl = await uploadFileToStorage(localImage.uri);
        } else {
          // If it's an existing URL, keep it
          imageUrl = localImage.uri;
        }
      }
      // If localImage is null, imageUrl remains null (image was removed)

      const transactionData = {
        title: sanitizedData.title,
        description: sanitizedData.description,
        amount: amount,
        category: sanitizedData.category,
        type: transaction ? transaction.type : type,
        date: sanitizedData.date,
        imageUrl: imageUrl,
      };

      if (transaction) {
        onSave({ ...transaction, ...transactionData });
      } else {
        onSave(transactionData);
      }
      onClose();
    },
    [localImage, parseCurrency, transaction, type, onSave, onClose]
  );

  // Define empty form values
  const getFormValues = useCallback(
    (transaction = null) => ({
      title: transaction?.title || "",
      description: transaction?.description || "",
      amount: transaction?.amount?.toString() || "",
      category: transaction?.category || "",
      date: transaction?.date || new Date().toISOString().split("T")[0],
    }),
    []
  );

  // Reset form when transaction or modal visibility changes
  useEffect(() => {
    const formData = getFormValues(transaction);
    resetForm(formData);

    // Reset local image when modal opens/closes or transaction changes
    if (transaction && transaction.imageUrl) {
      setLocalImage({ uri: transaction.imageUrl });
    } else {
      setLocalImage(null);
    }
  }, [transaction, visible, resetForm, getFormValues]);

  // Setup form validation with centralized rules
  const { control, handleSubmit, resetForm, canSubmit } = useFormValidation({
    defaultValues: getFormValues(transaction),
    validationRules: validationRules,
    onSubmit: onSubmitHandler,
    sanitizeOnChange: true,
  });

  // Pick image from gallery
  const handlePickImage = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
      aspect: [4, 3],
      selectionLimit: 1,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setLocalImage({ uri: result.assets[0].uri });
    }
  }, []);

  // Remove selected image
  const handleRemoveImage = useCallback(() => {
    setLocalImage(null);
  }, []);

  // Handle modal close with form reset
  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  // Handle transaction deletion
  const handleDelete = useCallback(() => {
    Alert.alert(
      "Confirmar Exclusão",
      "Tem certeza que deseja excluir esta transação?",
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

  // Generate modal title based on context
  const modalTitle = useMemo(() => {
    return transaction
      ? "Editar Transação"
      : type === "income"
      ? "Adicionar Receita"
      : "Adicionar Despesa";
  }, [transaction, type]);

  // Determine button variant based on transaction type
  const buttonVariant = useMemo(() => {
    return transaction
      ? transaction.type === "income"
        ? "success"
        : "danger"
      : type === "income"
      ? "success"
      : "danger";
  }, [transaction, type]);

  return {
    // Form state
    control,
    canSubmit,

    // Image state
    localImage,

    // Data
    availableCategories,
    modalTitle,
    buttonVariant,

    // Currency utilities
    formatCurrencyInput,
    currency,

    // Validation rules
    validationRules,

    // Handlers
    handleSubmit,
    handlePickImage,
    handleRemoveImage,
    handleClose,
    handleDelete,
  };
};
