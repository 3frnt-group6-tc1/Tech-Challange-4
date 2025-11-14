import AsyncStorage from '@react-native-async-storage/async-storage';
import { CacheService } from './CacheService';

/**
 * Serviço de cache persistente que estende CacheService
 * Carrega dados do AsyncStorage na inicialização
 * @class PersistentCacheService
 */
export class PersistentCacheService extends CacheService {
  /**
   * Carrega todos os caches válidos do AsyncStorage para a memória
   * Deve ser chamado na inicialização da aplicação
   */
  async loadFromStorage() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter((key) => key.startsWith('cache_'));

      for (const key of cacheKeys) {
        const cacheKey = key.replace('cache_', '');
        const cached = await AsyncStorage.getItem(key);

        if (cached) {
          try {
            const { data, expiry } = JSON.parse(cached);
            
            // Verificar se ainda não expirou
            if (Date.now() < expiry) {
              this.cache.set(cacheKey, data);
              this.ttlMap.set(cacheKey, expiry);
            } else {
              // Remover se expirado
              await AsyncStorage.removeItem(key);
            }
          } catch (parseError) {
            console.error(`Erro ao parsear cache para chave ${key}:`, parseError);
            // Remover cache corrompido
            await AsyncStorage.removeItem(key);
          }
        }
      }
    } catch (error) {
      console.error('Erro ao carregar cache do AsyncStorage:', error);
    }
  }

  /**
   * Inicializa o serviço carregando dados do AsyncStorage
   * @returns {Promise<void>}
   */
  async initialize() {
    await this.loadFromStorage();
    // Limpar caches expirados na inicialização
    await this.clearExpired();
  }
}

