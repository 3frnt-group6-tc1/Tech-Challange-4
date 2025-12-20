import { useEffect, useRef } from "react";
import { useTransactions } from "../../domain/contexts/TransactionsContext";
import { useNotifications } from "../../domain/contexts/NotificationContext";

/**
 * Componente que monitora mudanças em tempo real e exibe notificações
 * Deve ser colocado dentro de NotificationProvider e TransactionsProvider
 */
const RealtimeNotifier = () => {
  const { transactions, recurringTransactions } = useTransactions();
  const { showUpdateNotification, showNewDataNotification } = useNotifications();

  // Refs para rastrear valores anteriores
  const prevTransactionsCount = useRef(null);
  const prevRecurringCount = useRef(null);
  const isFirstRender = useRef(true);

  // Monitorar mudanças em transações
  useEffect(() => {
    // Ignorar primeiro render (carregamento inicial)
    if (isFirstRender.current) {
      prevTransactionsCount.current = transactions.length;
      return;
    }

    const prevCount = prevTransactionsCount.current;
    const currentCount = transactions.length;

    if (prevCount !== null && currentCount !== prevCount) {
      if (currentCount > prevCount) {
        const diff = currentCount - prevCount;
        showNewDataNotification(
          diff === 1
            ? "Nova transação adicionada"
            : `${diff} novas transações adicionadas`
        );
      } else if (currentCount < prevCount) {
        showUpdateNotification("Transação removida");
      }
    }

    prevTransactionsCount.current = currentCount;
  }, [transactions.length, showUpdateNotification, showNewDataNotification]);

  // Monitorar mudanças em transações recorrentes
  useEffect(() => {
    // Ignorar primeiro render
    if (isFirstRender.current) {
      prevRecurringCount.current = recurringTransactions.length;
      isFirstRender.current = false;
      return;
    }

    const prevCount = prevRecurringCount.current;
    const currentCount = recurringTransactions.length;

    if (prevCount !== null && currentCount !== prevCount) {
      if (currentCount > prevCount) {
        showNewDataNotification("Nova transação recorrente adicionada");
      } else if (currentCount < prevCount) {
        showUpdateNotification("Transação recorrente removida");
      }
    }

    prevRecurringCount.current = currentCount;
  }, [recurringTransactions.length, showUpdateNotification, showNewDataNotification]);

  // Componente não renderiza nada visualmente
  return null;
};

export default RealtimeNotifier;

