import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

/**
 * Serviço de autenticação biométrica
 * @class BiometricService
 */
export class BiometricService {
  /**
   * Verifica se a autenticação biométrica está disponível no dispositivo
   * @returns {Promise<Object>} Objeto com informações sobre disponibilidade
   */
  static async isAvailable() {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();

      return {
        compatible,
        enrolled,
        types,
        available: compatible && enrolled,
      };
    } catch (error) {
      console.error('Erro ao verificar disponibilidade biométrica:', error);
      return {
        compatible: false,
        enrolled: false,
        types: [],
        available: false,
      };
    }
  }

  /**
   * Autentica o usuário usando biometria
   * @param {Object} options - Opções de autenticação
   * @param {string} options.promptMessage - Mensagem exibida durante autenticação
   * @param {string} options.cancelLabel - Label do botão cancelar
   * @returns {Promise<Object>} Resultado da autenticação
   */
  static async authenticate(options = {}) {
    try {
      const { promptMessage = 'Autentique-se para continuar', cancelLabel = 'Cancelar' } = options;

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        cancelLabel,
        disableDeviceFallback: false,
        fallbackLabel: 'Usar senha',
      });

      return {
        success: result.success,
        error: result.error,
      };
    } catch (error) {
      console.error('Erro na autenticação biométrica:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Salva credenciais de forma segura para uso com biometria
   * @param {string} userId - ID do usuário
   * @param {string} email - Email do usuário
   * @param {string} password - Senha do usuário (será criptografada)
   */
  static async saveCredentials(userId, email, password) {
    try {
      // Salvar email no AsyncStorage (não sensível)
      await AsyncStorage.setItem(`biometric_email_${userId}`, email);

      // Salvar senha no SecureStore (criptografado)
      await SecureStore.setItemAsync(`biometric_password_${userId}`, password);

      // Marcar que biometria está habilitada
      await AsyncStorage.setItem(`biometric_enabled_${userId}`, 'true');
    } catch (error) {
      console.error('Erro ao salvar credenciais biométricas:', error);
      throw error;
    }
  }

  /**
   * Recupera credenciais salvas
   * @param {string} userId - ID do usuário
   * @returns {Promise<Object|null>} Credenciais ou null se não existirem
   */
  static async getCredentials(userId) {
    try {
      const email = await AsyncStorage.getItem(`biometric_email_${userId}`);
      const password = await SecureStore.getItemAsync(`biometric_password_${userId}`);

      if (email && password) {
        return { email, password };
      }

      return null;
    } catch (error) {
      console.error('Erro ao recuperar credenciais biométricas:', error);
      return null;
    }
  }

  /**
   * Verifica se a biometria está habilitada para um usuário
   * @param {string} userId - ID do usuário
   * @returns {Promise<boolean>} True se biometria está habilitada
   */
  static async isEnabled(userId) {
    try {
      const enabled = await AsyncStorage.getItem(`biometric_enabled_${userId}`);
      return enabled === 'true';
    } catch (error) {
      console.error('Erro ao verificar se biometria está habilitada:', error);
      return false;
    }
  }

  /**
   * Remove credenciais biométricas salvas
   * @param {string} userId - ID do usuário
   */
  static async removeCredentials(userId) {
    try {
      await AsyncStorage.removeItem(`biometric_email_${userId}`);
      await AsyncStorage.removeItem(`biometric_enabled_${userId}`);
      await SecureStore.deleteItemAsync(`biometric_password_${userId}`);
    } catch (error) {
      console.error('Erro ao remover credenciais biométricas:', error);
    }
  }

  /**
   * Realiza login usando autenticação biométrica
   * @param {string} userId - ID do usuário
   * @param {Function} loginFunction - Função de login do AuthContext
   * @returns {Promise<Object>} Resultado do login
   */
  static async loginWithBiometric(userId, loginFunction) {
    try {
      // Verificar se biometria está disponível
      const { available } = await this.isAvailable();
      if (!available) {
        return {
          success: false,
          error: 'Autenticação biométrica não disponível',
        };
      }

      // Verificar se está habilitada
      const enabled = await this.isEnabled(userId);
      if (!enabled) {
        return {
          success: false,
          error: 'Autenticação biométrica não habilitada',
        };
      }

      // Autenticar com biometria
      const authResult = await this.authenticate({
        promptMessage: 'Autentique-se para fazer login',
        cancelLabel: 'Cancelar',
      });

      if (!authResult.success) {
        return {
          success: false,
          error: authResult.error || 'Autenticação cancelada',
        };
      }

      // Recuperar credenciais salvas
      const credentials = await this.getCredentials(userId);
      if (!credentials) {
        return {
          success: false,
          error: 'Credenciais não encontradas',
        };
      }

      // Fazer login com as credenciais
      const loginResult = await loginFunction(credentials.email, credentials.password);

      return loginResult;
    } catch (error) {
      console.error('Erro no login biométrico:', error);
      return {
        success: false,
        error: error.message || 'Erro ao fazer login com biometria',
      };
    }
  }
}

