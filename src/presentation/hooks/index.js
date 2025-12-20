/**
 * @fileoverview Exportação centralizada de todos os hooks customizados
 * @module presentation/hooks
 * 
 * @description
 * Este módulo exporta todos os hooks customizados da aplicação,
 * organizados por categoria para fácil importação.
 */

// ============================================
// Hooks de React Query (Cache e Mutations)
// ============================================
export {
  useTransactionsQuery,
  useTransactionMutations,
  useBalanceQuery,
  useTransactionsWithQuery,
} from "./useTransactionsQuery";

export {
  useCategoriesQuery,
  useCategoryMutations,
  useCategoriesWithMutations,
} from "./useCategoriesQuery";

export {
  useRecurringTransactionsQuery,
  useRecurringTransactionMutations,
  useRecurringTransactionsWithMutations,
} from "./useRecurringTransactionsQuery";

// ============================================
// Hooks de tempo real (Firebase Listeners)
// ============================================
export {
  useRealtimeTransactions,
  useRealtimeRecurringTransactions,
} from "./useRealtimeTransactions";
export { useRealtimeCategories } from "./useRealtimeCategories";

// ============================================
// Hooks de debounce e performance
// ============================================
export {
  useDebouncedSearch,
  useDebouncedCallback,
  useDebouncedValue,
  useSearchWithLoading,
} from "./useDebouncedSearch";

// ============================================
// Hooks de estado do app e sincronização
// ============================================
export {
  useAppState,
  useAutoRefresh,
  usePolling,
  useConnectionSync,
} from "./useAppState";

// ============================================
// Hooks de notificações
// ============================================
export { useRealtimeNotifications } from "./useRealtimeNotifications";

// ============================================
// Hooks de segurança e criptografia
// ============================================
export { useSecureData, useSecureForm, useSecurePIN } from "./useSecureData";

// ============================================
// Hooks de formulários e modais
// ============================================
export { useCategoryModal } from "./useCategoryModal";
export { useFormValidation } from "./useFormValidation";
export { useImagePreview } from "./useImagePreview";
export { useLogin } from "./useLogin";
export { useRecurringTransactionModal } from "./useRecurringTransactionModal";
export { useRegister } from "./useRegister";
export { useTransactionsScreen } from "./useTransactionsScreen";
export { useUnifiedTransactionModal } from "./useUnifiedTransactionModal";
