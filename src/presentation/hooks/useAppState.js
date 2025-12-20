import { useState, useEffect, useCallback, useRef } from "react";
import { AppState, Platform } from "react-native";

/**
 * Hook para monitorar estado do app (foreground/background)
 * Permite executar ações quando o app volta ao foreground
 * 
 * @param {Object} options - Opções de configuração
 * @param {Function} options.onForeground - Callback quando app volta ao foreground
 * @param {Function} options.onBackground - Callback quando app vai para background
 * @param {boolean} options.enableAutoRefresh - Habilitar auto-refresh ao voltar (padrão: true)
 * @param {number} options.minBackgroundTime - Tempo mínimo em background para refresh (ms, padrão: 30000)
 * @returns {Object} { appState, isActive, lastActiveTime, timeSinceActive }
 */
export const useAppState = (options = {}) => {
  const {
    onForeground,
    onBackground,
    enableAutoRefresh = true,
    minBackgroundTime = 30000, // 30 segundos
  } = options;

  const [appState, setAppState] = useState(AppState.currentState);
  const [isActive, setIsActive] = useState(appState === "active");
  const [lastActiveTime, setLastActiveTime] = useState(new Date());
  const backgroundTimeRef = useRef(null);

  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      const previousState = appState;
      setAppState(nextAppState);

      // App voltando ao foreground
      if (
        (previousState === "background" || previousState === "inactive") &&
        nextAppState === "active"
      ) {
        setIsActive(true);
        setLastActiveTime(new Date());

        // Verificar se passou tempo suficiente em background
        if (backgroundTimeRef.current) {
          const timeInBackground = Date.now() - backgroundTimeRef.current;
          
          if (enableAutoRefresh && timeInBackground >= minBackgroundTime) {
            console.log(
              `App retornou após ${Math.round(timeInBackground / 1000)}s em background`
            );
            onForeground?.({ timeInBackground });
          }
        }

        backgroundTimeRef.current = null;
      }

      // App indo para background
      if (
        previousState === "active" &&
        (nextAppState === "background" || nextAppState === "inactive")
      ) {
        setIsActive(false);
        backgroundTimeRef.current = Date.now();
        onBackground?.();
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      subscription?.remove();
    };
  }, [appState, onForeground, onBackground, enableAutoRefresh, minBackgroundTime]);

  // Calcular tempo desde última atividade
  const timeSinceActive = useCallback(() => {
    return Date.now() - lastActiveTime.getTime();
  }, [lastActiveTime]);

  return {
    appState,
    isActive,
    lastActiveTime,
    timeSinceActive,
  };
};

/**
 * Hook para auto-refresh de dados quando app volta ao foreground
 * 
 * @param {Function} refreshFunction - Função de refresh a ser chamada
 * @param {Object} options - Opções de configuração
 * @param {boolean} options.enabled - Habilitar auto-refresh (padrão: true)
 * @param {number} options.minBackgroundTime - Tempo mínimo em background (ms, padrão: 30000)
 * @param {boolean} options.refreshOnMount - Executar refresh no mount (padrão: false)
 * @returns {Object} { isRefreshing, lastRefreshTime, manualRefresh }
 */
