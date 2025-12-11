/**
 * Common utility functions for frequency labels and icons
 * Reduces duplication across recurring transaction screens
 */
export const frequencyUtils = {
  getLabel: (frequency) => {
    const labels = {
      daily: "Diário",
      weekly: "Semanal",
      monthly: "Mensal",
      yearly: "Anual",
    };
    return labels[frequency] || frequency;
  },

  getIcon: (frequency) => {
    const icons = {
      daily: "🔄",
      weekly: "📅",
      monthly: "📆",
      yearly: "🗓️",
    };
    return icons[frequency] || "📅";
  },

  getAllFrequencies: () => [
    { value: "daily", label: "Diário" },
    { value: "weekly", label: "Semanal" },
    { value: "monthly", label: "Mensal" },
    { value: "yearly", label: "Anual" },
  ],
};
