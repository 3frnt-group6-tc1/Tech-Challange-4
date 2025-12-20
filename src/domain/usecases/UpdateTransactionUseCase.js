import { Transaction } from "../entities/Transaction";

/**
 * Use Case: Atualizar uma transação existente
 * @class UpdateTransactionUseCase
 */
export class UpdateTransactionUseCase {
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
   * Executa a atualização de uma transação
   * @param {string} userId - ID do usuário
   * @param {string} transactionId - ID da transação
   * @param {Object} updateData - Dados para atualizar
   * @returns {Promise<Transaction>} Transação atualizada
   * @throws {Error} Se validação falhar ou transação não encontrada
   */
  async execute(userId, transactionId, updateData) {
    if (!userId || !transactionId) {
      throw new Error("userId e transactionId são obrigatórios");
    }

    // 1. Buscar transação existente
    const existingTransaction = await this.transactionRepository.findById(userId, transactionId);
    
    if (!existingTransaction) {
      throw new Error("Transação não encontrada");
    }

    // 2. Mesclar dados
    const updatedData = {
      ...existingTransaction,
      ...updateData,
      id: transactionId,
      userId,
      updatedAt: new Date().toISOString(),
    };

    // 3. Criar e validar entidade
    const transaction = new Transaction(updatedData);
    const validation = transaction.validate();
    
    if (!validation.isValid) {
      throw new Error(`Validação falhou: ${validation.errors.join(", ")}`);
    }

    // 4. Preparar dados para persistência
    let dataToSave = transaction.toPlainObject();
    delete dataToSave.id; // Remover id dos dados de update

    // 5. Criptografar se serviço disponível
    if (this.encryptionService?.isInitialized) {
      try {
        dataToSave = await this.encryptionService.encryptTransaction(dataToSave);
      } catch (error) {
        console.warn("UpdateTransactionUseCase: Erro ao criptografar", error);
      }
    }

    // 6. Atualizar no repositório
    await this.transactionRepository.update(userId, transactionId, dataToSave);

    // 7. Invalidar cache
    if (this.cacheService) {
      await this.cacheService.invalidate(`transactions_${userId}`);
    }

    return transaction;
  }
}

export default UpdateTransactionUseCase;

