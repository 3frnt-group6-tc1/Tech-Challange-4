import { useState, useCallback, useEffect } from "react";
import { useEncryption } from "../../domain/contexts/EncryptionContext";

/**
 * Hook para gerenciar dados seguros com criptografia
 * @param {string} key - Chave para armazenamento seguro
 * @param {any} initialValue - Valor inicial
 * @returns {Object} { value, setValue, isLoading, error, clearValue }
 */
export const useSecureData = (key, initialValue = null) => {
  const { secureStore, secureRetrieve, secureRemove, isInitialized } = useEncryption();
  
  const [value, setValue] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Carregar valor inicial
  useEffect(() => {
    if (isInitialized) {
      loadValue();
    }
  }, [isInitialized, key]);

  const loadValue = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const storedValue = await secureRetrieve(key);
      if (storedValue !== null) {
        setValue(storedValue);
      }
    } catch (err) {
      console.error("useSecureData: Erro ao carregar", key, err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const updateValue = useCallback(async (newValue) => {
    try {
      setError(null);
      await secureStore(key, newValue);
      setValue(newValue);
    } catch (err) {
      console.error("useSecureData: Erro ao salvar", key, err);
      setError(err.message);
      throw err;
    }
  }, [key, secureStore]);

  const clearValue = useCallback(async () => {
    try {
      setError(null);
      await secureRemove(key);
      setValue(initialValue);
    } catch (err) {
      console.error("useSecureData: Erro ao remover", key, err);
      setError(err.message);
      throw err;
    }
  }, [key, initialValue, secureRemove]);

  return {
    value,
    setValue: updateValue,
    isLoading,
    error,
    clearValue,
    refresh: loadValue,
  };
};

/**
 * Hook para criptografar/descriptografar dados em formulários
 * @returns {Object} Funções de criptografia para formulários
 */
export const useSecureForm = () => {
  const { encrypt, decrypt, hash, isInitialized, isEncryptionEnabled } = useEncryption();

  /**
   * Criptografa um campo de formulário
   */
  const encryptField = useCallback(async (value) => {
    if (!isInitialized || !isEncryptionEnabled || !value) {
      return value;
    }
    return encrypt(String(value));
  }, [isInitialized, isEncryptionEnabled, encrypt]);

  /**
   * Descriptografa um campo de formulário
   */
  const decryptField = useCallback(async (encryptedValue) => {
    if (!isInitialized || !encryptedValue) {
      return encryptedValue;
    }
    return decrypt(encryptedValue);
  }, [isInitialized, decrypt]);

  /**
   * Gera hash de um campo (ex: senha)
   */
  const hashField = useCallback((value) => {
    if (!value) return "";
    return hash(value);
  }, [hash]);

  /**
   * Criptografa múltiplos campos de um objeto
   */
  const encryptFields = useCallback(async (data, fieldNames) => {
    if (!isInitialized || !isEncryptionEnabled) {
      return data;
    }

    const result = { ...data };
    for (const field of fieldNames) {
      if (data[field] !== undefined && data[field] !== null) {
        result[`${field}_encrypted`] = await encrypt(String(data[field]));
        result[`${field}_original`] = data[field]; // Manter original para UI
      }
    }
    return result;
  }, [isInitialized, isEncryptionEnabled, encrypt]);

  /**
   * Descriptografa múltiplos campos de um objeto
   */
  const decryptFields = useCallback(async (data, fieldNames) => {
    if (!isInitialized) {
      return data;
    }

    const result = { ...data };
    for (const field of fieldNames) {
      const encryptedField = `${field}_encrypted`;
      if (data[encryptedField]) {
        result[field] = await decrypt(data[encryptedField]);
        delete result[encryptedField];
      }
    }
    return result;
  }, [isInitialized, decrypt]);

  return {
    encryptField,
    decryptField,
    hashField,
    encryptFields,
    decryptFields,
    isReady: isInitialized,
    isEnabled: isEncryptionEnabled,
  };
};

/**
 * Hook para gerenciar PIN do usuário
 * @returns {Object} Funções para gerenciar PIN
 */
export const useSecurePIN = () => {
  const { secureStorageService } = useEncryption();
  
  const [hasPIN, setHasPIN] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkPIN();
  }, []);

  const checkPIN = async () => {
    try {
      setIsLoading(true);
      const exists = await secureStorageService.hasPIN();
      setHasPIN(exists);
    } catch (error) {
      console.error("useSecurePIN: Erro ao verificar PIN", error);
    } finally {
      setIsLoading(false);
    }
  };

  const setPIN = useCallback(async (pin) => {
    try {
      await secureStorageService.setUserPIN(pin);
      setHasPIN(true);
      return true;
    } catch (error) {
      console.error("useSecurePIN: Erro ao definir PIN", error);
      throw error;
    }
  }, [secureStorageService]);

  const verifyPIN = useCallback(async (pin) => {
    try {
      return await secureStorageService.verifyUserPIN(pin);
    } catch (error) {
      console.error("useSecurePIN: Erro ao verificar PIN", error);
      return false;
    }
  }, [secureStorageService]);

  const removePIN = useCallback(async () => {
    try {
      await secureStorageService.removeUserPIN();
      setHasPIN(false);
      return true;
    } catch (error) {
      console.error("useSecurePIN: Erro ao remover PIN", error);
      throw error;
    }
  }, [secureStorageService]);

  return {
    hasPIN,
    isLoading,
    setPIN,
    verifyPIN,
    removePIN,
    refresh: checkPIN,
  };
};

export default useSecureData;

