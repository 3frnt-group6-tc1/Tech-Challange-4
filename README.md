# 💰 Tech Challenge 4 - Aplicativo de Gerenciamento Financeiro

<div align="center">

[![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=3frnt-group6-tc1_Tech-Challange-4&metric=vulnerabilities)](https://sonarcloud.io/summary/new_code?id=3frnt-group6-tc1_Tech-Challange-4)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=3frnt-group6-tc1_Tech-Challange-4&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=3frnt-group6-tc1_Tech-Challange-4)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=3frnt-group6-tc1_Tech-Challange-4&metric=bugs)](https://sonarcloud.io/summary/new_code?id=3frnt-group6-tc1_Tech-Challange-4)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=3frnt-group6-tc1_Tech-Challange-4&metric=coverage)](https://sonarcloud.io/summary/new_code?id=3frnt-group6-tc1_Tech-Challange-4)
[![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=3frnt-group6-tc1_Tech-Challange-4&metric=ncloc)](https://sonarcloud.io/summary/new_code?id=3frnt-group6-tc1_Tech-Challange-4)

**Aplicativo mobile de gerenciamento financeiro pessoal desenvolvido em React Native (Expo)**

</div>

---

## 📋 Sumário

- [Visão Geral](#-visão-geral)
- [Arquitetura](#-arquitetura)
- [Tecnologias](#-tecnologias)
- [Funcionalidades](#-funcionalidades)
- [Instalação](#-instalação)
- [Configuração](#-configuração)
- [Estrutura de Pastas](#-estrutura-de-pastas)
- [Padrões e Boas Práticas](#-padrões-e-boas-práticas)
- [Segurança](#-segurança)
- [Performance](#-performance)
- [Testes](#-testes)
- [Roadmap](#-roadmap)

---

## 🎯 Visão Geral

O Tech Challenge 4 é uma evolução do aplicativo de gerenciamento financeiro, implementando melhorias arquiteturais significativas, otimizações de performance e recursos avançados de segurança.

### Objetivos do Projeto

- ✅ Implementar **Clean Architecture** com separação clara de camadas
- ✅ Gerenciamento de estado avançado com **Context API + React Query**
- ✅ **Lazy Loading** e otimizações de renderização
- ✅ Sistema de **cache inteligente** para dados offline
- ✅ Interface **reativa em tempo real** com Firebase
- ✅ **Criptografia AES-256** para dados sensíveis
- ✅ Validações robustas e segurança aprimorada

---

## 🏗️ Arquitetura

O projeto segue os princípios da **Clean Architecture**, organizando o código em camadas bem definidas:

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│  (Screens, Components, Hooks, Contexts de UI)               │
├─────────────────────────────────────────────────────────────┤
│                      DOMAIN LAYER                            │
│  (Entities, Use Cases, Repositories Interfaces, Contexts)   │
├─────────────────────────────────────────────────────────────┤
│                   INFRASTRUCTURE LAYER                       │
│  (Services, Repository Implementations, Config)             │
└─────────────────────────────────────────────────────────────┘
```

### Camadas

| Camada | Responsabilidade |
|--------|-----------------|
| **Domain** | Regras de negócio, entidades, interfaces e casos de uso |
| **Infrastructure** | Implementações concretas, serviços externos, Firebase |
| **Presentation** | UI, componentes, hooks, navegação |

---

## 🛠️ Tecnologias

### Core

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| React Native | 0.81 | Framework mobile |
| Expo | SDK 54 | Desenvolvimento e build |
| React | 19 | Biblioteca UI |

### Gerenciamento de Estado

| Tecnologia | Uso |
|------------|-----|
| Context API | Estado global (Auth, Theme, Currency, Transactions) |
| React Query | Cache, mutations, sincronização de dados |
| Reducers | Estado complexo com dispatch de ações |

### Backend & Dados

| Tecnologia | Uso |
|------------|-----|
| Firebase Auth | Autenticação de usuários |
| Cloud Firestore | Banco de dados em tempo real |
| AsyncStorage | Persistência local |
| Expo SecureStore | Armazenamento seguro de chaves |

### Segurança

| Tecnologia | Uso |
|------------|-----|
| CryptoJS | Criptografia AES-256-CBC |
| Expo Crypto | Geração segura de chaves |
| Expo LocalAuthentication | Biometria (Face ID/Touch ID) |

### Navegação

| Tecnologia | Uso |
|------------|-----|
| React Navigation | Navegação Stack e Tabs |
| Lazy Loading | Carregamento sob demanda de telas |

---

## ✨ Funcionalidades

### 💳 Gerenciamento de Transações
- Adicionar receitas e despesas
- Editar e excluir transações
- Filtros por tipo, categoria, data
- Busca com debounce
- Transações recorrentes

### 📊 Dashboard e Relatórios
- Visão geral do saldo
- Gráficos de gastos por categoria
- Exportação de relatórios (PDF/CSV)
- Análise de tendências

### 🔐 Segurança
- Login com email/senha
- Autenticação biométrica
- Criptografia de dados sensíveis
- Persistência segura de sessão

### 🎨 Personalização
- Tema claro/escuro
- Múltiplas moedas
- Categorias personalizáveis
- Preferências por usuário

### 🔄 Tempo Real
- Atualizações instantâneas via Firebase
- Sincronização automática
- Notificações de mudanças
- Modo offline com cache

---

## 🚀 Instalação

### Pré-requisitos

- Node.js ≥ 18
- npm ou yarn
- Expo CLI (`npm install -g expo-cli`)
- Conta Firebase

### Passos

```bash
# 1. Clone o repositório
git clone https://github.com/3frnt-group6-tc1/Tech-Challange-4.git
cd Tech-Challange-4

# 2. Instale as dependências
npm install

# 3. Configure o Firebase (veja seção Configuração)

# 4. Inicie o projeto
npx expo start
```

---

## ⚙️ Configuração

### Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com)
2. Crie um novo projeto
3. Adicione um app Web
4. Copie as credenciais para `firebase.config.js`:

```javascript
const firebaseConfig = {
  apiKey: "<API_KEY>",
  authDomain: "<PROJECT_ID>.firebaseapp.com",
  projectId: "<PROJECT_ID>",
  storageBucket: "<PROJECT_ID>.appspot.com",
  messagingSenderId: "<SENDER_ID>",
  appId: "<APP_ID>",
};
```

5. Habilite **Authentication** → **Email/Password**
6. Configure **Firestore Database** com as regras:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## 📁 Estrutura de Pastas

```
src/
├── domain/                    # Camada de Domínio
│   ├── contexts/              # Contextos globais (Auth, Theme, Transactions)
│   ├── entities/              # Entidades de negócio
│   │   ├── Transaction.js
│   │   ├── User.js
│   │   └── Category.js
│   ├── repositories/          # Interfaces de repositórios
│   ├── services/              # Serviços de domínio (validação, formatação)
│   ├── usecases/              # Casos de uso
│   │   ├── CreateTransactionUseCase.js
│   │   ├── GetTransactionsUseCase.js
│   │   ├── GetBalanceUseCase.js
│   │   └── ...
│   └── utils/                 # Utilitários de domínio
│
├── infrastructure/            # Camada de Infraestrutura
│   ├── config/                # Configurações
│   │   └── queryClient.js     # React Query config
│   ├── repositories/          # Implementações de repositórios
│   │   └── firestore-transaction-repository.js
│   └── services/              # Serviços externos
│       ├── BiometricService.js
│       ├── CacheService.js
│       ├── EncryptionService.js
│       ├── firestoreService.js
│       ├── PreloaderService.js
│       └── SecureStorageService.js
│
└── presentation/              # Camada de Apresentação
    ├── components/            # Componentes reutilizáveis
    │   ├── atoms/             # Componentes atômicos (Button, Input, Card)
    │   ├── molecules/         # Componentes moleculares (Forms, Lists)
    │   └── legacy/            # Componentes legados
    ├── hooks/                 # Hooks customizados
    │   ├── useTransactionsQuery.js  # React Query hooks
    │   ├── useRealtimeTransactions.js
    │   ├── useDebouncedSearch.js
    │   ├── useAppState.js
    │   └── ...
    ├── screens/               # Telas da aplicação
    │   ├── HomeScreen.js
    │   ├── DashboardScreen.js
    │   ├── TransactionsScreen.js
    │   └── ...
    └── styles/                # Estilos compartilhados
```

---

## 📐 Padrões e Boas Práticas

### Nomenclatura

| Tipo | Convenção | Exemplo |
|------|-----------|---------|
| Componentes | PascalCase | `TransactionCard` |
| Hooks | camelCase com `use` | `useTransactions` |
| Constantes | UPPER_SNAKE_CASE | `API_BASE_URL` |
| Arquivos | kebab-case ou PascalCase | `transaction-service.js` |

### Componentização (Atomic Design)

```
Atoms → Molecules → Organisms → Templates → Pages
```

- **Atoms**: Button, Input, Card, Text, Loading
- **Molecules**: TransactionForm, FilterGroup, SectionHeader
- **Organisms**: TransactionList, Dashboard
- **Templates**: ScreenLayout, AuthLayout
- **Pages**: HomeScreen, DashboardScreen

### Princípios SOLID

- **S**ingle Responsibility: Cada componente/classe tem uma responsabilidade
- **O**pen/Closed: Extensível via props e composition
- **L**iskov Substitution: Subcomponentes substituíveis
- **I**nterface Segregation: Interfaces específicas por uso
- **D**ependency Inversion: Dependências abstraídas via interfaces

---

## 🔒 Segurança

### Criptografia de Dados

O aplicativo utiliza **AES-256-CBC** para criptografar dados sensíveis:

```javascript
// Dados criptografados antes de salvar no Firebase:
- Valores de transações (amount)
- Descrições (description)
- Títulos (title)

// Armazenamento seguro:
- Chaves de criptografia → Expo SecureStore
- Tokens de autenticação → Expo SecureStore
- Credenciais biométricas → Keychain/Keystore nativo
```

### Fluxo de Criptografia

```
┌──────────────────┐     ┌───────────────────┐     ┌─────────────┐
│ Dados originais  │ --> │EncryptionService  │ --> │  Firebase   │
│ (usuário digita) │     │ (AES-256-CBC)     │     │ (encrypted) │
└──────────────────┘     └───────────────────┘     └─────────────┘
                                  │
                         ┌────────┴────────┐
                         │  SecureStore    │
                         │ (chave segura)  │
                         └─────────────────┘
```

---

## ⚡ Performance

### Otimizações Implementadas

| Técnica | Implementação |
|---------|---------------|
| **Lazy Loading** | Telas carregadas sob demanda com `React.lazy` |
| **React.memo** | Componentes memorizados para evitar re-renders |
| **useMemo/useCallback** | Cálculos e callbacks otimizados |
| **React Query** | Cache inteligente com staleTime/gcTime |
| **Debounce** | Inputs de busca com delay configurável |
| **Preloading** | Dados críticos pré-carregados na splash |

### Estratégia de Cache

```javascript
// React Query Config
staleTime: 5 * 60 * 1000,  // 5 minutos
gcTime: 10 * 60 * 1000,    // 10 minutos

// Cache por tipo de dado:
- Transações: 2 minutos
- Categorias: 30 minutos
- Configurações: 1 hora
```

---

## 🧪 Testes

```bash
# Executar testes
npm test

# Testes com watch mode
npm run test:watch

# Gerar cobertura
npm run test:coverage
```

---

## 📜 Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm start` | Inicia o Expo |
| `npm run android` | Abre no emulador Android |
| `npm run ios` | Abre no simulador iOS |
| `npm run web` | Abre versão web |
| `npm test` | Executa testes |
| `npm run test:coverage` | Gera relatório de cobertura |

---

## 👥 Equipe

Desenvolvido pelo **Grupo 6** - FIAP Pós-Tech

---

## 📄 Licença

Este projeto é privado e destinado exclusivamente para fins acadêmicos.
