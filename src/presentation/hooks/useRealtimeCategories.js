import { useState, useEffect, useCallback, useRef } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../../firebase.config";

const DEFAULT_CATEGORIES = {
  income: ["Salário", "Freelance", "Investimentos", "Vendas", "Outros"],
  expense: [
    "Alimentação",
    "Transporte",
    "Moradia",
    "Saúde",
    "Lazer",
    "Outros",
  ],
};

/**
 * Hook para escutar categorias em tempo real do Firestore
 * @param {string} userId - ID do usuário
 * @returns {Object} { categories, isLoading, error, refresh }
 */
export const useRealtimeCategories = (userId) => {
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const unsubscribeRef = useRef(null);

  const setupListener = useCallback(() => {
    if (!userId) {
      setCategories(DEFAULT_CATEGORIES);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const categoriesRef = doc(db, "users", userId, "settings", "categories");

      // Desinscrever listener anterior se existir
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }

      // Configurar novo listener
      unsubscribeRef.current = onSnapshot(
        categoriesRef,
        (docSnapshot) => {
          if (docSnapshot.exists()) {
            const data = docSnapshot.data();
            setCategories(data.categories || DEFAULT_CATEGORIES);
          } else {
            setCategories(DEFAULT_CATEGORIES);
          }
          
          setLastUpdate(new Date());
          setIsLoading(false);
          setError(null);
        },
        (err) => {
          console.error("Erro no listener de categorias:", err);
          
          if (err.code === "permission-denied") {
            setError("Permissão negada. Verifique as regras do Firestore.");
          } else {
            setError(err.message || "Erro ao carregar categorias");
          }
          
          // Usar categorias padrão em caso de erro
          setCategories(DEFAULT_CATEGORIES);
          setIsLoading(false);
        }
      );
    } catch (err) {
      console.error("Erro ao configurar listener de categorias:", err);
      setError(err.message || "Erro ao configurar listener");
      setCategories(DEFAULT_CATEGORIES);
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

  // Função helper para obter categorias por tipo
  const getCategoriesByType = useCallback(
    (type) => {
      return categories[type] || [];
    },
    [categories]
  );

  // Função helper para verificar se categoria existe
  const hasCategory = useCallback(
    (type, categoryName) => {
      return categories[type]?.includes(categoryName) || false;
    },
    [categories]
  );

  return {
    categories,
    isLoading,
    error,
    lastUpdate,
    refresh,
    getCategoriesByType,
    hasCategory,
    incomeCategories: categories.income || [],
    expenseCategories: categories.expense || [],
  };
};

export default useRealtimeCategories;

