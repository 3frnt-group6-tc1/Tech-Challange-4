import { useState, useCallback, useRef, useEffect } from "react";

/**
 * Hook para gerenciar notificações de mudanças em tempo real
 * Mostra feedback visual quando dados são atualizados
 * 
 * @param {Object} options - Opções de configuração
 * @param {number} options.duration - Duração da notificação em ms (padrão: 3000)
 * @param {number} options.maxNotifications - Máximo de notificações simultâneas (padrão: 3)
 * @returns {Object} { notifications, showNotification, dismissNotification, clearAll }
 */
export const useRealtimeNotifications = (options = {}) => {
  const { duration = 3000, maxNotifications = 3 } = options;

  const [notifications, setNotifications] = useState([]);
  const timeoutRefs = useRef({});
  const idCounter = useRef(0);

  // Limpar timeouts no unmount
  useEffect(() => {
    return () => {
      Object.values(timeoutRefs.current).forEach(clearTimeout);
    };
  }, []);

  const showNotification = useCallback(
    ({ type = "info", title, message, icon }) => {
      const id = `notification_${++idCounter.current}`;

      const newNotification = {
        id,
        type, // 'success' | 'info' | 'warning' | 'error' | 'sync'
        title,
        message,
        icon,
        timestamp: new Date(),
      };

      setNotifications((prev) => {
        // Remover notificações mais antigas se exceder o limite
        const updated = [newNotification, ...prev];
        if (updated.length > maxNotifications) {
          const removed = updated.slice(maxNotifications);
          removed.forEach((n) => {
            if (timeoutRefs.current[n.id]) {
              clearTimeout(timeoutRefs.current[n.id]);
              delete timeoutRefs.current[n.id];
            }
          });
          return updated.slice(0, maxNotifications);
        }
        return updated;
      });

      // Auto-dismiss após duration
      timeoutRefs.current[id] = setTimeout(() => {
        dismissNotification(id);
      }, duration);

      return id;
    },
    [duration, maxNotifications]
  );

  const dismissNotification = useCallback((id) => {
    if (timeoutRefs.current[id]) {
      clearTimeout(timeoutRefs.current[id]);
      delete timeoutRefs.current[id];
    }

    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    Object.values(timeoutRefs.current).forEach(clearTimeout);
    timeoutRefs.current = {};
    setNotifications([]);
  }, []);

  // Helpers para tipos específicos de notificação
  const showSyncNotification = useCallback(
    (message) => {
      return showNotification({
        type: "sync",
        title: "Sincronizado",
        message,
        icon: "sync",
      });
    },
    [showNotification]
  );

  const showUpdateNotification = useCallback(
    (message) => {
      return showNotification({
        type: "info",
        title: "Atualização",
        message,
        icon: "refresh",
      });
    },
    [showNotification]
  );

  const showNewDataNotification = useCallback(
    (message) => {
      return showNotification({
        type: "success",
        title: "Novo dado",
        message,
        icon: "add",
      });
    },
    [showNotification]
  );

  return {
    notifications,
    showNotification,
    dismissNotification,
    clearAll,
    // Helpers
    showSyncNotification,
    showUpdateNotification,
    showNewDataNotification,
  };
};

export default useRealtimeNotifications;

