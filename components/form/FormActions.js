import React from "react";
import { View, StyleSheet } from "react-native";
import { Button } from "../Button";

/**
 * Form actions component for transaction forms
 * Contains action buttons like Save, Cancel, Delete
 */
const FormActions = ({
  onSave,
  onCancel,
  onDelete,
  canSubmit = true,
  showDelete = false,
  saveTitle = "Salvar",
  cancelTitle = "Cancelar",
  deleteTitle = "Excluir",
  buttonVariant = "primary",
}) => {
  return (
    <View style={styles.buttonContainer}>
      {showDelete && (
        <Button
          title={deleteTitle}
          variant="danger"
          style={styles.deleteButton}
          onPress={onDelete}
        />
      )}
      <Button
        title={cancelTitle}
        style={styles.cancelButton}
        onPress={onCancel}
      />
      <Button
        title={saveTitle}
        variant={buttonVariant}
        style={styles.saveButton}
        onPress={onSave}
        disabled={!canSubmit}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: "row",
    marginTop: 16,
    gap: 8,
  },
  deleteButton: {
    flex: 1,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
});

export default FormActions;
