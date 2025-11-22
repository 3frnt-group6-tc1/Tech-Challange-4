export type TxType = 'income' | 'expense';

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TxType;
  category?: string;
  date: string;
}

export interface TxFilters {
  period?: { from: string; to: string };
  category?: string;
  type?: TxType | 'all';
}

export interface TxState {
  items: Transaction[];
  recurring: Transaction[];
  filters: TxFilters;
  loading: boolean;
}

export type TxAction =
  | { type: 'LOAD'; payload: Transaction[] }
  | { type: 'LOAD_RECURRING'; payload: Transaction[] }
  | { type: 'ADD'; payload: Transaction }
  | { type: 'UPDATE'; payload: Transaction }
  | { type: 'REMOVE'; payload: { id: string } }
  | { type: 'SET_FILTERS'; payload: Partial<TxFilters> }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'HYDRATE'; payload: Partial<TxState> };