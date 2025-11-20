# Comandos Rápidos - Performance

## 🚀 Quick Start

```bash
# Instalar dependências
npm install

# Limpar cache e rodar
npm start -- --reset-cache
npm run ios  # ou npm run android
```

## 🧪 Testes de Performance

```bash
# Testar componentes otimizados
npm test -- components/Card
npm test -- components/TransactionItem
npm test -- components/ExpenseChart

# Testar PreloaderService
npm test -- PreloaderService

# Todos os testes de performance
npm test -- __tests__/performance
```

## 🔍 Debug e Análise

```bash
# React DevTools
npm install -g react-devtools
react-devtools

# Bundle analyzer
npx react-native-bundle-visualizer

# Performance monitor
# Abra Developer Menu (Cmd+D) > Show Perf Monitor
```

## 📊 Métricas

```bash
# Medir tamanho do bundle
npm run bundle-report

# Verificar imports não usados
npx depcheck

# Análise de código
npm run lint
```

## 🐛 Troubleshooting

```bash
# Limpar tudo e reinstalar
rm -rf node_modules
npm install
npm start -- --reset-cache

# Limpar cache do Metro
rm -rf $TMPDIR/metro-*

# Rebuild completo
cd ios && pod install && cd ..
npm run ios -- --reset-cache
```

## 📝 Logs Úteis

```javascript
// Ver logs do PreloaderService
// Console do app mostrará:
PreloaderService: Data preloaded in XXXms
PreloaderService: Loaded XX transactions

// Ver re-renders
// Use React DevTools Profiler

// Ver bundle size
// Use Bundle Analyzer
```

## 🎯 Verificação Rápida

```bash
# 1. Lazy loading funciona?
# Observe LoadingScreen entre navegações

# 2. React.memo funciona?
# Use React DevTools Profiler

# 3. PreloaderService funciona?
# Veja logs no console após login

# 4. Performance melhorou?
# Compare FPS antes/depois
```

## 📚 Documentação

- **Completa**: PERFORMANCE_IMPROVEMENTS.md
- **Rápida**: PERFORMANCE_QUICK_GUIDE.md
- **Testes**: PERFORMANCE_TESTING_GUIDE.md
- **Resumo**: PERFORMANCE_SUMMARY.md

## 🔧 Snippets Úteis

### Adicionar React.memo a um componente

```javascript
const MyComponent = React.memo(({ props }) => {
  return <View>...</View>;
});
```

### Adicionar useMemo

```javascript
const data = useMemo(() => {
  return heavyCalculation(items);
}, [items]);
```

### Adicionar useCallback

```javascript
const handleAction = useCallback(() => {
  // ação aqui
}, [dependencies]);
```

### Testar Preloader manualmente

```javascript
import { PreloaderService } from "./src/infrastructure/services";

const result = await PreloaderService.preloadCriticalData("userId");
console.log(result);
```

## ⚡ Performance Tips

1. Use React.memo apenas quando necessário
2. useMemo para operações pesadas
3. useCallback para funções em props
4. Lazy loading para telas grandes
5. Paginação para listas grandes
6. Preload apenas dados críticos

## 🎉 Pronto!

Agora você tem todas as ferramentas para trabalhar com as otimizações de performance!
