import { formatDate } from './dateFormatter';

export const generateCSVReport = (transactions, dateRange = null) => {
  let filteredTransactions = transactions;
  
  if (dateRange && dateRange.start && dateRange.end) {
    filteredTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= new Date(dateRange.start) && 
             transactionDate <= new Date(dateRange.end);
    });
  }

  const headers = [
    'Data',
    'Título',
    'Descrição',
    'Categoria',
    'Tipo',
    'Valor',
    'Recorrente'
  ];

  const rows = filteredTransactions.map(transaction => [
    formatDate(transaction.date),
    `"${transaction.title.replace(/"/g, '""')}"`,
    `"${transaction.description.replace(/"/g, '""')}"`,
    `"${transaction.category.replace(/"/g, '""')}"`,
    transaction.type === 'income' ? 'Receita' : 'Despesa',
    transaction.amount.toFixed(2).replace('.', ','),
    transaction.isRecurring ? 'Sim' : 'Não'
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.join(';'))
    .join('\n');

  const BOM = '\uFEFF';
  return BOM + csvContent;
};

export const generateSummaryReport = (transactions, dateRange = null) => {
  let filteredTransactions = transactions;
  
  if (dateRange && dateRange.start && dateRange.end) {
    filteredTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= new Date(dateRange.start) && 
             transactionDate <= new Date(dateRange.end);
    });
  }

  const income = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const expense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = income - expense;

  const categoryBreakdown = {};
  filteredTransactions.forEach(transaction => {
    const key = `${transaction.type}_${transaction.category}`;
    if (!categoryBreakdown[key]) {
      categoryBreakdown[key] = {
        type: transaction.type === 'income' ? 'Receita' : 'Despesa',
        category: transaction.category,
        amount: 0,
        count: 0
      };
    }
    categoryBreakdown[key].amount += transaction.amount;
    categoryBreakdown[key].count += 1;
  });

  let periodText = 'Todos os períodos';
  if (dateRange && dateRange.start && dateRange.end) {
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    periodText = `${startDate.toLocaleDateString('pt-BR')} a ${endDate.toLocaleDateString('pt-BR')}`;
  }

  return {
    period: periodText,
    totalIncome: income,
    totalExpense: expense,
    balance: balance,
    transactionCount: filteredTransactions.length,
    categoryBreakdown: Object.values(categoryBreakdown).sort((a, b) => b.amount - a.amount)
  };
};

export const generateTextReport = (transactions, dateRange = null) => {
  const summary = generateSummaryReport(transactions, dateRange);
  
  let filteredTransactions = transactions;
  if (dateRange && dateRange.start && dateRange.end) {
    filteredTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= new Date(dateRange.start) && 
             transactionDate <= new Date(dateRange.end);
    });
  }
  
  let report = `RELATÓRIO FINANCEIRO\n`;
  report += `========================\n\n`;
  report += `Período: ${summary.period}\n`;
  report += `Data do relatório: ${new Date().toLocaleDateString('pt-BR')}\n\n`;
  
  report += `RESUMO FINANCEIRO\n`;
  report += `-----------------\n`;
  report += `Total de Receitas: R$ ${summary.totalIncome.toFixed(2)}\n`;
  report += `Total de Despesas: R$ ${summary.totalExpense.toFixed(2)}\n`;
  report += `Saldo: R$ ${summary.balance.toFixed(2)}\n`;
  report += `Total de Transações: ${summary.transactionCount}\n\n`;
  
  if (summary.categoryBreakdown.length > 0) {
    report += `BREAKDOWN POR CATEGORIA\n`;
    report += `----------------------\n`;
    summary.categoryBreakdown.forEach(item => {
      report += `${item.type} - ${item.category}: R$ ${item.amount.toFixed(2)} (${item.count} transações)\n`;
    });
    report += `\n`;
  }
  
  if (filteredTransactions.length > 0) {
    report += `DETALHAMENTO DAS TRANSAÇÕES\n`;
    report += `--------------------------\n`;
    
    const sortedTransactions = filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    sortedTransactions.forEach((transaction, index) => {
      const date = new Date(transaction.date).toLocaleDateString('pt-BR');
      const type = transaction.type === 'income' ? 'Receita' : 'Despesa';
      const amount = transaction.amount.toFixed(2);
      const recurring = transaction.isRecurring ? ' (Recorrente)' : '';
      
      report += `${index + 1}. ${date} - ${transaction.title}\n`;
      report += `   ${type} | ${transaction.category} | R$ ${amount}${recurring}\n`;
      if (transaction.description) {
        report += `   ${transaction.description}\n`;
      }
      report += `\n`;
    });
  }
  
  return report;
};

