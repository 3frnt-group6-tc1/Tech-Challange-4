import { View, Text, StyleSheet, Modal, ScrollView } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { useUnifiedTransactionModal } from "../hooks/useUnifiedTransactionModal";
import {
  TextField,
  AmountField,
  SelectTagField,
  DateField,
  ImageUploadField,
  FormActions,
  FieldContainer,
} from "./form";

/**
 * Example of how to refactor UnifiedTransactionModal using the unified form components
 * This demonstrates the cleaner, more modular approach with TextField for both title and description
 */
const UnifiedTransactionModal = ({
  visible,
  onClose,
  onSave,
  transaction = null,
  type = "income",
}) => {
  const { theme } = useTheme();

  // Use the custom hook for all transaction modal logic
  const {
    control,
    canSubmit,
    localImage,
    availableCategories,
    modalTitle,
    buttonVariant,
    formatCurrencyInput,
    currency,
    validationRules,
    handleSubmit,
    handlePickImage,
    handleRemoveImage,
    handleClose,
    handleDelete,
  } = useUnifiedTransactionModal({
    transaction,
    type,
    visible,
    onSave,
    onClose,
  });

  return (
    <Modal
      transparent
      animationType="slide"
      visible={visible}
      onRequestClose={handleClose}
    >
      <View style={styles.modalContainer}>
        <View
          style={[
            styles.modalContent,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
            {modalTitle}
          </Text>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            <FieldContainer>
              <ImageUploadField
                localImage={localImage}
                onPickImage={handlePickImage}
                onRemoveImage={handleRemoveImage}
              />
            </FieldContainer>

            <FieldContainer>
              <TextField
                control={control}
                validationRules={validationRules}
                name="title"
                label="Título *"
                placeholder="Digite o título"
                maxLength={100}
              />
            </FieldContainer>

            <FieldContainer>
              <TextField
                control={control}
                validationRules={validationRules}
                name="description"
                label="Descrição *"
                placeholder="Digite a descrição (mín. 3 caracteres)"
                multiline
                numberOfLines={3}
                maxLength={500}
              />
            </FieldContainer>

            <FieldContainer>
              <AmountField
                control={control}
                validationRules={validationRules}
                formatCurrencyInput={formatCurrencyInput}
                currency={currency}
              />
            </FieldContainer>

            <SelectTagField
              control={control}
              validationRules={validationRules}
              options={availableCategories}
            />

            <DateField control={control} validationRules={validationRules} />
          </ScrollView>

          <FormActions
            onSave={handleSubmit}
            onCancel={handleClose}
            onDelete={handleDelete}
            canSubmit={canSubmit}
            showDelete={!!transaction}
            buttonVariant={buttonVariant}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContent: {
    width: "90%",
    maxHeight: "80%",
    borderRadius: 12,
    padding: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  scrollView: {
    maxHeight: 400,
  },
});

export default UnifiedTransactionModal;
