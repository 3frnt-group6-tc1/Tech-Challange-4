import * as SecureStore from "expo-secure-store";
import { encryptionService } from "./EncryptionService";

/**
 * Serviço de Armazenamento Seguro
 * Combina expo-secure-store com criptografia adicional para máxima segurança
 */
class SecureStorageService {
  constructor() {
    this.PREFIX = "secure_";
  }

  /**
   * Armazena dados de forma segura com criptografia
   * @param {string} key - Chave para armazenamento
   * @param {any} value - Valor a ser armazenado
   * @param {Object} options - Opções adicionais
   */
  async setItem(key, value, options = {}) {
    try {
      const stringValue = typeof value === "string" ? value : JSON.stringify(value);
      
      // Criptografar dados antes de armazenar
      const encryptedValue = await encryptionService.encrypt(stringValue);
      
      await SecureStore.setItemAsync(`${this.PREFIX}${key}`, encryptedValue, {
        keychainAccessible: options.accessible || SecureStore.WHEN_UNLOCKED,
      });

      return true;
    } catch (error) {
      console.error("SecureStorageService: Erro ao salvar", key, error);
      throw error;
    }
  }

  /**
   * Recupera dados armazenados de forma segura
   * @param {string} key - Chave do dado armazenado
   * @returns {any} Valor descriptografado
   */
  async getItem(key) {
    try {
      const encryptedValue = await SecureStore.getItemAsync(`${this.PREFIX}${key}`);
      
      if (!encryptedValue) {
        return null;
      }

      // Descriptografar dados
      const decryptedValue = await encryptionService.decrypt(encryptedValue);
      
      // Tentar parsear como JSON
      try {
        return JSON.parse(decryptedValue);
      } catch {
        return decryptedValue;
      }
    } catch (error) {
      console.error("SecureStorageService: Erro ao recuperar", key, error);
      return null;
    }
  }

  /**
   * Remove um item do armazenamento seguro
   * @param {string} key - Chave do item a remover
   */
  async removeItem(key) {
    try {
      await SecureStore.deleteItemAsync(`${this.PREFIX}${key}`);
      return true;
    } catch (error) {
      console.error("SecureStorageService: Erro ao remover", key, error);
      throw error;
    }
  }

  /**
   * Armazena token de autenticação de forma segura
   * @param {string} token - Token a ser armazenado
   */
  async setAuthToken(token) {
    return this.setItem("auth_token", token, {
      accessible: SecureStore.WHEN_UNLOCKED,
    });
  }

  /**
   * Recupera token de autenticação
   * @returns {string|null} Token armazenado
   */
  async getAuthToken() {
    return this.getItem("auth_token");
  }

  /**
   * Remove token de autenticação
   */
  async removeAuthToken() {
    return this.removeItem("auth_token");
  }

  /**
   * Armazena credenciais biométricas
   * @param {Object} credentials - Credenciais a serem armazenadas
   */
  async setBiometricCredentials(credentials) {
    return this.setItem("biometric_credentials", credentials, {
      accessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
  }

  /**
   * Recupera credenciais biométricas
   * @returns {Object|null} Credenciais armazenadas
   */
  async getBiometricCredentials() {
    return this.getItem("biometric_credentials");
  }

  /**
   * Remove credenciais biométricas
   */
  async removeBiometricCredentials() {
    return this.removeItem("biometric_credentials");
  }

  /**
   * Armazena preferências sensíveis do usuário
   * @param {Object} preferences - Preferências do usuário
   */
  async setUserPreferences(preferences) {
    return this.setItem("user_preferences", preferences);
  }

  /**
   * Recupera preferências do usuário
   * @returns {Object|null} Preferências armazenadas
   */
  async getUserPreferences() {
    return this.getItem("user_preferences");
  }

  /**
   * Armazena PIN do usuário (hash)
   * @param {string} pin - PIN a ser armazenado
   */
  async setUserPIN(pin) {
    const { hash, salt } = encryptionService.hashWithSalt(pin);
    return this.setItem("user_pin", { hash, salt });
  }

  /**
   * Verifica PIN do usuário
   * @param {string} pin - PIN a ser verificado
   * @returns {boolean} True se o PIN estiver correto
   */
  async verifyUserPIN(pin) {
    try {
      const storedPIN = await this.getItem("user_pin");
      
      if (!storedPIN || !storedPIN.hash || !storedPIN.salt) {
        return false;
      }

      return encryptionService.verifyHash(pin, storedPIN.hash, storedPIN.salt);
    } catch (error) {
      console.error("SecureStorageService: Erro ao verificar PIN", error);
      return false;
    }
  }

  /**
   * Verifica se PIN está configurado
   * @returns {boolean} True se PIN estiver configurado
   */
  async hasPIN() {
    const storedPIN = await this.getItem("user_pin");
    return storedPIN !== null && storedPIN.hash !== undefined;
  }

  /**
   * Remove PIN do usuário
   */
  async removeUserPIN() {
    return this.removeItem("user_pin");
  }

  /**
   * Limpa todos os dados seguros (logout completo)
   */
  async clearAll() {
    try {
      const keysToRemove = [
        "auth_token",
        "biometric_credentials",
        "user_preferences",
        "user_pin",
      ];

      await Promise.all(
        keysToRemove.map((key) => this.removeItem(key))
      );

      console.log("SecureStorageService: Todos os dados seguros removidos");
      return true;
    } catch (error) {
      console.error("SecureStorageService: Erro ao limpar dados", error);
      throw error;
    }
  }
}

// Exportar instância singleton
export const secureStorageService = new SecureStorageService();
export default secureStorageService;

