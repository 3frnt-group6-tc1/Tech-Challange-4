import { useMemo } from 'react';
import type { Transaction } from '../state/transactions/transactions.types';

export function useTxTotals(items: Transaction[]) {
  return useMemo(() => {
    const income = items.filter(i => i.type === 'income').reduce((a,b)=>a+b.amount,0);
    const expense = items.filter(i => i.type === 'expense').reduce((a,b)=>a+b.amount,0);
    return { income, expense, balance: income - expense };
  }, [items]);
}