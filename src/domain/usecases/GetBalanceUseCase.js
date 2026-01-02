/**
 * Use Case: Calcular saldo e totais do usuário
 * @class GetBalanceUseCase
 */
export class GetBalanceUseCase {
  /**
   * @param {Object} getTransactionsUseCase - Use case de buscar transações
   */
  constructor(getTransactionsUseCase) {
    this.getTransactionsUseCase = getTransactionsUseCase;
  }

  /**
   * Executa o cálculo de saldo
   * @param {string} userId - ID do usuário
   * @param {Object} [options] - Opções
   * @param {string} [options.startDate] - Data inicial
   * @param {string} [options.endDate] - Data final
   * @returns {Promise<Object>} Saldo e totais
   */
  async execute(userId, options = {}) {
    // 1. Buscar transações
    const transactions = await this.getTransactionsUseCase.execute(userId, options);

    // 2. Calcular totais
    let totalIncome = 0;
    let totalExpense = 0;
    const byCategory = {};
    const byMonth = {};

    transactions.forEach((transaction) => {
      const amount = parseFloat(transaction.amount) || 0;

      if (transaction.type === "income") {
        totalIncome += amount;
      } else {
        totalExpense += amount;
      }

      // Agrupar por categoria
      const category = transaction.category || "Outros";
      if (!byCategory[category]) {
        byCategory[category] = { income: 0, expense: 0, total: 0 };
      }
      if (transaction.type === "income") {
        byCategory[category].income += amount;
      } else {
        byCategory[category].expense += amount;
      }
      byCategory[category].total = byCategory[category].income - byCategory[category].expense;

      // Agrupar por mês
      const monthKey = transaction.date?.substring(0, 7) || "unknown"; // YYYY-MM
      if (!byMonth[monthKey]) {
        byMonth[monthKey] = { income: 0, expense: 0, balance: 0 };
      }
      if (transaction.type === "income") {
        byMonth[monthKey].income += amount;
      } else {
        byMonth[monthKey].expense += amount;
      }
      byMonth[monthKey].balance = byMonth[monthKey].income - byMonth[monthKey].expense;
    });

    // 3. Calcular saldo
    const balance = totalIncome - totalExpense;

    // 4. Estatísticas adicionais
    const transactionCount = transactions.length;
    const incomeCount = transactions.filter(t => t.type === "income").length;
    const expenseCount = transactions.filter(t => t.type === "expense").length;
    const averageTransaction = transactionCount > 0 ? (totalIncome + totalExpense) / transactionCount : 0;

    return {
      balance,
      totalIncome,
      totalExpense,
      transactionCount,
      incomeCount,
      expenseCount,
      averageTransaction,
      byCategory,
      byMonth,
      savingsRate: totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0,
    };
  }

  /**
   * Calcula o saldo do mês atual
   * @param {string} userId - ID do usuário
   * @returns {Promise<Object>} Saldo do mês
   */
  async getCurrentMonthBalance(userId) {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];

    return this.execute(userId, { startDate, endDate });
  }
}

export default GetBalanceUseCase;

