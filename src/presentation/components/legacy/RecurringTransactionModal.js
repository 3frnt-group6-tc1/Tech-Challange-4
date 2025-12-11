import React from "react";
import { useRecurringTransactionModal } from "../../hooks/useRecurringTransactionModal";
import { BaseTransactionModal } from "./form/BaseTransactionModal";
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
  const {
    control,
    isValid,
    availableCategories,
    frequencies,
    currency,
    modalTitle,
    handleSubmit,
    handleClose,
    handleDelete,
    formatCurrencyInput,
    validationRules,
  } = useRecurringTransactionModal({
    transaction,
    visible,
    onSave,
    onClose,
  });

  return (
    <BaseTransactionModal
      visible={visible}
      onRequestClose={handleClose}
      title={modalTitle}
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
    </BaseTransactionModal>
  );
};

export default RecurringTransactionModal;
