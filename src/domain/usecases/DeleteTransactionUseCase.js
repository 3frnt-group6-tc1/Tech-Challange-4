/**
 * Use Case: Deletar uma transação
 * @class DeleteTransactionUseCase
 */
export class DeleteTransactionUseCase {
  /**
   * @param {Object} transactionRepository - Repositório de transações
   * @param {Object} cacheService - Serviço de cache
   */
  constructor(transactionRepository, cacheService = null) {
    this.transactionRepository = transactionRepository;
    this.cacheService = cacheService;
  }

  /**
   * Executa a deleção de uma transação
   * @param {string} userId - ID do usuário
   * @param {string} transactionId - ID da transação
   * @returns {Promise<boolean>} true se deletado com sucesso
   * @throws {Error} Se transação não encontrada ou erro na deleção
   */
  async execute(userId, transactionId) {
    if (!userId || !transactionId) {
      throw new Error("userId e transactionId são obrigatórios");
    }

    // 1. Verificar se transação existe
    const transaction = await this.transactionRepository.findById(userId, transactionId);
    
    if (!transaction) {
      throw new Error("Transação não encontrada");
    }

    // 2. Deletar do repositório
    await this.transactionRepository.delete(userId, transactionId);

    // 3. Invalidar cache
    if (this.cacheService) {
      await this.cacheService.invalidate(`transactions_${userId}`);
    }

    return true;
  }
}

export default DeleteTransactionUseCase;

