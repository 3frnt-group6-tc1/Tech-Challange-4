import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Serviço base de cache com suporte a TTL (Time To Live) e persistência
 * @class CacheService
 */
export class CacheService {
  constructor() {
    this.cache = new Map();
    this.ttlMap = new Map();
  }

  /**
   * Obtém um valor do cache ou executa a função fallback se não existir ou estiver expirado
   * @param {string} key - Chave do cache
   * @param {Function} fallback - Função assíncrona que retorna os dados se não estiverem em cache
   * @param {number} ttl - Tempo de vida em milissegundos (padrão: 5 minutos)
   * @returns {Promise<any>} Dados do cache ou resultado do fallback
   */
  async get(key, fallback, ttl = 300000) {
    // 5 minutos padrão
    // Verificar primeiro na memória
    if (this.has(key) && !this.isExpired(key)) {
      return this.cache.get(key);
    }

    // Se não estiver na memória, verificar no AsyncStorage
    try {
      const cacheKey = `cache_${key}`;
      const cached = await AsyncStorage.getItem(cacheKey);
      
      if (cached) {
        const { data, expiry } = JSON.parse(cached);
        
        // Verificar se ainda não expirou
        if (Date.now() < expiry) {
          // Carregar na memória para próximas buscas
          this.cache.set(key, data);
          this.ttlMap.set(key, expiry);
          return data;
        } else {
          // Remover se expirado
          await AsyncStorage.removeItem(cacheKey);
        }
      }
    } catch (error) {
      console.error(`Erro ao buscar cache do AsyncStorage para ${key}:`, error);
    }

    // Se não encontrou no cache, executar fallback
    const data = await fallback();
    await this.set(key, data, ttl);
    return data;
  }

  /**
   * Armazena um valor no cache com TTL
   * @param {string} key - Chave do cache
   * @param {any} data - Dados a serem armazenados
   * @param {number} ttl - Tempo de vida em milissegundos
   */
  async set(key, data, ttl) {
    this.cache.set(key, data);
    this.ttlMap.set(key, Date.now() + ttl);

    // Persistir no AsyncStorage para cache persistente
    try {
      await AsyncStorage.setItem(
        `cache_${key}`,
        JSON.stringify({
          data,
          expiry: Date.now() + ttl,
        })
      );
    } catch (error) {
      console.error(`Erro ao persistir cache para chave ${key}:`, error);
    }
  }

  /**
   * Verifica se uma chave existe no cache
   * @param {string} key - Chave do cache
   * @returns {boolean} True se a chave existe
   */
  has(key) {
    return this.cache.has(key);
  }

  /**
   * Verifica se uma chave do cache está expirada
   * @param {string} key - Chave do cache
   * @returns {boolean} True se a chave está expirada ou não existe
   */
  isExpired(key) {
    const expiry = this.ttlMap.get(key);
    return !expiry || Date.now() > expiry;
  }

  /**
   * Remove uma chave do cache
   * @param {string} key - Chave do cache
   */
  async delete(key) {
    this.cache.delete(key);
    this.ttlMap.delete(key);
    
    try {
      await AsyncStorage.removeItem(`cache_${key}`);
    } catch (error) {
      console.error(`Erro ao remover cache para chave ${key}:`, error);
    }
  }

  /**
   * Limpa todo o cache
   */
  async clear() {
    this.cache.clear();
    this.ttlMap.clear();
    
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter((key) => key.startsWith('cache_'));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
    }
  }

  /**
   * Remove todas as chaves expiradas do cache
   */
  async clearExpired() {
    const expiredKeys = [];
    
    for (const [key, expiry] of this.ttlMap.entries()) {
      if (Date.now() > expiry) {
        expiredKeys.push(key);
      }
    }

    for (const key of expiredKeys) {
      await this.delete(key);
    }

    // Limpar também do AsyncStorage
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter((key) => key.startsWith('cache_'));
      
      for (const cacheKey of cacheKeys) {
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached) {
          const { expiry } = JSON.parse(cached);
          if (Date.now() > expiry) {
            await AsyncStorage.removeItem(cacheKey);
          }
        }
      }
    } catch (error) {
      console.error('Erro ao limpar cache expirado do AsyncStorage:', error);
    }
  }
}

