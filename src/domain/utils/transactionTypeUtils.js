/**
 * Transaction type utilities
 * Reduces duplication of type-related functions across components
 */

export const getTypeLabel = (type) => {
  return type === "income" ? "Receita" : "Despesa";
};

export const getTypeColor = (type, theme) => {
  return type === "income" ? theme.colors.success : theme.colors.error;
};

export const getTypeIcon = (type) => {
  return type === "income" ? "↗" : "↙";
};

export const transactionTypeUtils = {
  getTypeLabel,
  getTypeColor,
  getTypeIcon,
};
