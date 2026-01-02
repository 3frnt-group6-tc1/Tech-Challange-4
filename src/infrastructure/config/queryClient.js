/**
 * @fileoverview Configuração global do React Query para gerenciamento de cache e requisições
 * @module infrastructure/config/queryClient
 */

import { QueryClient } from "@tanstack/react-query";

/**
 * Cliente global do React Query com configurações otimizadas para a aplicação
 * 
 * @description
 * Configurações de cache:
 * - staleTime: 5 minutos - tempo até os dados serem considerados obsoletos
 * - gcTime: 10 minutos - tempo até dados não utilizados serem removidos do cache
 * - retry: 3 tentativas para queries, 1 para mutations
 * - refetchOnWindowFocus: desabilitado para React Native
 * 
 * @example
 * // Uso no AppProvider
 * import { queryClient } from './queryClient';
 * 
 * <QueryClientProvider client={queryClient}>
 *   {children}
 * </QueryClientProvider>
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Tempo até os dados serem considerados "stale" (obsoletos)
      staleTime: 5 * 60 * 1000, // 5 minutos

      // Tempo até dados não utilizados serem removidos do cache (garbage collection)
      gcTime: 10 * 60 * 1000, // 10 minutos

      // Número de tentativas em caso de erro
      retry: 3,

      // Intervalo entre tentativas (exponencial)
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Desabilitar refetch automático ao focar (não aplicável em React Native da mesma forma)
      refetchOnWindowFocus: false,

      // Não refazer query quando reconectar
      refetchOnReconnect: true,

      // Manter dados anteriores enquanto carrega novos
      placeholderData: (previousData) => previousData,
    },
    mutations: {
      // Apenas 1 tentativa para mutations
      retry: 1,

      // Callback global de erro para mutations
      onError: (error) => {
        console.error("Mutation error:", error);
      },
    },
  },
});

/**
 * Chaves de query padronizadas para uso consistente
 * 
 * @example
 * // Usar em queries
 * useQuery({
 *   queryKey: queryKeys.transactions(userId),
 *   queryFn: () => fetchTransactions(userId)
 * });
 */
export const queryKeys = {
  /** Chave para transações do usuário */
  transactions: (userId) => ["transactions", userId],
  
  /** Chave para uma transação específica */
  transaction: (userId, transactionId) => ["transactions", userId, transactionId],
  
  /** Chave para transações recorrentes */
  recurringTransactions: (userId) => ["recurringTransactions", userId],
  
  /** Chave para categorias */
  categories: (userId) => ["categories", userId],
  
  /** Chave para preferências do usuário */
  userPreferences: (userId) => ["userPreferences", userId],
  
  /** Chave para balanço/saldo */
  balance: (userId) => ["balance", userId],
  
  /** Chave para relatórios */
  reports: (userId, filters) => ["reports", userId, filters],
};

/**
 * Funções utilitárias para invalidação de cache
 */
export const invalidateQueries = {
  /**
   * Invalida todas as queries de transações do usuário
   * @param {string} userId - ID do usuário
   */
  transactions: (userId) => {
    queryClient.invalidateQueries({ queryKey: ["transactions", userId] });
  },

  /**
   * Invalida todas as queries de transações recorrentes
   * @param {string} userId - ID do usuário
   */
  recurringTransactions: (userId) => {
    queryClient.invalidateQueries({ queryKey: ["recurringTransactions", userId] });
  },

  /**
   * Invalida todas as queries de categorias
   * @param {string} userId - ID do usuário
   */
  categories: (userId) => {
    queryClient.invalidateQueries({ queryKey: ["categories", userId] });
  },

  /**
   * Invalida o balanço do usuário
   * @param {string} userId - ID do usuário
   */
  balance: (userId) => {
    queryClient.invalidateQueries({ queryKey: ["balance", userId] });
  },

  /**
   * Invalida todas as queries do usuário
   * @param {string} userId - ID do usuário
   */
  all: (userId) => {
    queryClient.invalidateQueries({ queryKey: ["transactions", userId] });
    queryClient.invalidateQueries({ queryKey: ["recurringTransactions", userId] });
    queryClient.invalidateQueries({ queryKey: ["categories", userId] });
    queryClient.invalidateQueries({ queryKey: ["balance", userId] });
  },
};

export default queryClient;

