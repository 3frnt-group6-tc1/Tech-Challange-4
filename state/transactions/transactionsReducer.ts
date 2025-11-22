import { TxAction, TxState } from './transactions.types';

export const initialTxState: TxState = {
  items: [],
  recurring: [],
  filters: { type: 'all' },
  loading: false,
};

export function transactionsReducer(state: TxState, action: TxAction): TxState {
  switch (action.type) {
    case 'HYDRATE':
      return { ...state, ...action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'LOAD':
      return { ...state, items: action.payload };
    case 'LOAD_RECURRING':
      return { ...state, recurring: action.payload };
    case 'ADD':
      return { ...state, items: [action.payload, ...state.items] };
    case 'UPDATE':
      return {
        ...state,
        items: state.items.map(t => t.id === action.payload.id ? action.payload : t),
      };
    case 'REMOVE':
      return { ...state, items: state.items.filter(t => t.id !== action.payload.id) };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    default:
      return state;
  }
}
