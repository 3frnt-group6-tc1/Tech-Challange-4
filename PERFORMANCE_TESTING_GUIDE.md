# Guia de Teste de Performance

## Como Verificar as Melhorias Implementadas

### 1. Teste de Lazy Loading

#### Objetivo

Verificar que as telas são carregadas sob demanda e que o bundle inicial é menor.

#### Passos

1. Abra o React Native Developer Menu (Cmd+D no iOS, Cmd+M no Android)
2. Ative "Show Perf Monitor"
3. Faça logout e login novamente
4. Observe que apenas os componentes necessários são carregados
5. Navegue entre telas e observe o carregamento suave

#### O que esperar

- ✅ LoadingScreen aparece brevemente entre navegações
- ✅ RAM usage menor no início
- ✅ Tempo de inicialização reduzido

### 2. Teste de React.memo

#### Objetivo

Verificar que componentes não re-renderizam desnecessariamente.

#### Ferramentas Necessárias

- React DevTools
- React Native Debugger

#### Passos

1. Instale React DevTools: `npm install -g react-devtools`
2. Execute: `react-devtools`
3. Conecte ao app
4. Abra a aba "Profiler"
5. Clique em "Record"
6. Execute ações no app (scroll, filtros, etc)
7. Pare a gravação e analise

#### O que verificar

- Componentes com React.memo devem ter menos re-renders
- Card, Button, TransactionItem, CategoryItem devem renderizar apenas quando props mudam

#### Componentes para testar

```javascript
// Liste os componentes otimizados
-Card -
  Button -
  TransactionItem -
  CategoryItem -
  Pagination -
  ExpenseChart -
  OptimizedDashboardExample;
```

### 3. Teste de useMemo

#### Objetivo

Verificar que cálculos pesados são memoizados.

#### Passos

1. Adicione logs temporários:

```javascript
// Em ExpenseChart.js
const chartData = useMemo(() => {
  console.log('🔄 Recalculando chartData');
  return transactions.filter(...).reduce(...);
}, [transactions]);
```

2. Execute o app e observe os logs
3. Faça ações que NÃO mudam transactions
4. Verifique que "Recalculando chartData" não aparece

#### O que esperar

- ✅ Log aparece apenas quando transactions muda
- ❌ Log NÃO aparece em outras re-renders

### 4. Teste de useCallback

#### Objetivo

Verificar que funções mantém referências estáveis.

#### Passos

1. Use React DevTools Profiler
2. Configure "Record why each component rendered"
3. Grave uma sessão
4. Analise componentes filhos que recebem callbacks

#### O que verificar

- Componentes filhos não re-renderizam apenas porque a função mudou
- Callbacks permanecem estáveis entre renders

### 5. Teste de PreloaderService

#### Objetivo

Verificar que dados são pré-carregados corretamente.

#### Passos

1. **Teste Manual**

```bash
# Limpe o cache
npm start -- --reset-cache

# Execute o app
npm run ios  # ou npm run android
```

2. **Verifique os Logs**

```javascript
// Os seguintes logs devem aparecer no console:
PreloaderService: Data preloaded in XXXms
PreloaderService: Loaded XX transactions
PreloaderService: Loaded categories
PreloaderService: Loaded X recurring transactions
PreloaderService: Loaded user preferences
```

3. **Teste com Dados**

- Faça login
- Observe o LoadingScreen "Preparando seus dados..."
- Navegue para Home/Dashboard imediatamente após
- Dados devem aparecer instantaneamente

#### O que esperar

- ✅ LoadingScreen aparece brevemente durante preload
- ✅ Dados aparecem instantaneamente nas telas
- ✅ Logs no console mostram sucesso
- ✅ Tempo de preload < 3 segundos

#### Teste de Falha

1. Desative internet
2. Faça login
3. Verifique que app não trava
4. Verifique logs de erro no console

### 6. Teste de Performance Geral

#### Métricas para Medir

##### Tempo de Inicialização

```bash
# Meça o tempo do splash screen até Home
# Antes: ~X segundos
# Depois: ~Y segundos
```

##### Uso de Memória

```bash
# Use Xcode Instruments ou Android Studio Profiler
# Navegue entre todas as telas
# Volte para Home
# Verifique memória retorna ao normal (sem memory leaks)
```

##### FPS (Frames Por Segundo)

```bash
# Use React Native Performance Monitor
# Navegue e interaja com o app
# FPS deve permanecer >= 55 em dispositivos modernos
```

##### Tempo de Resposta

```bash
# Meça tempo entre ação e feedback visual
# Deve ser < 100ms para sensação instantânea
```

### 7. Teste de Stress

#### Lista Grande de Transações

1. **Preparação**

```javascript
// Script para adicionar muitas transações (desenvolvimento)
for (let i = 0; i < 1000; i++) {
  await addTransaction({
    title: `Transação ${i}`,
    amount: Math.random() * 1000,
    type: i % 2 === 0 ? "income" : "expense",
    category: "Teste",
    date: new Date(),
  });
}
```

2. **Teste**

