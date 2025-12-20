/**
 * Entidade Transaction - Representa uma transação financeira
 * @class Transaction
 */
export class Transaction {
  /**
   * @param {Object} data - Dados da transação
   * @param {string} data.id - ID único da transação
   * @param {number} data.amount - Valor da transação
   * @param {string} data.title - Título da transação
   * @param {string} data.description - Descrição da transação
   * @param {string} data.type - Tipo: 'income' ou 'expense'
   * @param {string} data.category - Categoria da transação
   * @param {string} data.date - Data da transação (ISO string)
   * @param {string} data.userId - ID do usuário proprietário
   * @param {string} [data.imageUrl] - URL da imagem anexada
   * @param {boolean} [data.isRecurring] - Se é uma transação recorrente
   * @param {string} [data.recurringId] - ID da transação recorrente origem
   */
  constructor({
    id,
    amount,
    title,
    description,
    type,
    category,
    date,
    userId,
    imageUrl = null,
    isRecurring = false,
    recurringId = null,
    createdAt = null,
    updatedAt = null,
  }) {
    this.id = id;
    this.amount = parseFloat(amount) || 0;
    this.title = title?.trim() || "";
    this.description = description?.trim() || "";
    this.type = type; // 'income' | 'expense'
    this.category = category;
    this.date = date || new Date().toISOString().split("T")[0];
    this.userId = userId;
    this.imageUrl = imageUrl;
    this.isRecurring = isRecurring;
    this.recurringId = recurringId;
    this.createdAt = createdAt || new Date().toISOString();
    this.updatedAt = updatedAt || new Date().toISOString();
  }

  /**
   * Valida se a transação possui todos os campos obrigatórios
   * @returns {Object} { isValid: boolean, errors: string[] }
   */
  validate() {
    const errors = [];

    if (!this.amount || this.amount <= 0) {
      errors.push("Valor deve ser maior que zero");
    }

    if (!this.title || this.title.length < 1) {
      errors.push("Título é obrigatório");
    }

    if (!this.type || !["income", "expense"].includes(this.type)) {
      errors.push("Tipo deve ser 'income' ou 'expense'");
    }

    if (!this.category) {
      errors.push("Categoria é obrigatória");
    }

    if (!this.date) {
      errors.push("Data é obrigatória");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Retorna o valor com sinal baseado no tipo
   * @returns {number} Valor positivo para income, negativo para expense
   */
  getSignedAmount() {
    return this.type === "expense" ? -Math.abs(this.amount) : Math.abs(this.amount);
  }

  /**
   * Verifica se é uma despesa
   * @returns {boolean}
   */
  isExpense() {
    return this.type === "expense";
  }

  /**
   * Verifica se é uma receita
   * @returns {boolean}
   */
  isIncome() {
    return this.type === "income";
  }

  /**
   * Converte para objeto plano (para Firestore)
   * @returns {Object}
   */
  toPlainObject() {
    return {
      id: this.id,
      amount: this.amount,
      title: this.title,
      description: this.description,
      type: this.type,
      category: this.category,
      date: this.date,
      userId: this.userId,
      imageUrl: this.imageUrl,
      isRecurring: this.isRecurring,
      recurringId: this.recurringId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * Cria uma Transaction a partir de um objeto plano
   * @param {Object} data - Dados do Firestore
   * @returns {Transaction}
   */
  static fromPlainObject(data) {
    return new Transaction(data);
  }
}

export default Transaction;

