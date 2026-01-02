import { Transaction } from "../entities/Transaction";

/**
 * Use Case: Obter transações do usuário
 * @class GetTransactionsUseCase
 */
export class GetTransactionsUseCase {
  /**
   * @param {Object} transactionRepository - Repositório de transações
   * @param {Object} encryptionService - Serviço de criptografia
   * @param {Object} cacheService - Serviço de cache
   */
  constructor(transactionRepository, encryptionService = null, cacheService = null) {
    this.transactionRepository = transactionRepository;
    this.encryptionService = encryptionService;
    this.cacheService = cacheService;
  }

  /**
   * Executa a busca de transações
   * @param {string} userId - ID do usuário
   * @param {Object} [filters] - Filtros opcionais
   * @param {string} [filters.type] - Filtrar por tipo (income/expense)
   * @param {string} [filters.category] - Filtrar por categoria
   * @param {string} [filters.startDate] - Data inicial
   * @param {string} [filters.endDate] - Data final
   * @param {string} [filters.search] - Busca por texto
   * @returns {Promise<Transaction[]>} Lista de transações
   */
  async execute(userId, filters = {}) {
    // 1. Tentar obter do cache
    const cacheKey = `transactions_${userId}_${JSON.stringify(filters)}`;
    
    if (this.cacheService) {
      const cached = await this.cacheService.get(cacheKey);
      if (cached) {
        return cached.map(t => Transaction.fromPlainObject(t));
      }
    }

    // 2. Buscar do repositório
    let transactions = await this.transactionRepository.findByUserId(userId);

    // 3. Descriptografar se necessário
    if (this.encryptionService?.isInitialized) {
      transactions = await Promise.all(
        transactions.map(async (t) => {
          if (t._isEncrypted) {
            try {
              return await this.encryptionService.decryptTransaction(t);
            } catch (error) {
              console.warn("GetTransactionsUseCase: Erro ao descriptografar", error);
              return t;
            }
          }
          return t;
        })
      );
    }

    // 4. Aplicar filtros
    let filteredTransactions = transactions;

    if (filters.type) {
      filteredTransactions = filteredTransactions.filter(t => t.type === filters.type);
    }

    if (filters.category) {
      filteredTransactions = filteredTransactions.filter(t => t.category === filters.category);
    }

    if (filters.startDate) {
      filteredTransactions = filteredTransactions.filter(t => t.date >= filters.startDate);
    }

    if (filters.endDate) {
      filteredTransactions = filteredTransactions.filter(t => t.date <= filters.endDate);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredTransactions = filteredTransactions.filter(t => 
        t.title?.toLowerCase().includes(searchLower) ||
        t.description?.toLowerCase().includes(searchLower) ||
        t.category?.toLowerCase().includes(searchLower)
      );
    }

    // 5. Ordenar por data (mais recentes primeiro)
    filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    // 6. Salvar no cache
    if (this.cacheService) {
      await this.cacheService.set(cacheKey, filteredTransactions, 5 * 60 * 1000); // 5 minutos
    }

    // 7. Converter para entidades
    return filteredTransactions.map(t => Transaction.fromPlainObject(t));
  }
}

export default GetTransactionsUseCase;

