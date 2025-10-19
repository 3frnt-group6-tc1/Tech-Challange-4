export const parseCurrency = (formattedValue) => {
  if (!formattedValue) return '';
  
  const numericValue = formattedValue.replace(/\D/g, '');
  return (numericValue / 100).toFixed(2);
};

export const formatCurrencyInput = (value) => {
  if (!value) return '';
  
  const numericValue = value.replace(/\D/g, '');
  if (numericValue === '') return '';
  
  const formattedValue = (numericValue / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
  });
  
  return `R$ ${formattedValue}`;
};

export const formatCurrency = (amount, currency = { symbol: 'R$', locale: 'pt-BR' }) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return `${currency.symbol} 0,00`;
  }

  const formattedValue = Number(amount).toLocaleString(currency.locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `${currency.symbol} ${formattedValue}`;
};