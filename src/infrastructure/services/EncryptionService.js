import CryptoJS from "crypto-js";
import * as SecureStore from "expo-secure-store";
import * as ExpoCrypto from "expo-crypto";

/**
 * Serviço de Criptografia para proteção de dados sensíveis
 * Utiliza AES-256 para criptografia simétrica com chave armazenada de forma segura
 */
class EncryptionService {
  constructor() {
    this.ENCRYPTION_KEY_NAME = "app_encryption_key";
    this.encryptionKey = null;
    this.isInitialized = false;
  }

  /**
   * Gera bytes aleatórios seguros usando expo-crypto
   * @param {number} byteCount - Número de bytes a gerar
   * @returns {string} Bytes em formato hexadecimal
   */
  async generateRandomBytes(byteCount) {
    const randomBytes = await ExpoCrypto.getRandomBytesAsync(byteCount);
    // Converter Uint8Array para hex string
    return Array.from(randomBytes)
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  }

  /**
   * Inicializa o serviço de criptografia
   * Carrega ou gera a chave de criptografia
   */
  async initialize() {
    if (this.isInitialized) {
      return;
    }

    try {
      this.encryptionKey = await this.getOrCreateKey();
      this.isInitialized = true;
      console.log("EncryptionService: Inicializado com sucesso");
    } catch (error) {
      console.error("EncryptionService: Erro na inicialização", error);
      throw new Error("Falha ao inicializar serviço de criptografia");
    }
  }

  /**
   * Obtém a chave de criptografia existente ou cria uma nova
   * A chave é armazenada de forma segura usando expo-secure-store
   */
  async getOrCreateKey() {
    try {
      // Tentar obter chave existente
      const existingKey = await SecureStore.getItemAsync(this.ENCRYPTION_KEY_NAME);
      
      if (existingKey) {
        return existingKey;
      }

      // Gerar nova chave de 256 bits (32 bytes) usando expo-crypto
      const newKey = await this.generateRandomBytes(32);
      
      // Armazenar chave de forma segura
      await SecureStore.setItemAsync(this.ENCRYPTION_KEY_NAME, newKey, {
        keychainAccessible: SecureStore.WHEN_UNLOCKED,
      });

      console.log("EncryptionService: Nova chave de criptografia gerada");
      return newKey;
    } catch (error) {
      console.error("EncryptionService: Erro ao obter/criar chave", error);
      throw error;
    }
  }

