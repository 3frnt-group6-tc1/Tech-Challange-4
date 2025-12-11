import React from "react";
import { View, Text, StyleSheet, Modal, ScrollView } from "react-native";
import { useTheme } from "../../../../domain/contexts/ThemeContext";

/**
 * Base modal component for transaction forms
 * Reduces duplication between UnifiedTransactionModal and RecurringTransactionModal
 */
export const BaseTransactionModal = ({
  visible,
  onRequestClose,
  title,
  children,
}) => {
  const { theme } = useTheme();

  return (
    <Modal
      transparent
      animationType="slide"
      visible={visible}
      onRequestClose={onRequestClose}
    >
      <View style={styles.modalContainer}>
        <View
          style={[
            styles.modalContent,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
            {title}
          </Text>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 20,
    maxHeight: "90%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  scrollView: {
    paddingHorizontal: 20,
  },
});
