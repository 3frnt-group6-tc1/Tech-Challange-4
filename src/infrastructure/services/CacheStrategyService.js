import { PersistentCacheService } from './PersistentCacheService';

/**
 * Constantes de TTL (Time To Live) em milissegundos
 */
const TTL = {
  TRANSACTIONS: 60 * 60 * 1000,        // 1 hora
  CATEGORIES: 24 * 60 * 60 * 1000,     // 24 horas
  USER_SETTINGS: 12 * 60 * 60 * 1000,  // 12 horas
  RECURRING_TRANSACTIONS: 60 * 60 * 1000, // 1 hora
};

/**
 * Serviço de estratégia de cache com TTLs específicos para diferentes tipos de dados
 * @class CacheStrategyService
 */
export class CacheStrategyService extends PersistentCacheService {
  constructor() {
    super();
    this.initialized = false;
  }

  /**
   * Inicializa o serviço e carrega caches do AsyncStorage
   */
  async initialize() {
    if (!this.initialized) {
      await super.initialize();
      this.initialized = true;
      
      // Configurar limpeza automática de cache expirado a cada 5 minutos
      this.startAutoCleanup();
    }
  }

  /**
   * Inicia a limpeza automática de cache expirado
   */
  startAutoCleanup() {
    // Limpar cache expirado a cada 5 minutos
    setInterval(() => {
      this.clearExpired();
    }, 5 * 60 * 1000);
  }

  /**
   * Obtém transações do cache ou executa fallback
   * TTL: 1 hora
   * @param {string} userId - ID do usuário
   * @param {Function} fallback - Função que busca transações do Firestore
   * @returns {Promise<Array>} Lista de transações
   */
  async getTransactions(userId, fallback) {
    const key = `transactions_${userId}`;
    return this.get(key, fallback, TTL.TRANSACTIONS);
  }

  /**
   * Invalida o cache de transações para um usuário
   * @param {string} userId - ID do usuário
   */
  async invalidateTransactions(userId) {
    const key = `transactions_${userId}`;
    await this.delete(key);
  }

  /**
   * Obtém categorias do cache ou executa fallback
   * TTL: 24 horas
   * @param {string} userId - ID do usuário
   * @param {Function} fallback - Função que busca categorias do Firestore
   * @returns {Promise<Object>} Objeto com categorias de receitas e despesas
   */
  async getCategories(userId, fallback) {
    const key = `categories_${userId}`;
    return this.get(key, fallback, TTL.CATEGORIES);
  }

  /**
   * Invalida o cache de categorias para um usuário
   * @param {string} userId - ID do usuário
   */
  async invalidateCategories(userId) {
    const key = `categories_${userId}`;
    await this.delete(key);
  }

  /**
   * Obtém configurações do usuário do cache ou executa fallback
   * TTL: 12 horas
   * @param {string} userId - ID do usuário
   * @param {Function} fallback - Função que busca configurações do Firestore/AsyncStorage
   * @returns {Promise<Object>} Configurações do usuário
   */
  async getUserSettings(userId, fallback) {
    const key = `user_settings_${userId}`;
    return this.get(key, fallback, TTL.USER_SETTINGS);
  }

  /**
   * Invalida o cache de configurações do usuário
   * @param {string} userId - ID do usuário
   */
  async invalidateUserSettings(userId) {
    const key = `user_settings_${userId}`;
    await this.delete(key);
  }

  /**
   * Obtém transações recorrentes do cache ou executa fallback
   * TTL: 1 hora
   * @param {string} userId - ID do usuário
   * @param {Function} fallback - Função que busca transações recorrentes do Firestore
   * @returns {Promise<Array>} Lista de transações recorrentes
   */
  async getRecurringTransactions(userId, fallback) {
    const key = `recurring_transactions_${userId}`;
    return this.get(key, fallback, TTL.RECURRING_TRANSACTIONS);
  }

  /**
   * Invalida o cache de transações recorrentes para um usuário
   * @param {string} userId - ID do usuário
   */
  async invalidateRecurringTransactions(userId) {
    const key = `recurring_transactions_${userId}`;
    await this.delete(key);
  }

  /**
   * Invalida todo o cache relacionado a um usuário
   * Útil quando o usuário faz logout ou quando há mudanças significativas
   * @param {string} userId - ID do usuário
   */
  async invalidateUserCache(userId) {
    await Promise.all([
      this.invalidateTransactions(userId),
      this.invalidateCategories(userId),
      this.invalidateUserSettings(userId),
      this.invalidateRecurringTransactions(userId),
    ]);
  }

  /**
   * Obtém estatísticas do cache
   * @returns {Object} Estatísticas do cache
   */
  getStats() {
    const totalKeys = this.cache.size;
    const expiredKeys = Array.from(this.ttlMap.entries()).filter(
      ([_, expiry]) => Date.now() > expiry
    ).length;
    const validKeys = totalKeys - expiredKeys;

    // Obter todas as chaves e seus status
    const cacheItems = [];
    for (const [key, expiry] of this.ttlMap.entries()) {
      const isExpired = Date.now() > expiry;
      const timeLeft = isExpired ? 0 : expiry - Date.now();
      const hoursLeft = Math.floor(timeLeft / (60 * 60 * 1000));
      const minutesLeft = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
      
      // Identificar o tipo de cache pela chave
      let cacheType = 'Desconhecido';
      if (key.includes('transactions_')) {
        cacheType = 'Transações';
      } else if (key.includes('categories_')) {
        cacheType = 'Categorias';
      } else if (key.includes('recurring_transactions_')) {
        cacheType = 'Transações Recorrentes';
      } else if (key.includes('user_settings_')) {
        cacheType = 'Configurações do Usuário';
      }

      cacheItems.push({
        key,
        type: cacheType,
        isExpired,
        timeLeft: isExpired ? 'Expirado' : `${hoursLeft}h ${minutesLeft}m`,
        expiry: new Date(expiry).toLocaleString('pt-BR'),
      });
    }

    return {
      total: totalKeys,
      valid: validKeys,
      expired: expiredKeys,
      items: cacheItems,
    };
  }
}

// Exportar instância singleton
export const cacheService = new CacheStrategyService();

