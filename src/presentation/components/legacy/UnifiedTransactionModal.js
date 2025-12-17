import React from "react";
import { useUnifiedTransactionModal } from "../../hooks/useUnifiedTransactionModal";
import { BaseTransactionModal } from "./form/BaseTransactionModal";
import {
  TextField,
  AmountField,
  SelectTagField,
  DateField,
  ImageUploadField,
  FormActions,
  FieldContainer,
} from "./form";

const UnifiedTransactionModal = ({
  visible,
  onClose,
  onSave,
  transaction = null,
  type = "income",
}) => {
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
    <BaseTransactionModal
      visible={visible}
      onRequestClose={handleClose}
      title={modalTitle}
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

      <FormActions
        onSave={handleSubmit}
        onCancel={handleClose}
        onDelete={handleDelete}
        canSubmit={canSubmit}
        showDelete={!!transaction}
        buttonVariant={buttonVariant}
      />
    </BaseTransactionModal>
  );
};

export default UnifiedTransactionModal;