  /**
   * Garante que o serviço está inicializado antes de qualquer operação
   */
  async ensureInitialized() {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  /**
   * Criptografa um objeto ou string
   * @param {Object|string} data - Dados a serem criptografados
   * @returns {string} Dados criptografados em formato Base64
   */
  async encrypt(data) {
    await this.ensureInitialized();

    try {
      const dataString = typeof data === "string" ? data : JSON.stringify(data);
      
      // Gerar IV (Initialization Vector) aleatório para cada operação usando expo-crypto
      const ivHex = await this.generateRandomBytes(16);
      const iv = CryptoJS.enc.Hex.parse(ivHex);
      
      // Criptografar usando AES-256-CBC
      const encrypted = CryptoJS.AES.encrypt(dataString, CryptoJS.enc.Hex.parse(this.encryptionKey), {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });

      // Combinar IV + dados criptografados para armazenamento
      const combined = ivHex + ":" + encrypted.toString();
      
      return combined;
    } catch (error) {
      console.error("EncryptionService: Erro ao criptografar", error);
      throw new Error("Falha ao criptografar dados");
    }
  }

  /**
   * Descriptografa dados criptografados
   * @param {string} encryptedData - Dados criptografados
   * @returns {Object|string} Dados descriptografados
   */
  async decrypt(encryptedData) {
    await this.ensureInitialized();

    try {
      if (!encryptedData || typeof encryptedData !== "string") {
        return encryptedData;
      }

      // Separar IV dos dados criptografados
      const [ivHex, cipherText] = encryptedData.split(":");
      
      if (!ivHex || !cipherText) {
        // Dados não estão criptografados, retornar como estão
        return encryptedData;
      }

      const iv = CryptoJS.enc.Hex.parse(ivHex);
      
      // Descriptografar
      const decrypted = CryptoJS.AES.decrypt(cipherText, CryptoJS.enc.Hex.parse(this.encryptionKey), {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });

      const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
      
      // Tentar parsear como JSON, se falhar retornar como string
      try {
        return JSON.parse(decryptedString);
      } catch {
        return decryptedString;
      }
    } catch (error) {
      console.error("EncryptionService: Erro ao descriptografar", error);
      // Retornar dados originais se não conseguir descriptografar
      // (pode ser dado antigo não criptografado)
      return encryptedData;
    }
  }

  /**
   * Criptografa campos específicos de uma transação
   * @param {Object} transaction - Objeto de transação
   * @returns {Object} Transação com campos sensíveis criptografados
   */
  async encryptTransaction(transaction) {
    await this.ensureInitialized();

    const sensitiveFields = ["amount", "description", "title"];
    const encryptedTransaction = { ...transaction };

    for (const field of sensitiveFields) {
      if (transaction[field] !== undefined && transaction[field] !== null) {
        encryptedTransaction[`${field}_encrypted`] = await this.encrypt(
          String(transaction[field])
        );
        // Manter campo original com valor mascarado para listagem rápida
        if (field === "amount") {
          encryptedTransaction[field] = 0; // Valor mascarado
        } else {
          encryptedTransaction[field] = "***"; // Texto mascarado
        }
      }
    }

    encryptedTransaction._isEncrypted = true;
    return encryptedTransaction;
  }

  /**
   * Descriptografa campos de uma transação
   * @param {Object} transaction - Transação com campos criptografados
   * @returns {Object} Transação com campos descriptografados
   */
  async decryptTransaction(transaction) {
    await this.ensureInitialized();

    if (!transaction._isEncrypted) {
      return transaction;
    }

    const decryptedTransaction = { ...transaction };
    const sensitiveFields = ["amount", "description", "title"];

    for (const field of sensitiveFields) {
      const encryptedField = `${field}_encrypted`;
      if (transaction[encryptedField]) {
        const decryptedValue = await this.decrypt(transaction[encryptedField]);
        
        // Converter amount de volta para número
        if (field === "amount") {
          decryptedTransaction[field] = parseFloat(decryptedValue) || 0;
        } else {
          decryptedTransaction[field] = decryptedValue;
        }
        
        // Remover campo criptografado do objeto retornado
        delete decryptedTransaction[encryptedField];
      }
    }

    delete decryptedTransaction._isEncrypted;
    return decryptedTransaction;
  }

  /**
   * Criptografa múltiplas transações
   * @param {Array} transactions - Array de transações
   * @returns {Array} Array de transações criptografadas
   */
  async encryptTransactions(transactions) {
    return Promise.all(
      transactions.map((transaction) => this.encryptTransaction(transaction))
    );
  }

  /**
   * Descriptografa múltiplas transações
   * @param {Array} transactions - Array de transações criptografadas
   * @returns {Array} Array de transações descriptografadas
   */
  async decryptTransactions(transactions) {
    return Promise.all(
      transactions.map((transaction) => this.decryptTransaction(transaction))
    );
  }

  /**
   * Gera hash SHA-256 de uma string (útil para senhas)
   * @param {string} data - Dados para gerar hash
   * @returns {string} Hash em formato hexadecimal
   */
  hash(data) {
    return CryptoJS.SHA256(data).toString(CryptoJS.enc.Hex);
  }

  /**
   * Gera hash com salt para maior segurança
   * @param {string} data - Dados para gerar hash
   * @param {string} salt - Salt (opcional, será gerado se não fornecido)
   * @returns {Promise<Object>} { hash, salt }
   */
  async hashWithSalt(data, salt = null) {
    const useSalt = salt || await this.generateRandomBytes(16);
    const hash = CryptoJS.SHA256(data + useSalt).toString(CryptoJS.enc.Hex);
    
    return {
      hash,
      salt: useSalt,
    };
  }

  /**
   * Verifica se um dado corresponde a um hash com salt
   * @param {string} data - Dados para verificar
   * @param {string} hash - Hash armazenado
   * @param {string} salt - Salt usado na geração do hash
   * @returns {boolean} True se corresponder
   */
  verifyHash(data, hash, salt) {
    const computedHash = CryptoJS.SHA256(data + salt).toString(CryptoJS.enc.Hex);
    return computedHash === hash;
  }

  /**
   * Criptografa dados do usuário
   * @param {Object} userData - Dados do usuário
   * @returns {Object} Dados criptografados
   */
  async encryptUserData(userData) {
    await this.ensureInitialized();

    const sensitiveFields = ["email", "displayName", "phoneNumber"];
    const encryptedData = { ...userData };

    for (const field of sensitiveFields) {
      if (userData[field]) {
        encryptedData[`${field}_encrypted`] = await this.encrypt(userData[field]);
        encryptedData[field] = "***";
      }
    }

    encryptedData._isEncrypted = true;
    return encryptedData;
  }

  /**
   * Descriptografa dados do usuário
   * @param {Object} userData - Dados criptografados do usuário
   * @returns {Object} Dados descriptografados
   */
  async decryptUserData(userData) {
    await this.ensureInitialized();

    if (!userData._isEncrypted) {
      return userData;
    }

    const decryptedData = { ...userData };
    const sensitiveFields = ["email", "displayName", "phoneNumber"];

    for (const field of sensitiveFields) {
      const encryptedField = `${field}_encrypted`;
      if (userData[encryptedField]) {
        decryptedData[field] = await this.decrypt(userData[encryptedField]);
        delete decryptedData[encryptedField];
      }
    }

    delete decryptedData._isEncrypted;
    return decryptedData;
  }

  /**
   * Limpa a chave de criptografia (usar com cuidado!)
   * Isso tornará todos os dados criptografados irrecuperáveis
   */
  async clearEncryptionKey() {
    try {
      await SecureStore.deleteItemAsync(this.ENCRYPTION_KEY_NAME);
      this.encryptionKey = null;
      this.isInitialized = false;
      console.log("EncryptionService: Chave de criptografia removida");
    } catch (error) {
      console.error("EncryptionService: Erro ao limpar chave", error);
      throw error;
    }
  }
}

// Exportar instância singleton
export const encryptionService = new EncryptionService();
export default encryptionService;

