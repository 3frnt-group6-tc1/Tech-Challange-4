import firestoreService from './firestoreService';
import type { Transaction } from '../state/transactions/transactions.types';

export default {
  async listUserTransactions(uid: string): Promise<Transaction[]> {
    const docs = await firestoreService.getUserTransactions(uid);
    return docs.map((d: any) => ({ ...d, id: d.id }));
  },

  async listRecurringTransactions(uid: string): Promise<Transaction[]> {
    return firestoreService.getUserRecurringTransactions(uid);
  },

  async addUserTransaction(uid: string, tx: Omit<Transaction, 'id'>): Promise<Transaction> {
    return firestoreService.addUserTransaction(uid, tx);
  },

  async updateUserTransaction(uid: string, id: string, tx: Transaction): Promise<void> {
    return firestoreService.updateUserTransaction(uid, id, tx);
  },

  async deleteUserTransaction(uid: string, id: string): Promise<void> {
    return firestoreService.deleteUserTransaction(uid, id);
  },
};