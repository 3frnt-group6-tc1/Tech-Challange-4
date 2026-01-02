# Hooks de Interface Responsiva

Este diretório contém hooks customizados para criar interfaces responsivas com listeners em tempo real e notificações.

## 🔄 Hooks de Tempo Real

### `useRealtimeTransactions`

Hook para escutar transações em tempo real do Firestore.

```javascript
import { useRealtimeTransactions } from './hooks';
import { useAuth } from '../domain/contexts/AuthContext';

const TransactionsList = () => {
  const { user } = useAuth();
  const { 
    transactions, 
    isLoading, 
    error, 
    refresh,
    lastUpdate 
  } = useRealtimeTransactions(user?.uid, {
    limitCount: 50,        // Opcional: limitar quantidade
    type: 'expense',       // Opcional: filtrar por tipo
    category: 'Alimentação' // Opcional: filtrar por categoria
  });

  if (isLoading) return <Loading />;
  if (error) return <Error message={error} />;

  return (
    <FlatList
      data={transactions}
      renderItem={({ item }) => <TransactionItem transaction={item} />}
      refreshing={false}
      onRefresh={refresh}
    />
  );
};
```

### `useRealtimeRecurringTransactions`

Hook para escutar transações recorrentes em tempo real.

```javascript
import { useRealtimeRecurringTransactions } from './hooks';

const RecurringList = () => {
  const { user } = useAuth();
  const { recurringTransactions, isLoading } = useRealtimeRecurringTransactions(user?.uid);
  
  // ...
};
```

### `useRealtimeCategories`

Hook para escutar categorias em tempo real.

```javascript
import { useRealtimeCategories } from './hooks';

const CategoryPicker = () => {
  const { user } = useAuth();
  const { 
    categories, 
    incomeCategories, 
    expenseCategories,
    getCategoriesByType,
    hasCategory 
  } = useRealtimeCategories(user?.uid);
  
  // ...
};
```

## 🔍 Hooks de Debounce

### `useDebouncedSearch`

Hook simples para debounce de termos de busca.

```javascript
import { useDebouncedSearch } from './hooks';

const SearchComponent = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedTerm = useDebouncedSearch(searchTerm, 500);

  useEffect(() => {
    if (debouncedTerm) {
      // Executar busca apenas após debounce
      performSearch(debouncedTerm);
    }
  }, [debouncedTerm]);

  return (
    <TextInput
      value={searchTerm}
      onChangeText={setSearchTerm}
      placeholder="Buscar..."
    />
  );
};
```

### `useSearchWithLoading`

Hook com indicador de busca pendente.

```javascript
import { useSearchWithLoading } from './hooks';

const SearchWithIndicator = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { debouncedTerm, isSearching } = useSearchWithLoading(searchTerm, 300);

  return (
    <View>
      <TextInput value={searchTerm} onChangeText={setSearchTerm} />
      {isSearching && <ActivityIndicator />}
    </View>
  );
};
```

### `useDebouncedValue`

Hook avançado com controles adicionais.

```javascript
import { useDebouncedValue } from './hooks';

const AdvancedSearch = () => {
  const { 
    value, 
    debouncedValue, 
    setValue, 
    flush,  // Forçar atualização imediata
    cancel, // Cancelar debounce pendente
    reset   // Resetar para valor inicial
  } = useDebouncedValue('', 500);

  return (
    <View>
      <TextInput value={value} onChangeText={setValue} />
      <Button title="Buscar Agora" onPress={flush} />
      <Button title="Limpar" onPress={reset} />
    </View>
  );
};
```

## 📱 Hooks de Estado do App

### `useAppState`

Hook para monitorar estado do app (foreground/background).

```javascript
import { useAppState } from './hooks';

const AppStateMonitor = () => {
  const { 
    appState,      // 'active' | 'background' | 'inactive'
    isActive,      // boolean
    lastActiveTime // Date
  } = useAppState({
    onForeground: ({ timeInBackground }) => {
      console.log(`App voltou após ${timeInBackground}ms`);
    },
    onBackground: () => {
      console.log('App foi para background');
    },
    minBackgroundTime: 30000 // Executar callback após 30s em background
  });

  return <Text>Estado: {appState}</Text>;
};
```

### `useAutoRefresh`

Hook para auto-refresh quando app volta ao foreground.

