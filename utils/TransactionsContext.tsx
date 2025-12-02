import React, { createContext, useReducer, useContext, Dispatch, PropsWithChildren } from 'react';
import { transactionsReducer } from './transactions.reducer';
import type { Transaction, State, Action } from './transactions.types';

// Estado inicial
const initialState: State = {
  transactions: [],
};

// Criação dos Contextos
const TransactionsStateContext = createContext<State>(initialState);
const TransactionsDispatchContext = createContext<Dispatch<Action> | undefined>(undefined);

/**
 * Componente Provedor que encapsula a lógica de estado das transações.
 */
export const TransactionsProvider = ({ children }: PropsWithChildren<{}>) => {
  const [state, dispatch] = useReducer(transactionsReducer, initialState);

  return (
    <TransactionsStateContext.Provider value={state}>
      <TransactionsDispatchContext.Provider value={dispatch}>
        {children}
      </TransactionsDispatchContext.Provider>
    </TransactionsStateContext.Provider>
  );
};

/**
 * Hook customizado para acessar o estado das transações.
 */
export const useTransactions = () => {
  const context = useContext(TransactionsStateContext);
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionsProvider');
  }
  return context;
};

/**
 * Hook customizado para acessar a função dispatch.
 */
export const useTransactionsDispatch = () => {
  const context = useContext(TransactionsDispatchContext);
  if (context === undefined) {
    throw new Error('useTransactionsDispatch must be used within a TransactionsProvider');
  }
  return context;
};