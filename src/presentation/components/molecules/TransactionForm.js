/**
 * @fileoverview Formulário de transação reutilizável
 * @module presentation/components/molecules/TransactionForm
 */

import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Input, Button } from "../atoms";

/**
 * Formulário molecular para criação/edição de transações
 * 
 * @component
 * @description
 * Componente molecular seguindo Atomic Design que combina
 * inputs atômicos para criar um formulário completo de transação.
 * Inclui validação integrada e estados de loading.
 * 
 * @param {Object} props - Propriedades do componente
 * @param {Function} props.onSubmit - Callback ao submeter formulário válido
 * @param {Object} [props.initialData={}] - Dados iniciais do formulário
 * @param {Object} [props.validationRules={}] - Regras de validação por campo
 * @param {Function} [props.onCancel] - Callback ao cancelar (mostra botão se definido)
 * @param {boolean} [props.isLoading=false] - Estado de loading durante submissão
 * @param {string} [props.submitLabel='Salvar'] - Texto do botão de submit
 * 
 * @example
 * // Formulário básico de criação
 * <TransactionForm
 *   onSubmit={handleCreate}
 *   validationRules={{
 *     amount: { required: true, message: 'Valor é obrigatório' },
 *     description: { required: true, minLength: 3 }
 *   }}
 * />
 * 
 * @example
 * // Formulário de edição com dados iniciais
 * <TransactionForm
 *   initialData={transaction}
 *   onSubmit={handleUpdate}
 *   onCancel={handleClose}
 *   isLoading={isSaving}
 *   submitLabel="Atualizar"
 * />
 * 
 * @returns {React.ReactElement} Componente TransactionForm renderizado
 */
export const TransactionForm = React.memo(
  ({
    onSubmit,
    initialData = {},
    validationRules = {},
    onCancel,
    isLoading = false,
    submitLabel = "Salvar",
  }) => {
    const [formData, setFormData] = useState(initialData);
    const [errors, setErrors] = useState({});

    const updateField = (fieldName, value) => {
      setFormData((prev) => ({ ...prev, [fieldName]: value }));
      if (errors[fieldName]) {
        setErrors((prev) => ({ ...prev, [fieldName]: null }));
      }
    };

    const validateForm = () => {
      const newErrors = {};
      let isValid = true;

      Object.keys(validationRules).forEach((fieldName) => {
        const rule = validationRules[fieldName];
        const value = formData[fieldName];

        if (rule.required && !value) {
          newErrors[fieldName] = rule.message || "Campo obrigatório";
          isValid = false;
        } else if (rule.minLength && value?.length < rule.minLength) {
          newErrors[fieldName] =
            rule.message || `Mínimo ${rule.minLength} caracteres`;
          isValid = false;
        } else if (rule.pattern && !rule.pattern.test(value)) {
          newErrors[fieldName] = rule.message || "Formato inválido";
          isValid = false;
        }
      });

      setErrors(newErrors);
      return isValid;
    };

    const handleSubmit = async () => {
      if (!validateForm()) {
        return;
      }

      await onSubmit(formData);
    };

    return (
      <View style={styles.container}>
        <Input
          label="Valor"
          value={formData.amount}
          onChangeText={(value) => updateField("amount", value)}
          error={errors.amount}
          keyboardType="numeric"
          placeholder="0,00"
        />

        <Input
          label="Descrição"
          value={formData.description}
          onChangeText={(value) => updateField("description", value)}
          error={errors.description}
          placeholder="Digite a descrição"
          multiline
          numberOfLines={3}
        />

        <Input
          label="Categoria"
          value={formData.category}
          onChangeText={(value) => updateField("category", value)}
          error={errors.category}
          placeholder="Selecione a categoria"
        />

        <View style={styles.actions}>
          {onCancel && (
            <Button
              title="Cancelar"
              onPress={onCancel}
              variant="secondary"
              style={styles.cancelButton}
              disabled={isLoading}
            />
          )}
          <Button
            title={submitLabel}
            onPress={handleSubmit}
            variant="primary"
            style={styles.submitButton}
            loading={isLoading}
          />
        </View>
      </View>
    );
  }
);

TransactionForm.displayName = "TransactionForm";

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 1,
  },
});
