import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Card, IconButton } from "../atoms";
import { useTheme } from "../../../domain/contexts/ThemeContext";
import { useCurrency } from "../../../domain/contexts/CurrencyContext";
import { formatService } from "../../../domain/services/format-service";

export const TransactionCard = React.memo(
  ({
    transaction,
    onEdit,
    onImagePreview,
    showImageButton = true,
    showEditButton = true,
    showDescription = true,
    showBorder = false,
  }) => {
    const { theme } = useTheme();
    const { formatCurrency } = useCurrency();

    const getTypeLabel = (type) => {
      return type === "income" ? "Receita" : "Despesa";
    };

    const getTypeColor = (type) => {
      return type === "income" ? theme.colors.success : theme.colors.error;
    };

    const getTypeIcon = (type) => {
      return type === "income" ? "↗" : "↙";
    };

    const typeColor = getTypeColor(transaction.type);

    return (
      <Card
        style={showBorder && styles.cardWithBorder}
        padding="md"
        margin="sm"
      >
        <View style={styles.container}>
          <View style={styles.content}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: typeColor + "20" },
              ]}
            >
              <Text style={[styles.icon, { color: typeColor }]}>
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
                {transaction.category} • {formatService.formatDate(transaction.date, 'short', 'pt-BR')}
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
            <Text style={[styles.amount, { color: typeColor }]}>
              {transaction.type === "income" ? "+ " : "- "}
              {formatCurrency(transaction.amount)}
            </Text>
            <Text style={[styles.type, { color: theme.colors.textSecondary }]}>
              {getTypeLabel(transaction.type)}
            </Text>
          </View>
        </View>

        {((showImageButton && transaction.imageUrl) ||
          (showEditButton && onEdit)) && (
          <View style={styles.actions}>
            {showImageButton && transaction.imageUrl && (
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { backgroundColor: theme.colors.success + "20" },
                ]}
                onPress={() => onImagePreview?.(transaction.imageUrl)}
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
        )}
      </Card>
    );
  }
);

TransactionCard.displayName = "TransactionCard";

const styles = StyleSheet.create({
  cardWithBorder: {
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
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
