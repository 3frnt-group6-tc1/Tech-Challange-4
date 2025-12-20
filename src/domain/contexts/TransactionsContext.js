import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import firestoreService from "../../infrastructure/services/firestoreService";
import { cacheService } from "../../infrastructure/services";
import { encryptionService } from "../../infrastructure/services/EncryptionService";

export const TransactionsContext = createContext();

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
  const [encryptionReady, setEncryptionReady] = useState(false);

  // Inicializar serviço de criptografia
  useEffect(() => {
    const initEncryption = async () => {
      try {
        await encryptionService.initialize();
        setEncryptionReady(true);
        console.log("TransactionsContext: Criptografia inicializada");
      } catch (error) {
        console.error("TransactionsContext: Erro ao inicializar criptografia", error);
        // Continuar mesmo sem criptografia para não quebrar o app
        setEncryptionReady(true);
      }
    };
    initEncryption();
  }, []);

  /**
   * Descriptografa uma lista de transações
   * Mantém compatibilidade com dados antigos não criptografados
   */
  const decryptTransactions = async (transactionsList) => {
    if (!encryptionService.isInitialized) {
      return transactionsList;
    }

    try {
      const decrypted = await Promise.all(
        transactionsList.map(async (transaction) => {
          // Se não está criptografado, retornar como está
          if (!transaction._isEncrypted) {
            return transaction;
          }
          try {
            return await encryptionService.decryptTransaction(transaction);
          } catch (error) {
            console.warn("Erro ao descriptografar transação:", transaction.id, error);
            return transaction; // Retornar original em caso de erro
          }
        })
      );
      return decrypted;
    } catch (error) {
      console.error("Erro ao descriptografar transações:", error);
      return transactionsList;
    }
  };

  // Carregar dados do Firestore e configurar listeners
  useEffect(() => {
    let unsubscribe = null;
    
    if (user) {
      loadData();
      unsubscribe = setupRealtimeListeners();
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
    
    // Cleanup listeners quando componente desmontar ou user mudar
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user]);


  const loadData = async () => {
    if (!user) {
      console.log("Usuário não autenticado, não carregando dados");
      return;
    }

    console.log("Carregando dados para usuário:", user.uid);

    try {
      setLoading(true);
      
      // Usar cache service para otimizar requisições
      const [rawTransactions, userCategories, rawRecurring] =
        await Promise.all([
          cacheService.getTransactions(
            user.uid,
            () => firestoreService.getUserTransactions(user.uid)
          ),
          cacheService.getCategories(
            user.uid,
            () => firestoreService.getUserCategories(user.uid)
          ),
          cacheService.getRecurringTransactions(
            user.uid,
            () => firestoreService.getUserRecurringTransactions(user.uid)
          ),
        ]);

      // Descriptografar transações carregadas
      const userTransactions = await decryptTransactions(rawTransactions);
      const userRecurring = await decryptTransactions(rawRecurring);

      console.log("Dados carregados com sucesso:", {
        transações: userTransactions.length,
        categorias: Object.keys(userCategories).length,
        recorrentes: userRecurring.length,
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
      const unsubscribeTransactions =
        firestoreService.subscribeToUserTransactions(
          user.uid,
          async (rawTransactions) => {
            console.log(
              "Transações atualizadas em tempo real:",
              rawTransactions.length
            );
            // Descriptografar transações recebidas
            const decryptedTransactions = await decryptTransactions(rawTransactions);
            setTransactions(decryptedTransactions);
          }
        );

      // Listener para transações recorrentes
      const unsubscribeRecurring =
        firestoreService.subscribeToUserRecurringTransactions(
          user.uid,
          async (rawRecurringTransactions) => {
            console.log(
              "Transações recorrentes atualizadas:",
              rawRecurringTransactions.length
            );
            // Descriptografar transações recorrentes recebidas
            const decryptedRecurring = await decryptTransactions(rawRecurringTransactions);
            setRecurringTransactions(decryptedRecurring);
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
      let newTransaction = {
        ...transaction,
        date: transaction.date || new Date().toISOString().split("T")[0],
        imageUrl: transaction.imageUrl || null,
      };

      // Criptografar transação antes de salvar
      if (encryptionService.isInitialized) {
        try {
          newTransaction = await encryptionService.encryptTransaction(newTransaction);
          console.log("Transação criptografada antes de salvar");
        } catch (encryptError) {
          console.warn("Erro ao criptografar transação, salvando sem criptografia:", encryptError);
        }
      }

      await firestoreService.addUserTransaction(user.uid, newTransaction);
      // Invalidar cache para forçar atualização na próxima busca
      await cacheService.invalidateTransactions(user.uid);
      // O listener em tempo real atualizará o estado automaticamente
    } catch (error) {
      console.error("Erro ao adicionar transação:", error);
      throw error;
    }
  };

  const updateTransaction = async (updatedTransaction) => {
    if (!user) return;

    try {
      let updates = {
        ...updatedTransaction,
        imageUrl: updatedTransaction.hasOwnProperty("imageUrl")
          ? updatedTransaction.imageUrl
          : undefined,
      };

      // Remove o id dos updates pois não deve ser atualizado
      const transactionId = updates.id;
      delete updates.id;

      // Criptografar transação antes de atualizar
      if (encryptionService.isInitialized) {
        try {
          updates = await encryptionService.encryptTransaction(updates);
          console.log("Transação criptografada antes de atualizar");
        } catch (encryptError) {
          console.warn("Erro ao criptografar transação, atualizando sem criptografia:", encryptError);
        }
      }

      await firestoreService.updateUserTransaction(
        user.uid,
        transactionId,
        updates
      );
      // Invalidar cache para forçar atualização na próxima busca
      await cacheService.invalidateTransactions(user.uid);
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
      // Invalidar cache para forçar atualização na próxima busca
      await cacheService.invalidateTransactions(user.uid);
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
      // Atualizar cache com as novas categorias (não apenas invalidar)
      await cacheService.set(`categories_${user.uid}`, newCategories, 24 * 60 * 60 * 1000);
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
      // Atualizar cache com as novas categorias (não apenas invalidar)
      await cacheService.set(`categories_${user.uid}`, newCategories, 24 * 60 * 60 * 1000);
      setCategories(newCategories);
    } catch (error) {
      console.error("Erro ao remover categoria:", error);
      throw error;
    }
  };

  const updateCategory = async (oldType, newType, oldName, newName) => {
    if (!user || !newName.trim()) return;

    try {
      const typeChanged = oldType !== newType;

      // Find transactions that use this category
      const transactionsToUpdate = transactions.filter(
        (transaction) =>
          transaction.category === oldName && transaction.type === oldType
      );

      // Update each transaction in Firestore
      const updatePromises = transactionsToUpdate.map((transaction) =>
        firestoreService.updateUserTransaction(user.uid, transaction.id, {
          category: newName,
          type: newType, // Update type if it changed
        })
      );

      // Update categories based on whether type changed
      let newCategories;
      if (typeChanged) {
        // Remove from old type and add to new type
        newCategories = {
          ...categories,
          [oldType]: categories[oldType].filter((cat) => cat !== oldName),
          [newType]: [...categories[newType], newName],
        };
      } else {
        // Just update the name in the same type
        newCategories = {
          ...categories,
          [newType]: categories[newType].map((cat) =>
            cat === oldName ? newName : cat
          ),
        };
      }

      await Promise.all([
        ...updatePromises,
        firestoreService.saveUserCategories(user.uid, newCategories),
      ]);

      // Atualizar caches com os novos dados
      await Promise.all([
        cacheService.set(`categories_${user.uid}`, newCategories, 24 * 60 * 60 * 1000),
        cacheService.invalidateTransactions(user.uid), // Transações podem ter sido atualizadas
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
      let newRecurring = {
        ...recurringTransaction,
        nextDueDate:
          recurringTransaction.nextDueDate ||
          new Date().toISOString().split("T")[0],
      };

      // Criptografar transação recorrente antes de salvar
      if (encryptionService.isInitialized) {
        try {
          newRecurring = await encryptionService.encryptTransaction(newRecurring);
          console.log("Transação recorrente criptografada antes de salvar");
        } catch (encryptError) {
          console.warn("Erro ao criptografar transação recorrente:", encryptError);
        }
      }

      await firestoreService.addUserRecurringTransaction(
        user.uid,
        newRecurring
      );
      // Invalidar cache de transações recorrentes
      await cacheService.invalidateRecurringTransactions(user.uid);
      // O listener em tempo real atualizará o estado automaticamente
    } catch (error) {
      console.error("Erro ao adicionar transação recorrente:", error);
      throw error;
    }
  };

  const updateRecurringTransaction = async (updatedRecurring) => {
    if (!user) return;

    try {
      let updates = { ...updatedRecurring };
      const recurringId = updates.id;
      delete updates.id; // Remove o id dos updates

      // Criptografar antes de atualizar
      if (encryptionService.isInitialized) {
        try {
          updates = await encryptionService.encryptTransaction(updates);
          console.log("Transação recorrente criptografada antes de atualizar");
        } catch (encryptError) {
          console.warn("Erro ao criptografar transação recorrente:", encryptError);
        }
      }

      await firestoreService.updateUserRecurringTransaction(
        user.uid,
        recurringId,
        updates
      );
      // Invalidar cache de transações recorrentes
      await cacheService.invalidateRecurringTransactions(user.uid);
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
      // Invalidar cache de transações recorrentes
      await cacheService.invalidateRecurringTransactions(user.uid);
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

    // Criar todas as transações em paralelo (usando addTransaction para criptografar)
    if (transactionsToCreate.length > 0) {
      try {
        await Promise.all(
          transactionsToCreate.map((transaction) =>
            addTransaction(transaction)
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
