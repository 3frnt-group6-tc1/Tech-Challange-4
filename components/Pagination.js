import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "../contexts/ThemeContext";

/**
 * Pagination component for navigating through pages
 */
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const { theme } = useTheme();

  if (totalPages <= 1) {
    return null;
  }

  return (
    <View style={styles.paginationContainer}>
      <View style={styles.paginationInfo}>
        <Text style={[styles.paginationText, { color: theme.colors.text }]}>
          Página {currentPage} de {totalPages}
        </Text>
      </View>
      <View style={styles.paginationButtons}>
        <TouchableOpacity
          style={[
            styles.paginationButton,
            {
              backgroundColor:
                currentPage === 1 ? theme.colors.border : theme.colors.primary,
              opacity: currentPage === 1 ? 0.5 : 1,
            },
          ]}
          onPress={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          <Text
            style={[
              styles.paginationButtonText,
              {
                color: currentPage === 1 ? theme.colors.textSecondary : "white",
              },
            ]}
          >
            Anterior
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.paginationButton,
            {
              backgroundColor:
                currentPage === totalPages
                  ? theme.colors.border
                  : theme.colors.primary,
              opacity: currentPage === totalPages ? 0.5 : 1,
            },
          ]}
          onPress={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          <Text
            style={[
              styles.paginationButtonText,
              {
                color:
                  currentPage === totalPages
                    ? theme.colors.textSecondary
                    : "white",
              },
            ]}
          >
            Próxima
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  paginationContainer: {
    paddingVertical: 16,
  },
  paginationInfo: {
    alignItems: "center",
    marginBottom: 12,
  },
  paginationText: {
    fontSize: 14,
    fontWeight: "500",
  },
  paginationButtons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
  },
  paginationButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
  },
  paginationButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
});

export default Pagination;
