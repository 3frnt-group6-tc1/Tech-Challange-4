import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import ImagePreviewModal from "./ImagePreviewModal";
import { useTheme } from "../contexts/ThemeContext";
import { useCurrency } from "../contexts/CurrencyContext";
import { useImagePreview } from "../hooks/useImagePreview";
import { formatDate } from "../utils/dateFormatter";

/**
 * Transaction item component for displaying individual transaction details
 * @param {Object} transaction - Transaction data
 * @param {Function} onEdit - Callback when edit button is pressed
 * @param {boolean} showImageButton - Whether to show image preview button (default: true)
 * @param {boolean} showEditButton - Whether to show edit button (default: true)
 * @param {boolean} showDescription - Whether to show description (default: true)
 * @param {boolean} showBorder - Whether to show bottom border and padding (default: false)
 */
const TransactionItem = ({
  transaction,
  onEdit,
  showImageButton = true,
  showEditButton = true,
  showDescription = true,
  showBorder = false,
}) => {
  const { theme } = useTheme();
  const { formatCurrency } = useCurrency();
  const {
    imagePreviewVisible,
    imagePreviewUri,
    openImagePreview,
    closeImagePreview,
  } = useImagePreview();

  const getTypeLabel = (type) => {
    return type === "income" ? "Receita" : "Despesa";
  };

  const getTypeColor = (type) => {
    return type === "income" ? theme.colors.success : theme.colors.error;
  };

  const getTypeIcon = (type) => {
    return type === "income" ? "↗" : "↙";
  };

  return (
    <>
      <View
        style={[styles.container, showBorder && styles.containerWithBorder]}
      >
        <View style={styles.content}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: getTypeColor(transaction.type) + "20" },
            ]}
          >
            <Text
              style={[styles.icon, { color: getTypeColor(transaction.type) }]}
            >
              {getTypeIcon(transaction.type)}
            </Text>
          </View>
          <View style={styles.info}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              {transaction.title}
            </Text>
            <Text
              style={[styles.category, { color: theme.colors.textSecondary }]}
            >
              {transaction.category} • {formatDate(transaction.date)}
            </Text>
            {showDescription && transaction.description && (
              <Text
                style={[
                  styles.description,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {transaction.description}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.amountContainer}>
          <Text
            style={[styles.amount, { color: getTypeColor(transaction.type) }]}
          >
            {transaction.type === "income" ? "+ " : "- "}
            {formatCurrency(transaction.amount)}
          </Text>
          <Text style={[styles.type, { color: theme.colors.textSecondary }]}>
            {getTypeLabel(transaction.type)}
          </Text>
        </View>
      </View>
      {(showImageButton && transaction.imageUrl) ||
      (showEditButton && onEdit) ? (
        <View style={styles.actions}>
          {showImageButton && transaction.imageUrl && (
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: theme.colors.success + "20" },
              ]}
              onPress={() => openImagePreview(transaction.imageUrl)}
            >
              <Text
                style={[
                  styles.actionButtonText,
                  { color: theme.colors.success },
                ]}
              >
                🖼️ Ver Imagem
              </Text>
            </TouchableOpacity>
          )}
          {showEditButton && onEdit && (
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: theme.colors.primary + "20" },
              ]}
              onPress={() => onEdit(transaction)}
            >
              <Text
                style={[
                  styles.actionButtonText,
                  { color: theme.colors.primary },
                ]}
              >
                ✏️ Editar
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ) : null}

      {imagePreviewVisible && imagePreviewUri === transaction.imageUrl && (
        <ImagePreviewModal
          visible={imagePreviewVisible}
          imageUri={imagePreviewUri}
          onClose={closeImagePreview}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 12,
  },
  containerWithBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  content: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  icon: {
    fontSize: 16,
    fontWeight: "bold",
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    lineHeight: 16,
  },
  amountContainer: {
    alignItems: "flex-end",
    marginLeft: 12,
  },
  amount: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  type: {
    fontSize: 12,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
    paddingTop: 12,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
});

export default TransactionItem;
