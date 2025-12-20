// Hooks de tempo real
export {
  useRealtimeTransactions,
  useRealtimeRecurringTransactions,
} from "./useRealtimeTransactions";
export { useRealtimeCategories } from "./useRealtimeCategories";

// Hooks de debounce
export {
  useDebouncedSearch,
  useDebouncedCallback,
  useDebouncedValue,
  useSearchWithLoading,
} from "./useDebouncedSearch";

// Hooks de estado do app e sincronização
export {
  useAppState,
  useAutoRefresh,
  usePolling,
  useConnectionSync,
} from "./useAppState";

// Hooks de notificações
export { useRealtimeNotifications } from "./useRealtimeNotifications";

// Hooks existentes (legacy)
export { useCategoryModal } from "./useCategoryModal";
export { useFormValidation } from "./useFormValidation";
export { useImagePreview } from "./useImagePreview";
export { useLogin } from "./useLogin";
export { useRecurringTransactionModal } from "./useRecurringTransactionModal";
export { useRegister } from "./useRegister";
export { useTransactionsScreen } from "./useTransactionsScreen";
export { useUnifiedTransactionModal } from "./useUnifiedTransactionModal";