```javascript
import { useAutoRefresh } from './hooks';

const DashboardScreen = () => {
  const loadDashboardData = async () => {
    // Carregar dados do dashboard
  };

  const { 
    isRefreshing, 
    lastRefreshTime, 
    manualRefresh 
  } = useAutoRefresh(loadDashboardData, {
    enabled: true,
    minBackgroundTime: 60000, // Refresh após 1 min em background
    refreshOnMount: true      // Refresh ao montar componente
  });

  return (
    <View>
      <RefreshControl refreshing={isRefreshing} onRefresh={manualRefresh} />
      {/* Conteúdo do dashboard */}
    </View>
  );
};
```

### `usePolling`

Hook para polling periódico de dados.

```javascript
import { usePolling } from './hooks';

const LiveDataComponent = () => {
  const fetchLiveData = async () => {
    const response = await api.getLiveData();
    return response.data;
  };

  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = usePolling(fetchLiveData, {
    interval: 30000,         // Atualizar a cada 30s
    pauseOnBackground: true, // Pausar quando em background
    fetchOnMount: true       // Buscar ao montar
  });

  return <DataDisplay data={data} loading={isLoading} />;
};
```

### `useConnectionSync`

Hook para sincronizar dados quando app retorna ao foreground.

```javascript
import { useConnectionSync } from './hooks';

const SyncComponent = () => {
  const syncPendingChanges = async () => {
    // Sincronizar alterações pendentes
  };

  const { isSyncing, lastSyncTime, syncNow } = useConnectionSync(
    syncPendingChanges,
    { enabled: true }
  );

  return (
    <View>
      {isSyncing && <Text>Sincronizando...</Text>}
      <Button title="Sincronizar Agora" onPress={syncNow} />
    </View>
  );
};
```

## 🔔 Notificações em Tempo Real

### `useRealtimeNotifications`

Hook para gerenciar notificações visuais de mudanças em tempo real.

```javascript
import { useRealtimeNotifications } from './hooks';

const NotificationExample = () => {
  const { 
    notifications, 
    showNotification,
    showSyncNotification,
    showUpdateNotification,
    showNewDataNotification,
    dismissNotification,
    clearAll 
  } = useRealtimeNotifications({
    duration: 3000,      // Duração da notificação
    maxNotifications: 3  // Máximo de notificações simultâneas
  });

  return (
    <View>
      <Button 
        title="Mostrar Notificação" 
        onPress={() => showNotification({
          type: 'success', // 'success' | 'info' | 'warning' | 'error' | 'sync'
          title: 'Sucesso!',
          message: 'Operação realizada com sucesso'
        })}
      />
    </View>
  );
};
```

### `useNotifications` (Context)

Hook do contexto global de notificações. Disponível em toda a aplicação.

```javascript
import { useNotifications } from '../domain/contexts/NotificationContext';

const MyComponent = () => {
  const { 
    showNotification,
    showSyncNotification,
    showUpdateNotification,
    showNewDataNotification 
  } = useNotifications();

  const handleSave = async () => {
    await saveData();
    showSyncNotification('Dados salvos com sucesso!');
  };

  return <Button title="Salvar" onPress={handleSave} />;
};
```

### Tipos de Notificação

| Tipo | Cor | Uso |
|------|-----|-----|
| `success` | Verde | Operações bem-sucedidas |
| `info` | Azul (tema) | Informações gerais |
| `warning` | Laranja | Avisos |
| `error` | Vermelho | Erros |
| `sync` | Azul | Sincronização de dados |

## 📋 Exemplo Completo

```javascript
import React from 'react';
import { View, FlatList, TextInput, RefreshControl } from 'react-native';
import { useAuth } from '../domain/contexts/AuthContext';
import {
  useRealtimeTransactions,
  useDebouncedSearch,
  useAutoRefresh,
} from './hooks';

const TransactionsScreen = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Debounce da busca
  const debouncedSearch = useDebouncedSearch(searchTerm, 300);
  
  // Transações em tempo real
  const { 
    transactions, 
    isLoading, 
    refresh 
  } = useRealtimeTransactions(user?.uid);
  
  // Auto-refresh ao voltar do background
  const { isRefreshing } = useAutoRefresh(refresh, {
    minBackgroundTime: 30000
  });

  // Filtrar transações
  const filteredTransactions = useMemo(() => {
    if (!debouncedSearch) return transactions;
    
    return transactions.filter(t => 
      t.title.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [transactions, debouncedSearch]);

  return (
    <View>
      <TextInput
        value={searchTerm}
        onChangeText={setSearchTerm}
        placeholder="Buscar transações..."
      />
      
      <FlatList
        data={filteredTransactions}
        renderItem={({ item }) => <TransactionItem item={item} />}
        refreshControl={
          <RefreshControl
            refreshing={isLoading || isRefreshing}
            onRefresh={refresh}
          />
        }
      />
    </View>
  );
};
```

