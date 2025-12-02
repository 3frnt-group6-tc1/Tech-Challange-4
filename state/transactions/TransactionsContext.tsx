import React, { createContext, useContext, useEffect, useMemo, useReducer, useCallback } from 'react';
import { useAuth } from '../auth/AuthContext';
import { loadJSON, saveJSON } from '../../utils/persist';
import repo from '../../services/firestoreRepository';
import { transactionsReducer, initialTxState } from './transactionsReducer';
import type { Transaction, TxFilters, TxState } from './transactions.types';

type Ctx = {
  state: TxState;
  add(tx: Omit<Transaction, 'id'>): Promise<void>;
  update(tx: Transaction): Promise<void>;
  remove(id: string): Promise<void>;
  setFilters(p: Partial<TxFilters>): void;
  refresh(): Promise<void>;
};

const TransactionsContext = createContext<Ctx | null>(null);
const STORAGE_KEY = '@tx_state_v1';

export const TransactionsProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { user } = useAuth(); 

  const [state, dispatch] = useReducer(transactionsReducer, initialTxState);

  useEffect(() => {(
    async () => {
      const cached = await loadJSON<TxState>(STORAGE_KEY, initialTxState);
      dispatch({ type: 'HYDRATE', payload: cached });
    })();
  }, []);

  useEffect(() => {
    const { items, recurring, filters } = state;
    saveJSON(STORAGE_KEY, { items, recurring, filters, loading: false });
  }, [state.items, state.recurring, state.filters]);

  const refresh = useCallback(async () => {
    if (!user) return;
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const [items, recurring] = await Promise.all([
        repo.listUserTransactions(user.uid),
        repo.listRecurringTransactions(user.uid),
      ]);
      dispatch({ type: 'LOAD', payload: items });
      dispatch({ type: 'LOAD_RECURRING', payload: recurring });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const add = useCallback(async (tx: Omit<Transaction, 'id'>) => {
    if (!user) return;
    const created = await repo.addUserTransaction(user.uid, tx);
    dispatch({ type: 'ADD', payload: created });
  }, [user]);

  const update = useCallback(async (tx: Transaction) => {
    if (!user) return;
    await repo.updateUserTransaction(user.uid, tx.id, tx);
    dispatch({ type: 'UPDATE', payload: tx });
  }, [user]);

  const remove = useCallback(async (id: string) => {
    if (!user) return;
    await repo.deleteUserTransaction(user.uid, id);
    dispatch({ type: 'REMOVE', payload: { id } });
  }, [user]);

  const setFilters = useCallback((p: Partial<TxFilters>) => {
    dispatch({ type: 'SET_FILTERS', payload: p });
  }, []);

  const value = useMemo<Ctx>(() => ({ state, add, update, remove, setFilters, refresh }), [
    state, add, update, remove, setFilters, refresh
  ]);

  return <TransactionsContext.Provider value={value}>{children}</TransactionsContext.Provider>;
};

export function useTransactions() {
  const ctx = useContext(TransactionsContext);
  if (!ctx) throw new Error('useTransactions must be used inside TransactionsProvider');
  return ctx;
}
