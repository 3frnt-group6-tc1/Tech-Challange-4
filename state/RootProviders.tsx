import React from 'react';
import { AuthProvider } from './auth/AuthContext';           
import { ThemeProvider } from './theme/ThemeContext';        
import { CurrencyProvider } from './currency/CurrencyContext';
import { TransactionsProvider } from './transactions/TransactionsContext';

export const RootProviders: React.FC<React.PropsWithChildren> = ({ children }) => (
  <AuthProvider>
    <ThemeProvider>
      <CurrencyProvider>
        <TransactionsProvider>
          {children}
        </TransactionsProvider>
      </CurrencyProvider>
    </ThemeProvider>
  </AuthProvider>
);