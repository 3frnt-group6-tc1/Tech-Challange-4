/**
 * @fileoverview Hook para gerenciamento de transações recorrentes com React Query
 * @module presentation/hooks/useRecurringTransactionsQuery
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { queryKeys, invalidateQueries } from "../../infrastructure/config/queryClient";
import { firestoreService } from "../../infrastructure/services/firestoreService";

/**
 * Hook para buscar transações recorrentes do usuário com React Query
 * 
 * @description
 * Gerencia transações recorrentes (mensais, semanais, etc.) com cache inteligente.
 * Ideal para assinaturas, salários, contas fixas, etc.
 * 
 * @param {string} userId - ID do usuário
 * @param {Object} [options] - Opções adicionais
 * @param {boolean} [options.enabled=true] - Se a query deve ser executada
 * 
 * @returns {Object} Objeto com dados e funções
 * @returns {Array} returns.recurringTransactions - Lista de transações recorrentes
 * @returns {boolean} returns.isLoading - Se está carregando
 * @returns {Function} returns.refetch - Função para recarregar
 * 
 * @example
 * const { recurringTransactions, isLoading } = useRecurringTransactionsQuery(userId);
 */
export const useRecurringTransactionsQuery = (userId, options = {}) => {
  const { enabled = true } = options;

  const query = useQuery({
    queryKey: queryKeys.recurringTransactions(userId),
    queryFn: async () => {
      if (!userId) return [];
      const transactions = await firestoreService.getUserRecurringTransactions(userId);
      return transactions || [];
    },
    enabled: enabled && !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Separar por tipo
  const { incomeRecurring, expenseRecurring, totalMonthlyIncome, totalMonthlyExpense } = useMemo(() => {
    const data = query.data || [];
    
    const income = data.filter((t) => t.type === "income");
    const expense = data.filter((t) => t.type === "expense");

    // Calcular totais mensais (considerando frequência)
    const calculateMonthlyTotal = (transactions) => {
      return transactions.reduce((sum, t) => {
        const amount = parseFloat(t.amount) || 0;
        switch (t.frequency) {
          case "daily":
            return sum + amount * 30;
          case "weekly":
            return sum + amount * 4;
          case "biweekly":
            return sum + amount * 2;
          case "monthly":
            return sum + amount;
          case "yearly":
            return sum + amount / 12;
          default:
            return sum + amount;
        }
      }, 0);
    };

    return {
      incomeRecurring: income,
      expenseRecurring: expense,
      totalMonthlyIncome: calculateMonthlyTotal(income),
      totalMonthlyExpense: calculateMonthlyTotal(expense),
    };
  }, [query.data]);

  return {
    recurringTransactions: query.data || [],
    incomeRecurring,
    expenseRecurring,
    totalMonthlyIncome,
    totalMonthlyExpense,
    monthlyBalance: totalMonthlyIncome - totalMonthlyExpense,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
};

/**
 * Hook para mutations de transações recorrentes
 * 
 * @param {string} userId - ID do usuário
 * @returns {Object} Funções de mutation
 * 
 * @example
 * const { createRecurring, updateRecurring, deleteRecurring } = useRecurringMutations(userId);
 */
export const useRecurringTransactionMutations = (userId) => {
  const queryClient = useQueryClient();

  // Mutation para criar transação recorrente
  const createMutation = useMutation({
    mutationFn: async (transactionData) => {
      return await firestoreService.addUserRecurringTransaction(userId, transactionData);
    },
    onMutate: async (newTransaction) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.recurringTransactions(userId) });

      const previousData = queryClient.getQueryData(queryKeys.recurringTransactions(userId));

      const optimisticTransaction = {
        ...newTransaction,
        id: `temp-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData(queryKeys.recurringTransactions(userId), (old = []) => [
        optimisticTransaction,
        ...old,
      ]);

      return { previousData };
    },
    onError: (err, newTransaction, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKeys.recurringTransactions(userId), context.previousData);
      }
      console.error("Erro ao criar transação recorrente:", err);
    },
    onSettled: () => {
      invalidateQueries.recurringTransactions(userId);
    },
  });

  // Mutation para atualizar transação recorrente
  const updateMutation = useMutation({
    mutationFn: async ({ transactionId, updates }) => {
      return await firestoreService.updateUserRecurringTransaction(userId, transactionId, updates);
    },
    onMutate: async ({ transactionId, updates }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.recurringTransactions(userId) });

      const previousData = queryClient.getQueryData(queryKeys.recurringTransactions(userId));

      queryClient.setQueryData(queryKeys.recurringTransactions(userId), (old = []) =>
        old.map((t) =>
          t.id === transactionId ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
        )
      );

      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKeys.recurringTransactions(userId), context.previousData);
      }
      console.error("Erro ao atualizar transação recorrente:", err);
    },
    onSettled: () => {
      invalidateQueries.recurringTransactions(userId);
    },
  });

  // Mutation para deletar transação recorrente
  const deleteMutation = useMutation({
    mutationFn: async (transactionId) => {
      return await firestoreService.deleteUserRecurringTransaction(userId, transactionId);
    },
    onMutate: async (transactionId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.recurringTransactions(userId) });

      const previousData = queryClient.getQueryData(queryKeys.recurringTransactions(userId));

      queryClient.setQueryData(queryKeys.recurringTransactions(userId), (old = []) =>
        old.filter((t) => t.id !== transactionId)
      );

      return { previousData };
    },
    onError: (err, transactionId, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKeys.recurringTransactions(userId), context.previousData);
      }
      console.error("Erro ao deletar transação recorrente:", err);
    },
    onSettled: () => {
      invalidateQueries.recurringTransactions(userId);
    },
  });

  return {
    createRecurring: createMutation.mutate,
    createRecurringAsync: createMutation.mutateAsync,
    updateRecurring: updateMutation.mutate,
    updateRecurringAsync: updateMutation.mutateAsync,
    deleteRecurring: deleteMutation.mutate,
    deleteRecurringAsync: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

/**
 * Hook combinado para transações recorrentes
 * 
 * @param {string} userId - ID do usuário
 * @returns {Object} Objeto completo com dados e funções
 * 
 * @example
 * const {
 *   recurringTransactions,
 *   monthlyBalance,
 *   createRecurring,
 *   deleteRecurring
 * } = useRecurringTransactions(userId);
 */
export const useRecurringTransactionsWithMutations = (userId) => {
  const queryData = useRecurringTransactionsQuery(userId);
  const mutations = useRecurringTransactionMutations(userId);

  return {
    ...queryData,
    ...mutations,
  };
};

export default useRecurringTransactionsQuery;