export const useAutoRefresh = (refreshFunction, options = {}) => {
  const {
    enabled = true,
    minBackgroundTime = 30000,
    refreshOnMount = false,
  } = options;

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState(null);
  const refreshFunctionRef = useRef(refreshFunction);

  // Manter referência atualizada da função
  useEffect(() => {
    refreshFunctionRef.current = refreshFunction;
  }, [refreshFunction]);

  const executeRefresh = useCallback(async () => {
    if (isRefreshing) return;

    try {
      setIsRefreshing(true);
      await refreshFunctionRef.current?.();
      setLastRefreshTime(new Date());
    } catch (error) {
      console.error("Erro no auto-refresh:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing]);

  // Handler para quando app volta ao foreground
  const handleForeground = useCallback(
    ({ timeInBackground }) => {
      if (enabled) {
        console.log("Auto-refresh ativado após retorno do background");
        executeRefresh();
      }
    },
    [enabled, executeRefresh]
  );

  // Monitorar estado do app
  useAppState({
    onForeground: handleForeground,
    enableAutoRefresh: enabled,
    minBackgroundTime,
  });

  // Refresh opcional no mount
  useEffect(() => {
    if (refreshOnMount) {
      executeRefresh();
    }
  }, [refreshOnMount]); // eslint-disable-line react-hooks/exhaustive-deps

  // Função para refresh manual
  const manualRefresh = useCallback(() => {
    return executeRefresh();
  }, [executeRefresh]);

  return {
    isRefreshing,
    lastRefreshTime,
    manualRefresh,
  };
};

/**
 * Hook para polling periódico de dados
 * Útil para dados que precisam ser atualizados constantemente
 * 
 * @param {Function} fetchFunction - Função de fetch a ser chamada
 * @param {Object} options - Opções de configuração
 * @param {number} options.interval - Intervalo em ms (padrão: 60000 - 1 minuto)
 * @param {boolean} options.enabled - Habilitar polling (padrão: true)
 * @param {boolean} options.pauseOnBackground - Pausar quando em background (padrão: true)
 * @param {boolean} options.fetchOnMount - Executar fetch no mount (padrão: true)
 * @returns {Object} { data, isLoading, error, lastFetchTime, refetch }
 */
export const usePolling = (fetchFunction, options = {}) => {
  const {
    interval = 60000, // 1 minuto
    enabled = true,
    pauseOnBackground = true,
    fetchOnMount = true,
  } = options;

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(null);
  
  const intervalRef = useRef(null);
  const fetchFunctionRef = useRef(fetchFunction);
  const { isActive } = useAppState({});

  // Manter referência atualizada
  useEffect(() => {
    fetchFunctionRef.current = fetchFunction;
  }, [fetchFunction]);

  const executeFetch = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await fetchFunctionRef.current?.();
      setData(result);
      setLastFetchTime(new Date());
    } catch (err) {
      console.error("Erro no polling:", err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Configurar intervalo de polling
  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Pausar se app em background
    if (pauseOnBackground && !isActive) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Iniciar intervalo
    intervalRef.current = setInterval(executeFetch, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, interval, isActive, pauseOnBackground, executeFetch]);

  // Fetch inicial
  useEffect(() => {
    if (fetchOnMount && enabled) {
      executeFetch();
    }
  }, [fetchOnMount, enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  const refetch = useCallback(() => {
    return executeFetch();
  }, [executeFetch]);

  return {
    data,
    isLoading,
    error,
    lastFetchTime,
    refetch,
  };
};

/**
 * Hook para detectar conectividade e sincronizar dados
 * quando a conexão é restaurada
 * 
 * @param {Function} syncFunction - Função de sincronização
 * @param {Object} options - Opções de configuração
 * @returns {Object} { isSyncing, lastSyncTime, syncNow }
 */
export const useConnectionSync = (syncFunction, options = {}) => {
  const { enabled = true } = options;

  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const syncFunctionRef = useRef(syncFunction);

  useEffect(() => {
    syncFunctionRef.current = syncFunction;
  }, [syncFunction]);

  const executeSync = useCallback(async () => {
    if (isSyncing || !enabled) return;

    try {
      setIsSyncing(true);
      await syncFunctionRef.current?.();
      setLastSyncTime(new Date());
    } catch (error) {
      console.error("Erro na sincronização:", error);
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, enabled]);

  // Monitorar mudanças no estado do app para sincronizar
  useAppState({
    onForeground: () => {
      if (enabled) {
        console.log("Sincronizando dados após retorno do foreground");
        executeSync();
      }
    },
    enableAutoRefresh: enabled,
    minBackgroundTime: 10000, // Sincronizar após 10s em background
  });

  return {
    isSyncing,
    lastSyncTime,
    syncNow: executeSync,
  };
};

export default useAppState;

