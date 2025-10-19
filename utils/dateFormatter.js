export const formatDate = (dateString) => {
  if (!dateString) return 'Data não informada';
  
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    return 'Data inválida';
  }
  
  return date.toLocaleDateString('pt-BR');
};

