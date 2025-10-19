import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import firestoreService from "../services/firestoreService";

const TransactionsContext = createContext();

export const useTransactions = () => {
  const context = useContext(TransactionsContext);
  if (!context) {
    throw new Error(
      "useTransactions must be used within a TransactionsProvider"
    );
  }
  return context;
};

export const TransactionsProvider = ({ children }) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [recurringTransactions, setRecurringTransactions] = useState([]);
  const [categories, setCategories] = useState({
    income: ["Salário", "Freelance", "Investimentos", "Vendas", "Outros"],
    expense: [
      "Alimentação",
      "Transporte",
      "Moradia",
      "Saúde",
      "Lazer",
      "Outros",
    ],
  });
  const [loading, setLoading] = useState(false);

  // Carregar dados do Firestore e configurar listeners
  useEffect(() => {
    if (user) {
      loadData();
      setupRealtimeListeners();
    } else {
      // Limpar dados quando usuário faz logout
      setTransactions([]);
      setRecurringTransactions([]);
      setCategories({
        income: ["Salário", "Freelance", "Investimentos", "Vendas", "Outros"],
        expense: [
          "Alimentação",
          "Transporte",
          "Moradia",
          "Saúde",
          "Lazer",
          "Outros",
        ],
      });
    }
  }, [user]);

  const loadData = async () => {
    if (!user) {
      console.log("Usuário não autenticado, não carregando dados");
      return;
    }
    
    console.log("Carregando dados para usuário:", user.uid);
    
    try {
      setLoading(true);
      const [userTransactions, userCategories, userRecurring] = await Promise.all([
        firestoreService.getUserTransactions(user.uid),
        firestoreService.getUserCategories(user.uid),
        firestoreService.getUserRecurringTransactions(user.uid),
      ]);

      console.log("Dados carregados com sucesso:", {
        transações: userTransactions.length,
        categorias: Object.keys(userCategories).length,
        recorrentes: userRecurring.length
      });

      setTransactions(userTransactions);
      setCategories(userCategories);
      setRecurringTransactions(userRecurring);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      console.error("Detalhes do erro:", error.code, error.message);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeListeners = () => {
    if (!user) {
      console.log("Usuário não autenticado, não configurando listeners");
      return;
    }

    console.log("Configurando listeners para usuário:", user.uid);

    try {
      // Listener para transações
      const unsubscribeTransactions = firestoreService.subscribeToUserTransactions(
        user.uid,
        (transactions) => {
          console.log("Transações atualizadas em tempo real:", transactions.length);
          setTransactions(transactions);
        }
      );

      // Listener para transações recorrentes
      const unsubscribeRecurring = firestoreService.subscribeToUserRecurringTransactions(
        user.uid,
        (recurringTransactions) => {
          console.log("Transações recorrentes atualizadas:", recurringTransactions.length);
          setRecurringTransactions(recurringTransactions);
        }
      );

      // Cleanup listeners quando componente for desmontado ou usuário mudar
      return () => {
        console.log("Desconectando listeners");
        unsubscribeTransactions && unsubscribeTransactions();
        unsubscribeRecurring && unsubscribeRecurring();
      };
    } catch (error) {
      console.error("Erro ao configurar listeners:", error);
    }
  };

  const addTransaction = async (transaction) => {
    if (!user) return;

    try {
      const newTransaction = {
        ...transaction,
        date: transaction.date || new Date().toISOString().split("T")[0],
        imageUrl: transaction.imageUrl || null,
      };
      
      await firestoreService.addUserTransaction(user.uid, newTransaction);
      // O listener em tempo real atualizará o estado automaticamente
    } catch (error) {
      console.error("Erro ao adicionar transação:", error);
      throw error;
    }
  };

  const updateTransaction = async (updatedTransaction) => {
    if (!user) return;

    try {
      const updates = {
        ...updatedTransaction,
        imageUrl: updatedTransaction.hasOwnProperty("imageUrl")
          ? updatedTransaction.imageUrl
          : undefined,
      };
      
      // Remove o id dos updates pois não deve ser atualizado
      delete updates.id;
      
      await firestoreService.updateUserTransaction(user.uid, updatedTransaction.id, updates);
      // O listener em tempo real atualizará o estado automaticamente
    } catch (error) {
      console.error("Erro ao atualizar transação:", error);
      throw error;
    }
  };

  const deleteTransaction = async (id) => {
    if (!user) return;

    try {
      await firestoreService.deleteUserTransaction(user.uid, id);
      // O listener em tempo real atualizará o estado automaticamente
    } catch (error) {
      console.error("Erro ao deletar transação:", error);
      throw error;
    }
  };

  // Funções para gerenciar categorias
  const addCategory = async (type, categoryName) => {
    if (!user || !categoryName.trim()) return;

    try {
      const newCategories = {
        ...categories,
        [type]: [...categories[type], categoryName.trim()],
      };
      
      await firestoreService.saveUserCategories(user.uid, newCategories);
      setCategories(newCategories);
    } catch (error) {
      console.error("Erro ao adicionar categoria:", error);
      throw error;
    }
  };

  const removeCategory = async (type, categoryName) => {
    if (!user) return;

    // Não permitir remover se há transações usando esta categoria
    const hasTransactions = transactions.some(
      (t) => t.category === categoryName
    );
    if (hasTransactions) {
      throw new Error("Não é possível excluir categoria que possui transações");
    }

    try {
      const newCategories = {
        ...categories,
        [type]: categories[type].filter((cat) => cat !== categoryName),
      };
      
      await firestoreService.saveUserCategories(user.uid, newCategories);
      setCategories(newCategories);
    } catch (error) {
      console.error("Erro ao remover categoria:", error);
      throw error;
    }
  };

  const updateCategory = async (type, oldName, newName) => {
    if (!user || !newName.trim()) return;

    try {
      // Atualizar transações que usam esta categoria
      const transactionsToUpdate = transactions.filter(
        (transaction) => transaction.category === oldName
      );

      // Atualizar cada transação no Firestore
      const updatePromises = transactionsToUpdate.map((transaction) =>
        firestoreService.updateUserTransaction(user.uid, transaction.id, {
          category: newName.trim(),
        })
      );

      // Atualizar categorias
      const newCategories = {
        ...categories,
        [type]: categories[type].map((cat) =>
          cat === oldName ? newName.trim() : cat
        ),
      };

      await Promise.all([
        ...updatePromises,
        firestoreService.saveUserCategories(user.uid, newCategories),
      ]);

      setCategories(newCategories);
      // As transações serão atualizadas pelo listener em tempo real
    } catch (error) {
      console.error("Erro ao atualizar categoria:", error);
      throw error;
    }
  };

  // Funções para gerenciar transações recorrentes
  const addRecurringTransaction = async (recurringTransaction) => {
    if (!user) return;

    try {
      const newRecurring = {
        ...recurringTransaction,
        nextDueDate:
          recurringTransaction.nextDueDate ||
          new Date().toISOString().split("T")[0],
      };
      
      await firestoreService.addUserRecurringTransaction(user.uid, newRecurring);
      // O listener em tempo real atualizará o estado automaticamente
    } catch (error) {
      console.error("Erro ao adicionar transação recorrente:", error);
      throw error;
    }
  };

  const updateRecurringTransaction = async (updatedRecurring) => {
    if (!user) return;

    try {
      const updates = { ...updatedRecurring };
      delete updates.id; // Remove o id dos updates
      
      await firestoreService.updateUserRecurringTransaction(user.uid, updatedRecurring.id, updates);
      // O listener em tempo real atualizará o estado automaticamente
    } catch (error) {
      console.error("Erro ao atualizar transação recorrente:", error);
      throw error;
    }
  };

  const deleteRecurringTransaction = async (id) => {
    if (!user) return;

    try {
      await firestoreService.deleteUserRecurringTransaction(user.uid, id);
      // O listener em tempo real atualizará o estado automaticamente
    } catch (error) {
      console.error("Erro ao deletar transação recorrente:", error);
      throw error;
    }
  };

  // Gerar transações baseadas nas recorrentes
  const generateRecurringTransactions = async () => {
    if (!user) return;

    const today = new Date();
    const transactionsToCreate = [];

    for (const recurring of recurringTransactions) {
      const nextDue = new Date(recurring.nextDueDate);

      if (nextDue <= today) {
        // Criar transação baseada na recorrente
        const newTransaction = {
          title: recurring.title,
          description: recurring.description,
          amount: recurring.amount,
          category: recurring.category,
          type: recurring.type,
          date: recurring.nextDueDate,
          isRecurring: true,
          recurringId: recurring.id,
        };

        transactionsToCreate.push(newTransaction);

        // Calcular próxima data
        const nextDate = new Date(nextDue);
        switch (recurring.frequency) {
          case "daily":
            nextDate.setDate(nextDate.getDate() + 1);
            break;
          case "weekly":
            nextDate.setDate(nextDate.getDate() + 7);
            break;
          case "monthly":
            nextDate.setMonth(nextDate.getMonth() + 1);
            break;
          case "yearly":
            nextDate.setFullYear(nextDate.getFullYear() + 1);
            break;
        }

        // Atualizar próxima data da transação recorrente
        await updateRecurringTransaction({
          ...recurring,
          nextDueDate: nextDate.toISOString().split("T")[0],
        });
      }
    }

    // Criar todas as transações em paralelo
    if (transactionsToCreate.length > 0) {
      try {
        await Promise.all(
          transactionsToCreate.map((transaction) =>
            firestoreService.addUserTransaction(user.uid, transaction)
          )
        );
      } catch (error) {
        console.error("Erro ao gerar transações recorrentes:", error);
      }
    }
  };

  // Executar verificação de transações recorrentes ao carregar o app
  useEffect(() => {
    if (recurringTransactions.length > 0) {
      generateRecurringTransactions();
    }
  }, []);

  const getTotalByType = (type) => {
    return transactions
      .filter((transaction) => transaction.type === type)
      .reduce((sum, transaction) => sum + transaction.amount, 0);
  };

  const getBalance = () => {
    const income = getTotalByType("income");
    const expense = getTotalByType("expense");
    return income - expense;
  };

  const value = {
    transactions,
    recurringTransactions,
    categories,
    loading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getTotalByType,
    getBalance,
    addCategory,
    removeCategory,
    updateCategory,
    addRecurringTransaction,
    updateRecurringTransaction,
    deleteRecurringTransaction,
    generateRecurringTransactions,
  };

  return (
    <TransactionsContext.Provider value={value}>
      {children}
    </TransactionsContext.Provider>
  );
};
