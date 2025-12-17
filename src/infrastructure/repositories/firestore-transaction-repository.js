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
} from "firebase/firestore";
import { ITransactionRepository } from "../../domain/repositories/repository-interface";

// Implementação do repositório de transações usando Firestore
export class FirestoreTransactionRepository extends ITransactionRepository {
  constructor(firestore) {
    super();
    this.db = firestore;
  }

  _getCollectionRef(userId) {
    return collection(this.db, "users", userId, "transactions");
  }

  _getDocRef(userId, transactionId) {
    return doc(this.db, "users", userId, "transactions", transactionId);
  }

  _transformDoc(doc) {
    if (!doc.exists()) return null;
    return { id: doc.id, ...doc.data() };
  }

  /**
   * Handles Firestore errors
   * @private
   * @param {Error} error - Error object
   * @param {string} operation - Operation name
   */
  _handleError(error, operation) {
    if (error.code === "permission-denied") {
      console.warn(
        `Permissão negada para ${operation}. Configure as regras do Firestore.`
      );
      return [];
    }
    console.error(`Erro ao ${operation}:`, error);
    throw error;
  }

  /**
   * Finds all transactions (not recommended for large datasets)
   * @returns {Promise<Array>} All transactions
   */
  async findAll() {
    throw new Error(
      "findAll() not supported for transactions. Use findByUserId() instead."
    );
  }

  /**
   * Finds transaction by ID
   * @param {string} id - Transaction ID (format: userId/transactionId)
   * @returns {Promise<Object|null>} Transaction or null
   */
  async findById(id) {
    const [userId, transactionId] = id.split("/");
    if (!userId || !transactionId) {
      throw new Error("Invalid transaction ID format. Use: userId/transactionId");
    }

    try {
      const docRef = this._getDocRef(userId, transactionId);
      const docSnap = await getDoc(docRef);
      return this._transformDoc(docSnap);
    } catch (error) {
      return this._handleError(error, "buscar transação por ID");
    }
  }

  /**
   * Finds all transactions for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} User transactions
   */
  async findByUserId(userId) {
    try {
      const collectionRef = this._getCollectionRef(userId);
      const q = query(collectionRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);

      const transactions = [];
      querySnapshot.forEach((doc) => {
        transactions.push(this._transformDoc(doc));
      });

      return transactions;
    } catch (error) {
      return this._handleError(error, "buscar transações do usuário");
    }
  }

  /**
   * Finds transactions by type (income/expense)
   * @param {string} userId - User ID
   * @param {string} type - Transaction type
   * @returns {Promise<Array>} Filtered transactions
   */
  async findByType(userId, type) {
    try {
      const collectionRef = this._getCollectionRef(userId);
      const q = query(
        collectionRef,
        where("type", "==", type),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);

      const transactions = [];
      querySnapshot.forEach((doc) => {
        transactions.push(this._transformDoc(doc));
      });

      return transactions;
    } catch (error) {
      return this._handleError(error, `buscar transações do tipo ${type}`);
    }
  }

  /**
   * Finds transactions by date range
   * @param {string} userId - User ID
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<Array>} Filtered transactions
   */
  async findByDateRange(userId, startDate, endDate) {
    try {
      const collectionRef = this._getCollectionRef(userId);
      const q = query(
        collectionRef,
        where("date", ">=", startDate),
        where("date", "<=", endDate),
        orderBy("date", "desc")
      );
      const querySnapshot = await getDocs(q);

      const transactions = [];
      querySnapshot.forEach((doc) => {
        transactions.push(this._transformDoc(doc));
      });

      return transactions;
    } catch (error) {
      return this._handleError(error, "buscar transações por período");
    }
  }

  /**
   * Finds recurring transactions
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Recurring transactions
   */
  async findRecurring(userId) {
    try {
      const collectionRef = this._getCollectionRef(userId);
      const q = query(
        collectionRef,
        where("isRecurring", "==", true),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);

      const transactions = [];
      querySnapshot.forEach((doc) => {
        transactions.push(this._transformDoc(doc));
      });

      return transactions;
    } catch (error) {
      return this._handleError(error, "buscar transações recorrentes");
    }
  }

  /**
   * Finds transactions by query
   * @param {Object} queryParams - Query parameters
   * @returns {Promise<Array>} Filtered transactions
   */
  async findBy(queryParams) {
    const { userId, type, category, startDate, endDate } = queryParams;

    if (!userId) {
      throw new Error("userId is required for transaction queries");
    }

    try {
      const collectionRef = this._getCollectionRef(userId);
      let constraints = [];

      if (type) {
        constraints.push(where("type", "==", type));
      }

      if (category) {
        constraints.push(where("category", "==", category));
      }

      if (startDate && endDate) {
        constraints.push(where("date", ">=", startDate));
        constraints.push(where("date", "<=", endDate));
      }

      constraints.push(orderBy("createdAt", "desc"));

      const q = query(collectionRef, ...constraints);
      const querySnapshot = await getDocs(q);

      const transactions = [];
      querySnapshot.forEach((doc) => {
        transactions.push(this._transformDoc(doc));
      });

      return transactions;
    } catch (error) {
      return this._handleError(error, "buscar transações com filtros");
    }
  }

  /**
   * Creates a new transaction
   * @param {Object} data - Transaction data
   * @returns {Promise<Object>} Created transaction
   */
  async create(data) {
    const { userId, ...transactionData } = data;

    if (!userId) {
      throw new Error("userId is required to create a transaction");
    }

    try {
      const transactionWithTimestamps = {
        ...transactionData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const docRef = doc(this._getCollectionRef(userId));
      await setDoc(docRef, transactionWithTimestamps);

      return { id: docRef.id, ...transactionWithTimestamps };
    } catch (error) {
      console.error("Erro ao criar transação:", error);
      throw error;
    }
  }

  /**
   * Updates an existing transaction
   * @param {string} id - Transaction ID (format: userId/transactionId)
   * @param {Object} data - Updated data
   * @returns {Promise<Object>} Updated transaction
   */
  async update(id, data) {
    const [userId, transactionId] = id.split("/");
    if (!userId || !transactionId) {
      throw new Error("Invalid transaction ID format. Use: userId/transactionId");
    }

    try {
      const docRef = this._getDocRef(userId, transactionId);
      const updateData = {
        ...data,
        updatedAt: new Date(),
      };

      await updateDoc(docRef, updateData);
      return { id: transactionId, ...updateData };
    } catch (error) {
      console.error("Erro ao atualizar transação:", error);
      throw error;
    }
  }

  /**
   * Deletes a transaction
   * @param {string} id - Transaction ID (format: userId/transactionId)
   * @returns {Promise<boolean>} Success status
   */
  async delete(id) {
    const [userId, transactionId] = id.split("/");
    if (!userId || !transactionId) {
      throw new Error("Invalid transaction ID format. Use: userId/transactionId");
    }

    try {
      const docRef = this._getDocRef(userId, transactionId);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error("Erro ao deletar transação:", error);
      throw error;
    }
  }
}
