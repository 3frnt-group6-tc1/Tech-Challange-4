/**
 * @fileoverview Provider principal que combina todos os contextos da aplicação
 * @module domain/contexts/AppProvider
 */

import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../../infrastructure/config/queryClient";

import { ThemeProvider } from "./ThemeContext";
import { EncryptionProvider } from "./EncryptionContext";
import { AuthProvider } from "./AuthContext";
import { CurrencyProvider } from "./CurrencyContext";
import { TransactionsProvider } from "./TransactionsContext";
import { NotificationProvider } from "./NotificationContext";

/**
 * Provider principal da aplicação que combina todos os contextos
 * 
 * @description
 * Organiza os providers na ordem correta de dependência:
 * 1. QueryClientProvider - React Query (cache global)
 * 2. ThemeProvider - Tema visual
 * 3. EncryptionProvider - Criptografia
 * 4. AuthProvider - Autenticação
 * 5. CurrencyProvider - Configurações de moeda
 * 6. TransactionsProvider - Gerenciamento de transações
 * 7. NotificationProvider - Notificações em tempo real
 * 
 * @param {Object} props - Propriedades do componente
 * @param {React.ReactNode} props.children - Componentes filhos
 * 
 * @example
 * // No App.js
 * import { AppProvider } from './src/domain/contexts/AppProvider';
 * 
 * export default function App() {
 *   return (
 *     <AppProvider>
 *       <AppNavigator />
 *     </AppProvider>
 *   );
 * }
 */
export const AppProvider = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <EncryptionProvider>
          <AuthProvider>
            <CurrencyProvider>
              <TransactionsProvider>
                <NotificationProvider>
                  {children}
                </NotificationProvider>
              </TransactionsProvider>
            </CurrencyProvider>
          </AuthProvider>
        </EncryptionProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

/**
 * Provider simplificado sem React Query (para testes)
 * 
 * @param {Object} props - Propriedades
 * @param {React.ReactNode} props.children - Componentes filhos
 */
export const AppProviderWithoutQuery = ({ children }) => {
  return (
    <ThemeProvider>
      <EncryptionProvider>
        <AuthProvider>
          <CurrencyProvider>
            <TransactionsProvider>
              <NotificationProvider>
                {children}
              </NotificationProvider>
            </TransactionsProvider>
          </CurrencyProvider>
        </AuthProvider>
      </EncryptionProvider>
    </ThemeProvider>
  );
};

export default AppProvider;

