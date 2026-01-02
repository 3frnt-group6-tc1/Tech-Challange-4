import { Transaction } from "../entities/Transaction";

/**
 * Use Case: Criar uma nova transação
 * @class CreateTransactionUseCase
 */
export class CreateTransactionUseCase {
  /**
   * @param {Object} transactionRepository - Repositório de transações
   * @param {Object} encryptionService - Serviço de criptografia
   */
  constructor(transactionRepository, encryptionService = null) {
    this.transactionRepository = transactionRepository;
    this.encryptionService = encryptionService;
  }

  /**
   * Executa a criação de uma transação
   * @param {Object} transactionData - Dados da transação
   * @param {string} userId - ID do usuário
   * @returns {Promise<Transaction>} Transação criada
   * @throws {Error} Se validação falhar
   */
  async execute(transactionData, userId) {
    // 1. Criar entidade de transação
    const transaction = new Transaction({
      ...transactionData,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // 2. Validar transação
    const validation = transaction.validate();
    if (!validation.isValid) {
      throw new Error(`Validação falhou: ${validation.errors.join(", ")}`);
    }

    // 3. Preparar dados para persistência
    let dataToSave = transaction.toPlainObject();

    // 4. Criptografar se serviço disponível
    if (this.encryptionService?.isInitialized) {
      try {
        dataToSave = await this.encryptionService.encryptTransaction(dataToSave);
      } catch (error) {
        console.warn("CreateTransactionUseCase: Erro ao criptografar, salvando sem criptografia", error);
      }
    }

    // 5. Persistir no repositório
    const createdTransaction = await this.transactionRepository.create(userId, dataToSave);

    return Transaction.fromPlainObject(createdTransaction);
  }
}

export default CreateTransactionUseCase;