- Abra tela de Transactions
- Scroll pela lista
- Aplique filtros
- Mude de página

3. **O que verificar**

- ✅ Scroll suave (60 FPS)
- ✅ Filtros respondem rapidamente
- ✅ Paginação funciona bem
- ✅ Sem travamentos

### 8. Comparação Antes/Depois

#### Checklist de Métricas

| Métrica                | Antes | Depois | Melhoria |
| ---------------------- | ----- | ------ | -------- |
| Tempo de inicialização | Xs    | Ys     | Z%       |
| Uso de memória inicial | XMB   | YMB    | Z%       |
| Re-renders em scroll   | X     | Y      | Z%       |
| Tempo de preload dados | Xs    | Ys     | Z%       |
| FPS médio              | X     | Y      | Z%       |

### 9. Ferramentas Recomendadas

#### React Native

```bash
# Performance Monitor
npm install --save-dev react-native-performance-monitor

# Why Did You Render
npm install @welldone-software/why-did-you-render --save-dev
```

#### React DevTools

```bash
npm install -g react-devtools
react-devtools
```

#### Bundle Analyzer

```bash
npx react-native-bundle-visualizer
```

### 10. Testes Automatizados

#### Performance Test Script

```javascript
// __tests__/performance/preloader.test.js
import { PreloaderService } from "../../src/infrastructure/services/PreloaderService";

describe("PreloaderService Performance", () => {
  it("should preload data in less than 3 seconds", async () => {
    const startTime = Date.now();
    const result = await PreloaderService.preloadCriticalData("test-user-id");
    const duration = Date.now() - startTime;

    expect(duration).toBeLessThan(3000);
    expect(result.success).toBe(true);
  });

  it("should handle all requests in parallel", async () => {
    const result = await PreloaderService.preloadCriticalData("test-user-id");

    expect(result.results.length).toBe(4); // 4 parallel requests
    expect(result.summary.successful).toBeGreaterThan(0);
  });
});
```

#### Component Re-render Test

```javascript
// __tests__/performance/memo.test.js
import React from "react";
import { render } from "@testing-library/react-native";
import { Card } from "../../components/Card";

describe("Card Performance", () => {
  it("should not re-render with same props", () => {
    const { rerender } = render(<Card>Content</Card>);

    // Spy on render
    const renderSpy = jest.spyOn(Card.type, "render");

    // Re-render with same props
    rerender(<Card>Content</Card>);

    // Should not call render due to React.memo
    expect(renderSpy).not.toHaveBeenCalled();
  });
});
```

### 11. Relatório de Performance

#### Template

```markdown
# Relatório de Performance - [Data]

## Ambiente

- Dispositivo: [iPhone 12, Samsung S21, etc]
- OS: [iOS 15, Android 12, etc]
- Build: [Debug/Release]

## Resultados

### Tempo de Inicialização

- Antes: Xs
- Depois: Ys
- Melhoria: Z%

### Uso de Memória

- Inicial: XMB
- Navegação completa: YMB
- Após voltar Home: ZMB

### Performance de Renderização

- FPS médio: X
- Re-renders evitados: Y
- Scroll performance: Suave/Com lag

### Preload de Dados

- Tempo médio: Xms
- Taxa de sucesso: Y%
- Dados carregados: Z itens

## Observações

[Suas observações aqui]

## Recomendações

[Melhorias sugeridas]
```

### 12. Troubleshooting

#### Problema: Preload muito lento

**Diagnóstico:**

```javascript
// Adicione logs detalhados
const result = await PreloaderService.preloadCriticalData(userId);
console.log("Preload summary:", result.summary);
console.log("Preload results:", result.results);
```

**Possíveis causas:**

- Conexão lenta
- Muitos dados
- Firestore rules limitando

**Soluções:**

- Implementar timeout
- Reduzir dados iniciais
- Otimizar queries

#### Problema: React.memo não funciona

**Diagnóstico:**

```javascript
// Adicione displayName para debug
Card.displayName = "Card";

// Use whyDidYouRender
if (__DEV__) {
  const whyDidYouRender = require("@welldone-software/why-did-you-render");
  whyDidYouRender(React, {
    trackAllPureComponents: true,
  });
}
```

**Possíveis causas:**

- Props mudam a cada render
- Funções/objetos não memoizados
- Arrays/objetos recriados

**Soluções:**

- Use useCallback para funções
- Use useMemo para objetos/arrays
- Verifique props com comparação rasa

### 13. Checklist de Aprovação

- [ ] Lazy loading funciona em todas as telas
- [ ] LoadingScreen aparece e desaparece corretamente
- [ ] React.memo reduz re-renders
- [ ] useMemo evita recálculos
- [ ] useCallback mantém referências estáveis
- [ ] PreloaderService carrega dados em < 3s
- [ ] Não há memory leaks
- [ ] FPS >= 55 em navegação
- [ ] Scroll suave em listas
- [ ] App funciona offline após preload

---

**Conclusão:** Se todos os testes passarem, as otimizações foram implementadas com sucesso! 🎉
