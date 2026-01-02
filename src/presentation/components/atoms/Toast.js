import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../domain/contexts/ThemeContext";

/**
 * Componente Toast individual
 */
const ToastItem = ({ notification, onDismiss }) => {
  const { theme } = useTheme();
  const opacity = new Animated.Value(0);
  const translateY = new Animated.Value(-20);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const getTypeStyles = () => {
    switch (notification.type) {
      case "success":
        return {
          backgroundColor: "#4CAF50",
          icon: "checkmark-circle",
        };
      case "error":
        return {
          backgroundColor: "#F44336",
          icon: "close-circle",
        };
      case "warning":
        return {
          backgroundColor: "#FF9800",
          icon: "warning",
        };
      case "sync":
        return {
          backgroundColor: "#2196F3",
          icon: "sync",
        };
      case "info":
      default:
        return {
          backgroundColor: theme.colors.primary,
          icon: "information-circle",
        };
    }
  };

  const typeStyles = getTypeStyles();

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          backgroundColor: typeStyles.backgroundColor,
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <View style={styles.iconContainer}>
        <Ionicons
          name={notification.icon || typeStyles.icon}
          size={24}
          color="#FFFFFF"
        />
      </View>
      <View style={styles.content}>
        {notification.title && (
          <Text style={styles.title}>{notification.title}</Text>
        )}
        {notification.message && (
          <Text style={styles.message}>{notification.message}</Text>
        )}
      </View>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => onDismiss(notification.id)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="close" size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </Animated.View>
  );
};

/**
 * Container de Toasts para exibir notificações
 */
export const ToastContainer = ({ notifications, onDismiss }) => {
  if (!notifications || notifications.length === 0) {
    return null;
  }

  return (
    <View style={styles.container} pointerEvents="box-none">
      {notifications.map((notification) => (
        <ToastItem
          key={notification.id}
          notification={notification}
          onDismiss={onDismiss}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 50,
    left: 16,
    right: 16,
    zIndex: 9999,
    elevation: 9999,
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  iconContainer: {
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  message: {
    color: "#FFFFFF",
    fontSize: 13,
    opacity: 0.9,
  },
  closeButton: {
    marginLeft: 8,
    padding: 4,
  },
});

export default ToastContainer;

