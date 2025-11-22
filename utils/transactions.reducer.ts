import type { State, Action } from './transactions.types';

export const transactionsReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_TRANSACTIONS':
      return {
        ...state,
        transactions: action.payload,
      };
    case 'ADD_TRANSACTION':
      return {
        ...state,
        transactions: [action.payload, ...state.transactions],
      };
    case 'DELETE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.filter(tx => tx.id !== action.payload.id),
      };
    default:
      return state;
  }
};