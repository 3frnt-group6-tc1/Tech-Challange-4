import React from "react";
import { View, Text, StyleSheet, Modal, ScrollView } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { useRecurringTransactionModal } from "../hooks/useRecurringTransactionModal";
import {
  TextField,
  AmountField,
  SelectTagField,
  DateField,
  FrequencyField,
  FormActions,
} from "./form";

const RecurringTransactionModal = ({
  visible,
  onClose,
  onSave,
  transaction = null,
}) => {
  const { theme } = useTheme();

  const {
    // Form controls
    control,
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
    validationRules,
  } = useRecurringTransactionModal({
    transaction,
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
            <TextField
              control={control}
              validationRules={validationRules}
              name="title"
              label="Título *"
              placeholder="Digite o título"
            />

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

            <AmountField
              control={control}
              validationRules={validationRules}
              formatCurrencyInput={formatCurrencyInput}
              currency={currency}
            />

            <SelectTagField
              control={control}
              validationRules={validationRules}
              options={availableCategories}
              name="category"
              label="Categoria *"
            />

            <FrequencyField
              control={control}
              validationRules={validationRules}
              options={frequencies}
              name="frequency"
              label="Frequência *"
            />

            <DateField
              control={control}
              validationRules={validationRules}
              mode="date"
              name="nextDueDate"
              label="Próxima Data *"
              placeholder="Selecionar próxima data"
            />
          </ScrollView>

          <FormActions
            onSave={handleSubmit}
            onCancel={handleClose}
            onDelete={handleDelete}
            canSubmit={isValid}
            showDelete={!!transaction}
            saveTitle="Salvar"
            cancelTitle="Cancelar"
            deleteTitle="Excluir"
            buttonVariant="danger"
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

export default RecurringTransactionModal;
