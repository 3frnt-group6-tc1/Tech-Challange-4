import React from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { useCategoryModal } from "../hooks/useCategoryModal";
import { TextField, FormActions } from "./form";
import { Controller } from "react-hook-form";

/**
 * Category Modal Component
 * Handles creating and editing categories with validation
 */
const CategoryModal = ({ visible, onClose, editingCategory = null }) => {
  const { theme } = useTheme();

  const {
    control,
    isValid,
    categoryTypes,
    modalTitle,
    handleSubmit,
    handleClose,
    validationRules,
  } = useCategoryModal({
    editingCategory,
    visible,
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

          {/* Category Type Selector */}
          <Controller
            control={control}
            name="type"
            rules={validationRules.type}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <View style={styles.typeSelectorContainer}>
                <Text style={[styles.label, { color: theme.colors.text }]}>
                  Tipo *
                </Text>
                <View style={styles.typeSelector}>
                  <TouchableOpacity
                    style={[
                      styles.typeButton,
                      {
                        backgroundColor:
                          value === "income"
                            ? theme.colors.success
                            : theme.colors.background,
                        borderColor: theme.colors.border,
                      },
                    ]}
                    onPress={() => onChange("income")}
                  >
                    <Text
                      style={[
                        styles.typeButtonText,
                        {
                          color:
                            value === "income" ? "#fff" : theme.colors.text,
                        },
                      ]}
                    >
                      Receita
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.typeButton,
                      {
                        backgroundColor:
                          value === "expense"
                            ? theme.colors.error
                            : theme.colors.background,
                        borderColor: theme.colors.border,
                      },
                    ]}
                    onPress={() => onChange("expense")}
                  >
                    <Text
                      style={[
                        styles.typeButtonText,
                        {
                          color:
                            value === "expense" ? "#fff" : theme.colors.text,
                        },
                      ]}
                    >
                      Despesa
                    </Text>
                  </TouchableOpacity>
                </View>
                {error && (
                  <Text
                    style={[styles.errorText, { color: theme.colors.error }]}
                  >
                    {error.message}
                  </Text>
                )}
              </View>
            )}
          />

          {/* Category Name Field */}
          <TextField
            control={control}
            validationRules={validationRules}
            name="name"
            label="Nome da Categoria *"
            placeholder="Digite o nome da categoria"
            maxLength={50}
          />

          {/* Form Actions */}
          <FormActions
            onSave={handleSubmit}
            onCancel={handleClose}
            canSubmit={isValid}
            showDelete={false}
            saveTitle={editingCategory ? "Atualizar" : "Adicionar"}
            cancelTitle="Cancelar"
            buttonVariant="success"
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
    borderRadius: 12,
    padding: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  typeSelectorContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  typeSelector: {
    flexDirection: "row",
    gap: 12,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
});

export default CategoryModal;
