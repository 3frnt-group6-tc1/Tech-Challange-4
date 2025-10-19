import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase.config";

class FirestoreService {
  // Transações
  async getUserTransactions(userId) {
    try {
      const transactionsRef = collection(db, "users", userId, "transactions");
      const q = query(transactionsRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      
      const transactions = [];
      querySnapshot.forEach((doc) => {
        transactions.push({ id: doc.id, ...doc.data() });
      });
      
      return transactions;
    } catch (error) {
      console.error("Erro ao buscar transações:", error);
      throw error;
    }
  }

  async addUserTransaction(userId, transaction) {
    try {
      const transactionData = {
        ...transaction,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const docRef = doc(collection(db, "users", userId, "transactions"));
      await setDoc(docRef, transactionData);
      
      return { id: docRef.id, ...transactionData };
    } catch (error) {
      console.error("Erro ao adicionar transação:", error);
      throw error;
    }
  }

  async updateUserTransaction(userId, transactionId, updates) {
    try {
      const transactionRef = doc(db, "users", userId, "transactions", transactionId);
      const updateData = {
        ...updates,
        updatedAt: new Date(),
      };
      
      await updateDoc(transactionRef, updateData);
      return { id: transactionId, ...updates };
    } catch (error) {
      console.error("Erro ao atualizar transação:", error);
      throw error;
    }
  }

  async deleteUserTransaction(userId, transactionId) {
    try {
      const transactionRef = doc(db, "users", userId, "transactions", transactionId);
      await deleteDoc(transactionRef);
    } catch (error) {
      console.error("Erro ao deletar transação:", error);
      throw error;
    }
  }

  // Categorias
  async getUserCategories(userId) {
    try {
      const docRef = doc(db, "users", userId, "settings", "categories");
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data().categories;
      } else {
        // Retornar categorias padrão se não existirem
        const defaultCategories = {
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
        await this.saveUserCategories(userId, defaultCategories);
        return defaultCategories;
      }
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
      throw error;
    }
  }

  async saveUserCategories(userId, categories) {
    try {
      const docRef = doc(db, "users", userId, "settings", "categories");
      await setDoc(docRef, { 
        categories,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error("Erro ao salvar categorias:", error);
      throw error;
    }
  }

  // Transações Recorrentes
  async getUserRecurringTransactions(userId) {
    try {
      const recurringRef = collection(db, "users", userId, "recurringTransactions");
      const q = query(recurringRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      
      const recurringTransactions = [];
      querySnapshot.forEach((doc) => {
        recurringTransactions.push({ id: doc.id, ...doc.data() });
      });
      
      return recurringTransactions;
    } catch (error) {
      console.error("Erro ao buscar transações recorrentes:", error);
      throw error;
    }
  }

  async addUserRecurringTransaction(userId, recurringTransaction) {
    try {
      const transactionData = {
        ...recurringTransaction,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const docRef = doc(collection(db, "users", userId, "recurringTransactions"));
      await setDoc(docRef, transactionData);
      
      return { id: docRef.id, ...transactionData };
    } catch (error) {
      console.error("Erro ao adicionar transação recorrente:", error);
      throw error;
    }
  }

  async updateUserRecurringTransaction(userId, recurringId, updates) {
    try {
      const recurringRef = doc(db, "users", userId, "recurringTransactions", recurringId);
      const updateData = {
        ...updates,
        updatedAt: new Date(),
      };
      
      await updateDoc(recurringRef, updateData);
      return { id: recurringId, ...updates };
    } catch (error) {
      console.error("Erro ao atualizar transação recorrente:", error);
      throw error;
    }
  }

  async deleteUserRecurringTransaction(userId, recurringId) {
    try {
      const recurringRef = doc(db, "users", userId, "recurringTransactions", recurringId);
      await deleteDoc(recurringRef);
    } catch (error) {
      console.error("Erro ao deletar transação recorrente:", error);
      throw error;
    }
  }

  // Listener em tempo real para transações
  subscribeToUserTransactions(userId, callback) {
    try {
      const transactionsRef = collection(db, "users", userId, "transactions");
      const q = query(transactionsRef, orderBy("createdAt", "desc"));
      
      return onSnapshot(q, (querySnapshot) => {
        const transactions = [];
        querySnapshot.forEach((doc) => {
          transactions.push({ id: doc.id, ...doc.data() });
        });
        callback(transactions);
      });
    } catch (error) {
      console.error("Erro ao configurar listener de transações:", error);
      throw error;
    }
  }

  // Listener em tempo real para transações recorrentes
  subscribeToUserRecurringTransactions(userId, callback) {
    try {
      const recurringRef = collection(db, "users", userId, "recurringTransactions");
      const q = query(recurringRef, orderBy("createdAt", "desc"));
      
      return onSnapshot(q, (querySnapshot) => {
        const recurringTransactions = [];
        querySnapshot.forEach((doc) => {
          recurringTransactions.push({ id: doc.id, ...doc.data() });
        });
        callback(recurringTransactions);
      });
    } catch (error) {
      console.error("Erro ao configurar listener de transações recorrentes:", error);
      throw error;
    }
  }
}

export default new FirestoreService();