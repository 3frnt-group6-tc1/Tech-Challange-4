/**
 * @fileoverview Hook para gerenciamento de transações com React Query
 * @module presentation/hooks/useTransactionsQuery
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { queryKeys, invalidateQueries } from "../../infrastructure/config/queryClient";
import { firestoreService } from "../../infrastructure/services/firestoreService";

/**
 * Hook para buscar transações do usuário com React Query
 * 
 * @description
 * Utiliza React Query para:
 * - Cache automático de transações
 * - Revalidação inteligente
 * - Estados de loading/error
 * - Atualizações otimistas
 * 
 * @param {string} userId - ID do usuário
 * @param {Object} [options] - Opções adicionais
 * @param {boolean} [options.enabled=true] - Se a query deve ser executada
 * @param {Object} [options.filters] - Filtros para as transações
 * 
 * @returns {Object} Objeto com dados e funções de manipulação
 * @returns {Array} returns.transactions - Lista de transações
 * @returns {boolean} returns.isLoading - Se está carregando
 * @returns {boolean} returns.isFetching - Se está buscando em background
 * @returns {Error|null} returns.error - Erro se houver
 * @returns {Function} returns.refetch - Função para recarregar dados
 * 
 * @example
 * const { transactions, isLoading, error } = useTransactionsQuery(userId);
 */
export const useTransactionsQuery = (userId, options = {}) => {
  const { enabled = true, filters = {} } = options;

  const query = useQuery({
    queryKey: queryKeys.transactions(userId),
    queryFn: async () => {
      if (!userId) return [];
      const transactions = await firestoreService.getUserTransactions(userId);
      return transactions || [];
    },
    enabled: enabled && !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutos para transações
  });

  // Aplicar filtros localmente (já que temos os dados em cache)
  const filteredTransactions = useMemo(() => {
    if (!query.data) return [];
    
    let result = [...query.data];

    if (filters.type && filters.type !== "all") {
      result = result.filter((t) => t.type === filters.type);
    }

    if (filters.category) {
      result = result.filter((t) => t.category === filters.category);
    }

    if (filters.startDate) {
      result = result.filter((t) => new Date(t.date) >= new Date(filters.startDate));
    }

    if (filters.endDate) {
      result = result.filter((t) => new Date(t.date) <= new Date(filters.endDate));
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (t) =>
          t.description?.toLowerCase().includes(searchLower) ||
          t.title?.toLowerCase().includes(searchLower) ||
          t.category?.toLowerCase().includes(searchLower)
      );
    }

    return result;
  }, [query.data, filters]);

  return {
    transactions: filteredTransactions,
    allTransactions: query.data || [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
    isStale: query.isStale,
  };
};

/**
 * Hook para mutations de transações com atualizações otimistas
 * 
 * @description
 * Implementa padrão de atualização otimista:
 * 1. Atualiza UI imediatamente
 * 2. Envia request para servidor
 * 3. Reverte em caso de erro
 * 
 * @param {string} userId - ID do usuário
 * 
 * @returns {Object} Objeto com funções de mutation
 * @returns {Function} returns.createTransaction - Criar transação
 * @returns {Function} returns.updateTransaction - Atualizar transação
 * @returns {Function} returns.deleteTransaction - Deletar transação
 * @returns {boolean} returns.isCreating - Se está criando
 * @returns {boolean} returns.isUpdating - Se está atualizando
 * @returns {boolean} returns.isDeleting - Se está deletando
 * 
 * @example
 * const { createTransaction, isCreating } = useTransactionMutations(userId);
 * 
 * const handleCreate = async (data) => {
 *   await createTransaction(data);
 * };
 */
