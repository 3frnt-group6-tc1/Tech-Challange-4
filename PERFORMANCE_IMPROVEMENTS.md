# Performance Improvements Documentation

## Visão Geral

Este documento descreve as melhorias de performance implementadas no aplicativo de controle financeiro, incluindo lazy loading, pré-carregamento de dados e otimizações de renderização.

## 1. Lazy Loading de Telas

### Implementação

As telas do aplicativo agora são carregadas sob demanda usando React.lazy() e Suspense, reduzindo o bundle inicial e melhorando o tempo de carregamento.

**Arquivo:** `App.js`

```javascript
import { lazy, Suspense } from "react";

// Lazy load screens
const HomeScreen = lazy(() => import("./screens/HomeScreen"));
const TransactionsScreen = lazy(() => import("./screens/TransactionsScreen"));
const DashboardScreen = lazy(() => import("./screens/DashboardScreen"));
// ... outras telas
```

### Benefícios

- **Redução do bundle inicial**: Cada tela é carregada apenas quando necessária
- **Tempo de inicialização mais rápido**: O aplicativo inicia mais rapidamente
- **Melhor experiência do usuário**: Loading screens informam o progresso

### Uso

As telas são automaticamente carregadas quando o usuário navega para elas. Um componente LoadingScreen é exibido durante o carregamento.

## 2. Componente LoadingScreen

### Descrição

Componente reutilizável que exibe um indicador de carregamento com mensagem personalizada.

**Arquivo:** `components/LoadingScreen.js`

### Características

- Mensagem personalizável
- Integração com tema (dark/light mode)
- Animação de loading
- Acessível e responsivo

### Uso

```javascript
<Suspense fallback={<LoadingScreen message="Carregando dados..." />}>
  <YourComponent />
</Suspense>
```

## 3. Otimização de Componentes com React.memo

### Componentes Otimizados

Os seguintes componentes foram otimizados com React.memo para prevenir re-renderizações desnecessárias:

#### Card Component

**Arquivo:** `components/Card.js`

```javascript
export const Card = React.memo(
  ({ children, style, padding, margin, ...otherProps }) => {
    // ...
  }
);
```

#### TransactionItem Component

**Arquivo:** `components/TransactionItem.js`

```javascript
const TransactionItem = React.memo(({ transaction, onEdit, showImageButton, ... }) => {
  // ...
});
```

#### CategoryItem Component

**Arquivo:** `components/CategoryItem.js`

```javascript
const CategoryItem = React.memo(({ category, type, onEdit, onDelete }) => {
  // ...
});
```

#### Button Component

**Arquivo:** `components/Button.js`

```javascript
export const Button = React.memo(({ title, onPress, variant, size, ... }) => {
  // ...
});
```

### Benefícios do React.memo

- Evita re-renderizações quando as props não mudam
- Melhora a performance em listas grandes
- Reduz o uso de CPU e bateria

## 4. Uso de useMemo para Cálculos Pesados

### ExpenseChart Component

**Arquivo:** `components/ExpenseChart.js`

Componente otimizado que utiliza useMemo para calcular dados de gráfico apenas quando as transações mudam.

```javascript
const chartData = useMemo(() => {
  return transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});
}, [transactions]);
```

### OptimizedDashboardExample

**Arquivo:** `components/OptimizedDashboardExample.js`

Exemplo completo de dashboard otimizado com múltiplos usos de useMemo:

- Cálculo de estatísticas financeiras
- Filtragem de transações
- Cálculo de tendências
- Cores e ícones baseados em dados

### Benefícios do useMemo

- Evita recálculos desnecessários
- Melhora performance em operações complexas
- Mantém referências estáveis para evitar re-renderizações em cascata

## 5. Uso de useCallback para Funções

### useTransactionsScreen Hook

**Arquivo:** `hooks/useTransactionsScreen.js`

Hook otimizado que usa useCallback para todas as funções de handler:

```javascript
const handleEditTransaction = useCallback((transaction) => {
  setSelectedTransaction(transaction);
  setEditModalVisible(true);
}, []);

const handleSaveTransaction = useCallback(
  async (updatedTransaction) => {
    // ... lógica de salvamento
  },
  [deleteTransaction, updateTransaction]
);
```

### Benefícios do useCallback

- Mantém referências estáveis de funções
- Previne re-renderizações de componentes filhos
- Essencial quando funções são passadas como props

## 6. PreloaderService - Pré-carregamento de Dados

### Implementação

**Arquivo:** `src/infrastructure/services/PreloaderService.js`

Serviço que pré-carrega dados críticos do usuário em paralelo usando Promise.allSettled.

### Funcionalidades

#### preloadCriticalData(userId)

Pré-carrega todos os dados críticos:

- Transações do usuário
- Categorias
- Transações recorrentes
- Preferências do usuário

```javascript
const result = await PreloaderService.preloadCriticalData(userId);
// {
//   success: true,
//   loadTime: 1234,
//   summary: { total: 4, successful: 4, failed: 0 },
//   results: [...]
// }
```

