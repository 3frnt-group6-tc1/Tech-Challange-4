/**
 * @fileoverview Hook para gerenciamento de categorias com React Query
 * @module presentation/hooks/useCategoriesQuery
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { queryKeys, invalidateQueries } from "../../infrastructure/config/queryClient";
import { firestoreService } from "../../infrastructure/services/firestoreService";

/**
 * Hook para buscar categorias do usuário com React Query
 * 
 * @description
 * Fornece acesso às categorias do usuário com cache inteligente.
 * As categorias são separadas por tipo (income/expense) para fácil acesso.
 * 
 * @param {string} userId - ID do usuário
 * @param {Object} [options] - Opções adicionais
 * @param {boolean} [options.enabled=true] - Se a query deve ser executada
 * 
 * @returns {Object} Objeto com dados e funções de categorias
 * @returns {Array} returns.categories - Todas as categorias
 * @returns {Array} returns.incomeCategories - Categorias de receita
 * @returns {Array} returns.expenseCategories - Categorias de despesa
 * @returns {boolean} returns.isLoading - Se está carregando
 * @returns {Function} returns.refetch - Função para recarregar
 * 
 * @example
 * const { categories, incomeCategories, expenseCategories } = useCategoriesQuery(userId);
 */
export const useCategoriesQuery = (userId, options = {}) => {
  const { enabled = true } = options;

  const query = useQuery({
    queryKey: queryKeys.categories(userId),
    queryFn: async () => {
      if (!userId) return { income: [], expense: [] };
      const categories = await firestoreService.getUserCategories(userId);
      return categories || { income: [], expense: [] };
    },
    enabled: enabled && !!userId,
    staleTime: 30 * 60 * 1000, // 30 minutos - categorias mudam pouco
  });

  // Separar categorias por tipo
  const { incomeCategories, expenseCategories, allCategories } = useMemo(() => {
    const data = query.data || { income: [], expense: [] };
    return {
      incomeCategories: data.income || [],
      expenseCategories: data.expense || [],
      allCategories: [...(data.income || []), ...(data.expense || [])],
    };
  }, [query.data]);

  return {
    categories: query.data,
    allCategories,
    incomeCategories,
    expenseCategories,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
};

/**
 * Hook para mutations de categorias
 * 
 * @param {string} userId - ID do usuário
 * @returns {Object} Funções de mutation para categorias
 * 
 * @example
 * const { addCategory, removeCategory } = useCategoryMutations(userId);
 * 
 * await addCategory({ name: 'Nova Categoria', type: 'expense' });
 */
export const useCategoryMutations = (userId) => {
  const queryClient = useQueryClient();

  // Mutation para adicionar categoria
  const addMutation = useMutation({
    mutationFn: async ({ name, type }) => {
      return await firestoreService.addUserCategory(userId, name, type);
    },
    onMutate: async ({ name, type }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.categories(userId) });

      const previousCategories = queryClient.getQueryData(queryKeys.categories(userId));

      queryClient.setQueryData(queryKeys.categories(userId), (old = { income: [], expense: [] }) => ({
        ...old,
        [type]: [...(old[type] || []), name],
      }));

      return { previousCategories };
    },
    onError: (err, variables, context) => {
      if (context?.previousCategories) {
        queryClient.setQueryData(queryKeys.categories(userId), context.previousCategories);
      }
      console.error("Erro ao adicionar categoria:", err);
    },
    onSettled: () => {
      invalidateQueries.categories(userId);
    },
  });

  // Mutation para remover categoria
  const removeMutation = useMutation({
    mutationFn: async ({ name, type }) => {
      return await firestoreService.removeUserCategory(userId, name, type);
    },
    onMutate: async ({ name, type }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.categories(userId) });

      const previousCategories = queryClient.getQueryData(queryKeys.categories(userId));

      queryClient.setQueryData(queryKeys.categories(userId), (old = { income: [], expense: [] }) => ({
        ...old,
        [type]: (old[type] || []).filter((c) => c !== name),
      }));

      return { previousCategories };
    },
    onError: (err, variables, context) => {
      if (context?.previousCategories) {
        queryClient.setQueryData(queryKeys.categories(userId), context.previousCategories);
      }
      console.error("Erro ao remover categoria:", err);
    },
    onSettled: () => {
      invalidateQueries.categories(userId);
    },
  });

  return {
    addCategory: addMutation.mutate,
    addCategoryAsync: addMutation.mutateAsync,
    removeCategory: removeMutation.mutate,
    removeCategoryAsync: removeMutation.mutateAsync,
    isAdding: addMutation.isPending,
    isRemoving: removeMutation.isPending,
    addError: addMutation.error,
    removeError: removeMutation.error,
  };
};

/**
 * Hook combinado para categorias com queries e mutations
 * 
 * @param {string} userId - ID do usuário
 * @returns {Object} Objeto completo com dados e funções de categorias
 * 
 * @example
 * const {
 *   incomeCategories,
 *   expenseCategories,
 *   addCategory,
 *   removeCategory
 * } = useCategories(userId);
 */
export const useCategoriesWithMutations = (userId) => {
  const queryData = useCategoriesQuery(userId);
  const mutations = useCategoryMutations(userId);

  return {
    ...queryData,
    ...mutations,
  };
};

export default useCategoriesQuery;

