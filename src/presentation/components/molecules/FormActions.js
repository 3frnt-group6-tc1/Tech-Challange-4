import React from "react";
import { View, StyleSheet } from "react-native";
import { Button } from "../atoms";

export const FormActions = React.memo(
  ({
    onSave,
    onCancel,
    onDelete,
    canSubmit = true,
    showDelete = false,
    buttonVariant = "primary",
    isLoading = false,
    saveLabel = "Salvar",
    cancelLabel = "Cancelar",
    deleteLabel = "Excluir",
  }) => {
    return (
      <View style={styles.container}>
        <View style={styles.mainActions}>
          <Button
            title={cancelLabel}
            onPress={onCancel}
            variant="secondary"
            style={styles.cancelButton}
            disabled={isLoading}
          />
          <Button
            title={saveLabel}
            onPress={onSave}
            variant={buttonVariant}
            disabled={!canSubmit}
            loading={isLoading}
            style={styles.saveButton}
          />
        </View>
        {showDelete && onDelete && (
          <Button
            title={deleteLabel}
            onPress={onDelete}
            variant="danger"
            style={styles.deleteButton}
            disabled={isLoading}
          />
        )}
      </View>
    );
  }
);

FormActions.displayName = "FormActions";

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  mainActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
  deleteButton: {
    marginTop: 12,
  },
});