#### preloadSpecificData(userId, dataTypes)

Pré-carrega dados específicos sob demanda:

```javascript
await PreloaderService.preloadSpecificData(userId, [
  "transactions",
  "categories",
]);
```

### Características

- **Execução paralela**: Usa Promise.allSettled para carregar todos os dados simultaneamente
- **Resistente a falhas**: Continua mesmo se algumas requisições falharem
- **Telemetria**: Registra tempo de carregamento e status de cada operação
- **Flexível**: Permite pré-carregar dados específicos conforme necessário

### Integração com AuthContext

**Arquivo:** `contexts/AuthContext.js`

O PreloaderService é automaticamente executado quando o usuário faz login:

```javascript
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      const preloadResult = await PreloaderService.preloadCriticalData(
        user.uid
      );
      setPreloadComplete(true);
    }
    setLoading(false);
  });
  return unsubscribe;
}, []);
```

### Benefícios

- **Experiência instantânea**: Dados já estão carregados quando o usuário navega
- **Redução de loading states**: Menos spinners e telas de carregamento
- **Melhor UX**: Transições suaves entre telas

## 7. Integração no App.js

### Loading States

O App.js agora gerencia três estados de loading:

1. **Loading inicial**: Verificando autenticação
2. **Preload de dados**: Carregando dados do usuário
3. **App pronto**: Usuário pode interagir

```javascript
const AppNavigator = () => {
  const { user, loading, preloadComplete } = useAuth();

  if (loading) {
    return <LoadingScreen message="Carregando aplicação..." />;
  }

  if (user && !preloadComplete) {
    return <LoadingScreen message="Preparando seus dados..." />;
  }

  return <NavigationContainer>...</NavigationContainer>;
};
```

## 8. Melhores Práticas Implementadas

### Para Componentes

1. **Use React.memo** para componentes que:

   - São renderizados frequentemente
   - Recebem as mesmas props com frequência
   - Fazem parte de listas grandes

2. **Use useMemo** para:

   - Cálculos complexos
   - Filtragens e transformações de arrays grandes
   - Criação de objetos/arrays derivados

3. **Use useCallback** para:
   - Funções passadas como props para componentes memoizados
   - Dependências de useEffect
   - Event handlers que não precisam mudar

### Para Dados

1. **Pré-carregue dados críticos** no login
2. **Use lazy loading** para telas e componentes pesados
3. **Implemente paginação** para listas grandes
4. **Cache dados** quando apropriado

### Para Performance

1. **Evite cálculos inline** em JSX
2. **Minimize re-renderizações** com memoização
3. **Use keys estáveis** em listas
4. **Otimize imagens** e assets

## 9. Métricas de Performance

### Antes das Otimizações

- Bundle inicial: ~X MB
- Tempo de carregamento: ~X segundos
- Re-renderizações: Alto

### Depois das Otimizações

- Bundle inicial: Reduzido (lazy loading)
- Tempo de carregamento: Mais rápido (preloading)
- Re-renderizações: Minimizadas (memoization)

## 10. Exemplos de Uso

### Exemplo 1: Componente com useMemo e useCallback

Veja `components/OptimizedDashboardExample.js` para um exemplo completo.

### Exemplo 2: Hook Otimizado

Veja `hooks/useTransactionsScreen.js` para um exemplo de hook com todas as otimizações.

### Exemplo 3: Pré-carregamento de Dados

```javascript
// Em qualquer lugar do app
const loadData = async () => {
  const result = await PreloaderService.preloadSpecificData(userId, [
    "transactions",
    "categories",
  ]);

  if (result.success) {
    console.log("Dados carregados com sucesso");
  }
};
```

## 11. Troubleshooting

### Problema: Componente não re-renderiza com React.memo

**Solução**: Certifique-se de que as props não incluem objetos/funções recriados a cada render. Use useMemo/useCallback.

### Problema: useMemo não melhora performance

**Solução**: A operação pode não ser pesada o suficiente. useMemo tem um custo, use apenas para operações complexas.

### Problema: Preload muito lento

**Solução**:

- Verifique a conexão de rede
- Considere pré-carregar menos dados inicialmente
- Implemente timeout para requisições

## 12. Próximos Passos

- [ ] Implementar cache mais robusto
- [ ] Adicionar service worker para offline
- [ ] Otimizar imagens com lazy loading
- [ ] Implementar virtual lists para listas muito grandes
- [ ] Adicionar code splitting por rota
- [ ] Implementar prefetching de dados

## Conclusão

As otimizações implementadas melhoram significativamente a performance do aplicativo através de:

- Carregamento sob demanda de código
- Pré-carregamento inteligente de dados
- Minimização de re-renderizações
- Otimização de cálculos pesados

Estas melhorias resultam em um aplicativo mais rápido, responsivo e com melhor experiência do usuário.
