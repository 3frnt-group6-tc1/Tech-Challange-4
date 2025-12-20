import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { encryptionService, secureStorageService } from "../../infrastructure/services";

const EncryptionContext = createContext();

/**
 * Hook para acessar o contexto de criptografia
 */
export const useEncryption = () => {
  const context = useContext(EncryptionContext);
  if (!context) {
    throw new Error("useEncryption must be used within an EncryptionProvider");
  }
  return context;
};

/**
 * Provider de Criptografia
 * Gerencia o estado de criptografia e fornece funções utilitárias
 */
export const EncryptionProvider = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isEncryptionEnabled, setIsEncryptionEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Inicializar serviço de criptografia
  useEffect(() => {
    initializeEncryption();
  }, []);

  const initializeEncryption = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      await encryptionService.initialize();
      
      // Carregar configuração de criptografia do usuário
      const preferences = await secureStorageService.getUserPreferences();
      if (preferences && preferences.encryptionEnabled !== undefined) {
        setIsEncryptionEnabled(preferences.encryptionEnabled);
      }
      
      setIsInitialized(true);
      console.log("EncryptionContext: Inicializado com sucesso");
    } catch (err) {
      console.error("EncryptionContext: Erro na inicialização", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Alternar criptografia
  const toggleEncryption = useCallback(async (enabled) => {
    try {
      setIsEncryptionEnabled(enabled);
      
      // Salvar preferência
      const preferences = await secureStorageService.getUserPreferences() || {};
      preferences.encryptionEnabled = enabled;
      await secureStorageService.setUserPreferences(preferences);
      
      console.log(`EncryptionContext: Criptografia ${enabled ? 'ativada' : 'desativada'}`);
    } catch (err) {
      console.error("EncryptionContext: Erro ao alterar configuração", err);
      throw err;
    }
  }, []);

  // Criptografar transação (se habilitado)
  const encryptTransaction = useCallback(async (transaction) => {
    if (!isInitialized || !isEncryptionEnabled) {
      return transaction;
    }
    return encryptionService.encryptTransaction(transaction);
  }, [isInitialized, isEncryptionEnabled]);

  // Descriptografar transação
  const decryptTransaction = useCallback(async (transaction) => {
    if (!isInitialized) {
      return transaction;
    }
    return encryptionService.decryptTransaction(transaction);
  }, [isInitialized]);

  // Criptografar múltiplas transações
  const encryptTransactions = useCallback(async (transactions) => {
    if (!isInitialized || !isEncryptionEnabled) {
      return transactions;
    }
    return encryptionService.encryptTransactions(transactions);
  }, [isInitialized, isEncryptionEnabled]);

  // Descriptografar múltiplas transações
  const decryptTransactions = useCallback(async (transactions) => {
    if (!isInitialized) {
      return transactions;
    }
    return encryptionService.decryptTransactions(transactions);
  }, [isInitialized]);

  // Criptografar dados genéricos
  const encrypt = useCallback(async (data) => {
    if (!isInitialized || !isEncryptionEnabled) {
      return data;
    }
    return encryptionService.encrypt(data);
  }, [isInitialized, isEncryptionEnabled]);

  // Descriptografar dados genéricos
  const decrypt = useCallback(async (data) => {
    if (!isInitialized) {
      return data;
    }
    return encryptionService.decrypt(data);
  }, [isInitialized]);

  // Gerar hash
  const hash = useCallback((data) => {
    return encryptionService.hash(data);
  }, []);

  // Armazenar dado seguro
  const secureStore = useCallback(async (key, value) => {
    return secureStorageService.setItem(key, value);
  }, []);

  // Recuperar dado seguro
  const secureRetrieve = useCallback(async (key) => {
    return secureStorageService.getItem(key);
  }, []);

  // Remover dado seguro
  const secureRemove = useCallback(async (key) => {
    return secureStorageService.removeItem(key);
  }, []);

  const value = {
    // Estado
    isInitialized,
    isEncryptionEnabled,
    isLoading,
    error,
    
    // Configuração
    toggleEncryption,
    
    // Transações
    encryptTransaction,
    decryptTransaction,
    encryptTransactions,
    decryptTransactions,
    
    // Genérico
    encrypt,
    decrypt,
    hash,
    
    // Armazenamento seguro
    secureStore,
    secureRetrieve,
    secureRemove,
    
    // Serviços (acesso direto se necessário)
    encryptionService,
    secureStorageService,
  };

  return (
    <EncryptionContext.Provider value={value}>
      {children}
    </EncryptionContext.Provider>
  );
};

export default EncryptionProvider;