export const useTransactionMutations = (userId) => {
  const queryClient = useQueryClient();

  // Mutation para criar transação
  const createMutation = useMutation({
    mutationFn: async (transactionData) => {
      return await firestoreService.addUserTransaction(userId, transactionData);
    },
    onMutate: async (newTransaction) => {
      // Cancelar queries em andamento
      await queryClient.cancelQueries({ queryKey: queryKeys.transactions(userId) });

      // Snapshot do valor anterior
      const previousTransactions = queryClient.getQueryData(queryKeys.transactions(userId));

      // Atualização otimística
      const optimisticTransaction = {
        ...newTransaction,
        id: `temp-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData(queryKeys.transactions(userId), (old = []) => [
        optimisticTransaction,
        ...old,
      ]);

      return { previousTransactions };
    },
    onError: (err, newTransaction, context) => {
      // Reverter em caso de erro
      if (context?.previousTransactions) {
        queryClient.setQueryData(
          queryKeys.transactions(userId),
          context.previousTransactions
        );
      }
      console.error("Erro ao criar transação:", err);
    },
    onSettled: () => {
      // Invalidar e refetch para garantir dados atualizados
      invalidateQueries.transactions(userId);
      invalidateQueries.balance(userId);
    },
  });

  // Mutation para atualizar transação
  const updateMutation = useMutation({
    mutationFn: async ({ transactionId, updates }) => {
      return await firestoreService.updateUserTransaction(userId, transactionId, updates);
    },
    onMutate: async ({ transactionId, updates }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.transactions(userId) });

      const previousTransactions = queryClient.getQueryData(queryKeys.transactions(userId));

      queryClient.setQueryData(queryKeys.transactions(userId), (old = []) =>
        old.map((t) =>
          t.id === transactionId ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
        )
      );

      return { previousTransactions };
    },
    onError: (err, variables, context) => {
      if (context?.previousTransactions) {
        queryClient.setQueryData(
          queryKeys.transactions(userId),
          context.previousTransactions
        );
      }
      console.error("Erro ao atualizar transação:", err);
    },
    onSettled: () => {
      invalidateQueries.transactions(userId);
      invalidateQueries.balance(userId);
    },
  });

  // Mutation para deletar transação
  const deleteMutation = useMutation({
    mutationFn: async (transactionId) => {
      return await firestoreService.deleteUserTransaction(userId, transactionId);
    },
    onMutate: async (transactionId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.transactions(userId) });

      const previousTransactions = queryClient.getQueryData(queryKeys.transactions(userId));

      queryClient.setQueryData(queryKeys.transactions(userId), (old = []) =>
        old.filter((t) => t.id !== transactionId)
      );

      return { previousTransactions };
    },
    onError: (err, transactionId, context) => {
      if (context?.previousTransactions) {
        queryClient.setQueryData(
          queryKeys.transactions(userId),
          context.previousTransactions
        );
      }
      console.error("Erro ao deletar transação:", err);
    },
    onSettled: () => {
      invalidateQueries.transactions(userId);
      invalidateQueries.balance(userId);
    },
  });

  return {
    createTransaction: createMutation.mutate,
    createTransactionAsync: createMutation.mutateAsync,
    updateTransaction: updateMutation.mutate,
    updateTransactionAsync: updateMutation.mutateAsync,
    deleteTransaction: deleteMutation.mutate,
    deleteTransactionAsync: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    createError: createMutation.error,
    updateError: updateMutation.error,
    deleteError: deleteMutation.error,
  };
};

/**
 * Hook para buscar balanço/saldo do usuário
 * 
 * @param {string} userId - ID do usuário
 * @returns {Object} Objeto com dados do balanço
 * 
 * @example
 * const { balance, income, expense, isLoading } = useBalanceQuery(userId);
 */
export const useBalanceQuery = (userId) => {
  const { allTransactions, isLoading } = useTransactionsQuery(userId);

  const balanceData = useMemo(() => {
    if (!allTransactions || allTransactions.length === 0) {
      return { balance: 0, income: 0, expense: 0 };
    }

    const income = allTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

    const expense = allTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

    return {
      balance: income - expense,
      income,
      expense,
    };
  }, [allTransactions]);

  return {
    ...balanceData,
    isLoading,
  };
};

/**
 * Hook combinado para transações com queries e mutations
 * 
 * @param {string} userId - ID do usuário
 * @param {Object} [options] - Opções
 * @returns {Object} Objeto completo com dados e funções
 * 
 * @example
 * const {
 *   transactions,
 *   isLoading,
 *   createTransaction,
 *   deleteTransaction,
 *   balance
 * } = useTransactions(userId);
 */
export const useTransactionsWithQuery = (userId, options = {}) => {
  const queryData = useTransactionsQuery(userId, options);
  const mutations = useTransactionMutations(userId);
  const balance = useBalanceQuery(userId);

  return {
    ...queryData,
    ...mutations,
    balance: balance.balance,
    income: balance.income,
    expense: balance.expense,
  };
};

export default useTransactionsQuery;

