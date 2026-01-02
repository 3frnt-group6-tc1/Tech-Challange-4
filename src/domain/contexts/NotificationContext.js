import React, { createContext, useContext, useCallback, useRef } from "react";
import { useRealtimeNotifications } from "../../presentation/hooks/useRealtimeNotifications";
import { ToastContainer } from "../../presentation/components/atoms/Toast";

const NotificationContext = createContext();

/**
 * Hook para acessar o sistema de notificações
 * @returns {Object} { showNotification, showSyncNotification, showUpdateNotification, showNewDataNotification, clearAll }
 */
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};

/**
 * Provider para o sistema de notificações em tempo real
 * Envolva seu App com este provider para habilitar notificações
 */
export const NotificationProvider = ({ children }) => {
  const {
    notifications,
    showNotification,
    dismissNotification,
    clearAll,
    showSyncNotification,
    showUpdateNotification,
    showNewDataNotification,
  } = useRealtimeNotifications({
    duration: 3000,
    maxNotifications: 3,
  });

  // Prevenir notificações duplicadas em curto período
  const lastNotificationRef = useRef({});
  const DEBOUNCE_TIME = 2000; // 2 segundos

  const debouncedShowNotification = useCallback(
    (config) => {
      const key = `${config.type}_${config.title}_${config.message}`;
      const now = Date.now();

      if (
        lastNotificationRef.current[key] &&
        now - lastNotificationRef.current[key] < DEBOUNCE_TIME
      ) {
        return null; // Ignorar notificação duplicada
      }

      lastNotificationRef.current[key] = now;
      return showNotification(config);
    },
    [showNotification]
  );

  const value = {
    showNotification: debouncedShowNotification,
    showSyncNotification: useCallback(
      (message) => {
        return debouncedShowNotification({
          type: "sync",
          title: "Sincronizado",
          message,
          icon: "sync",
        });
      },
      [debouncedShowNotification]
    ),
    showUpdateNotification: useCallback(
      (message) => {
        return debouncedShowNotification({
          type: "info",
          title: "Atualização",
          message,
          icon: "refresh",
        });
      },
      [debouncedShowNotification]
    ),
    showNewDataNotification: useCallback(
      (message) => {
        return debouncedShowNotification({
          type: "success",
          title: "Novo dado",
          message,
          icon: "add-circle",
        });
      },
      [debouncedShowNotification]
    ),
    clearAll,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <ToastContainer
        notifications={notifications}
        onDismiss={dismissNotification}
      />
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;

