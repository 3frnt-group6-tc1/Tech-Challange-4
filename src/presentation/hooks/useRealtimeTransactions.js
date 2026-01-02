import { useState, useEffect, useCallback, useRef } from "react";
import {
  collection,
  query,
  orderBy,
  where,
  onSnapshot,
  limit,
} from "firebase/firestore";
import { db } from "../../../firebase.config";

/**
 * Hook para escutar transações em tempo real do Firestore
 * @param {string} userId - ID do usuário
 * @param {Object} options - Opções de configuração
 * @param {number} options.limitCount - Limite de transações (opcional)
 * @param {string} options.type - Filtrar por tipo ('income' | 'expense') (opcional)
 * @param {string} options.category - Filtrar por categoria (opcional)
 * @param {Date} options.startDate - Data inicial para filtro (opcional)
 * @param {Date} options.endDate - Data final para filtro (opcional)
 * @returns {Object} { transactions, isLoading, error, refresh }
 */
export const useRealtimeTransactions = (userId, options = {}) => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const unsubscribeRef = useRef(null);

  const { limitCount, type, category, startDate, endDate } = options;

  const setupListener = useCallback(() => {
    if (!userId) {
      setTransactions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const transactionsRef = collection(db, "users", userId, "transactions");
      
      // Construir query com filtros opcionais
      let constraints = [orderBy("createdAt", "desc")];

      // Adicionar filtro por tipo se especificado
      if (type && (type === "income" || type === "expense")) {
        constraints = [where("type", "==", type), ...constraints];
      }

      // Adicionar filtro por categoria se especificado
      if (category) {
        constraints = [where("category", "==", category), ...constraints];
      }

      // Adicionar limite se especificado
      if (limitCount && limitCount > 0) {
        constraints.push(limit(limitCount));
      }

      const q = query(transactionsRef, ...constraints);

      // Desinscrever listener anterior se existir
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }

      // Configurar novo listener
      unsubscribeRef.current = onSnapshot(
        q,
        (snapshot) => {
          let transactionsData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          // Filtros adicionais no cliente (datas)
          if (startDate || endDate) {
            transactionsData = transactionsData.filter((transaction) => {
              const transactionDate = new Date(transaction.date);
              
              if (startDate && transactionDate < startDate) {
                return false;
              }
              
              if (endDate && transactionDate > endDate) {
                return false;
              }
              
              return true;
            });
          }

          setTransactions(transactionsData);
          setLastUpdate(new Date());
          setIsLoading(false);
          setError(null);
        },
        (err) => {
          console.error("Erro no listener de transações:", err);
          
          if (err.code === "permission-denied") {
            setError("Permissão negada. Verifique as regras do Firestore.");
          } else {
            setError(err.message || "Erro ao carregar transações");
          }
          
          setTransactions([]);
          setIsLoading(false);
        }
      );
    } catch (err) {
      console.error("Erro ao configurar listener:", err);
      setError(err.message || "Erro ao configurar listener");
      setIsLoading(false);
    }
  }, [userId, limitCount, type, category, startDate, endDate]);

  // Configurar listener quando userId ou filtros mudarem
  useEffect(() => {
    setupListener();

    // Cleanup: desinscrever listener quando componente desmontar
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [setupListener]);

  // Função para forçar refresh (reconectar listener)
  const refresh = useCallback(() => {
    setupListener();
  }, [setupListener]);

  return {
    transactions,
    isLoading,
    error,
    lastUpdate,
    refresh,
  };
};

/**
 * Hook para escutar transações recorrentes em tempo real
 * @param {string} userId - ID do usuário
 * @returns {Object} { recurringTransactions, isLoading, error, refresh }
 */
export const useRealtimeRecurringTransactions = (userId) => {
  const [recurringTransactions, setRecurringTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const unsubscribeRef = useRef(null);

  const setupListener = useCallback(() => {
    if (!userId) {
      setRecurringTransactions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const recurringRef = collection(
        db,
        "users",
        userId,
        "recurringTransactions"
      );
      const q = query(recurringRef, orderBy("createdAt", "desc"));

      // Desinscrever listener anterior se existir
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }

      // Configurar novo listener
      unsubscribeRef.current = onSnapshot(
        q,
        (snapshot) => {
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          setRecurringTransactions(data);
          setLastUpdate(new Date());
          setIsLoading(false);
          setError(null);
        },
        (err) => {
          console.error("Erro no listener de transações recorrentes:", err);
          
          if (err.code === "permission-denied") {
            setError("Permissão negada. Verifique as regras do Firestore.");
          } else {
            setError(err.message || "Erro ao carregar transações recorrentes");
          }
          
          setRecurringTransactions([]);
          setIsLoading(false);
        }
      );
    } catch (err) {
      console.error("Erro ao configurar listener de recorrentes:", err);
      setError(err.message || "Erro ao configurar listener");
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    setupListener();

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [setupListener]);

  const refresh = useCallback(() => {
    setupListener();
  }, [setupListener]);

  return {
    recurringTransactions,
    isLoading,
    error,
    lastUpdate,
    refresh,
  };
};

export default useRealtimeTransactions;

