# TechChallenge3 – Aplicativo de Gerenciamento Financeiro

<div>

[![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=3frnt-group6-tc1_Tech-Challange-4&metric=vulnerabilities)](https://sonarcloud.io/summary/new_code?id=3frnt-group6-tc1_Tech-Challange-4)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=3frnt-group6-tc1_Tech-Challange-4&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=3frnt-group6-tc1_Tech-Challange-4)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=3frnt-group6-tc1_Tech-Challange-4&metric=bugs)](https://sonarcloud.io/summary/new_code?id=3frnt-group6-tc1_Tech-Challange-4)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=3frnt-group6-tc1_Tech-Challange-4&metric=coverage)](https://sonarcloud.io/summary/new_code?id=3frnt-group6-tc1_Tech-Challange-4)
[![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=3frnt-group6-tc1_Tech-Challange-4&metric=ncloc)](https://sonarcloud.io/summary/new_code?id=3frnt-group6-tc1_Tech-Challange-4)

</div>

Aplicativo de gerenciamento financeiro desenvolvido em React Native (Expo)

---

## ✨ Principais Funcionalidades

- Autenticação de usuários via Firebase (e-mail & senha)
- Temas claro/escuro com persistência no dispositivo
- Navegação por **Stack** e **Bottom Tabs** (React Navigation)
- Componentes reutilizáveis (`Button`, `Input`, `Card`)
- Estrutura preparada para integração com Firestore/Storage
- Adição de Receitas e Subtração de Despejas

---

## 🛠️ Tecnologias & Ferramentas

| Camada        | Tecnologia                                    |
| ------------- | --------------------------------------------- |
| Linguagem     | React 19 · React Native 0.81 (Expo SDK 54)    |
| UI            | React Native Components · Expo LinearGradient |
| Navegação     | `@react-navigation/*`                         |
| Estado global | Context API (`AuthContext`, `ThemeContext`)   |
| Backend       | Firebase Authentication (Email/Password)      |
| Persistência  | AsyncStorage                                  |

---

## 📂 Estrutura de Pastas (resumida)

```
Tech-Challenge-3/
├─ assets/               # Ícones e imagens estáticas
├─ components/           # Button, Card, Input...
├─ contexts/             # AuthContext, ThemeContext
├─ screens/              # Login, Register, Home, Profile, Settings
├─ firebase.config.js    # Inicialização do Firebase
├─ App.js                # Navegação raiz + Providers
└─ README.md             # Este arquivo
```

---

## 🚀 Como Rodar Localmente

### 1. Pré-requisitos

- Node.js ≥ 18
- Expo CLI `npm install -g expo-cli`
- Conta Firebase (gratuita)

### 2. Clonar & instalar dependências

```bash
# clone
git clone https://github.com/<seu-user>/Tech-Challenge-3.git
cd Tech-Challenge-3

# instalar pacotes
npm install
```

### 3. Configurar o Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com) → **Adicionar projeto**.
2. No menu ⚙️ **Configurações do projeto** → **Suas apps** → adicione um app Web (ícone `</>`).
3. Copie o objeto `firebaseConfig` gerado.
4. Abra `firebase.config.js` e substitua o bloco:

```js
const firebaseConfig = {
  apiKey: "<API_KEY>",
  authDomain: "<PROJECT_ID>.firebaseapp.com",
  projectId: "<PROJECT_ID>",
  storageBucket: "<PROJECT_ID>.appspot.com",
  messagingSenderId: "<SENDER_ID>",
  appId: "<APP_ID>",
};
```

5. No Console Firebase → **Build → Authentication → Métodos de login** → habilite **E-mail/Senha**.
6. Ainda no Console → **Build → Firestore Database** → clique em **Criar banco de dados** e escolha o modo _Test_ (para desenvolvimento) ou _Production_ conforme sua necessidade.
7. Em **Regras** defina permissões adequadas. Para testes locais você pode manter o exemplo a seguir:

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 4. Executar o app

```bash

npx expo start
```

Use um emulador ou o aplicativo **Expo Go** no celular para escanear o QRCode.

## ☁️ Cloud Firestore

A aplicação utiliza o **Cloud Firestore** para armazenar transações, categorias e demais dados de cada usuário.

- Inicialização em `firebase.config.js` por meio de `getFirestore(app)`
- Camadas de acesso encapsuladas em `services/firestoreService.js`
- Estrutura sugerida de coleções:
  - `users/{uid}/transactions`
  - `users/{uid}/recurringTransactions`
  - `users/{uid}/settings/categories`

> As operações são ordenadas por `createdAt` para reduzir leituras e possibilitar paginação.

## 💾 Persistência Local (AsyncStorage)

Preferências leves são salvas localmente com `@react-native-async-storage/async-storage`:

| Chave                      | Contexto/Finalidade                |
| -------------------------- | ---------------------------------- |
| `theme`                    | Tema selecionado (claro ou escuro) |
| `@currency_settings_<uid>` | Moeda padrão do usuário            |

Além disso, o Firebase Auth usa `AsyncStorage` via `initializeAuth` para manter sessões após reiniciar o app.

Não há configuração extra — para limpar dados durante o desenvolvimento basta remover o app/sandbox do emulador ou executar `AsyncStorage.clear()` no console.

---

## 📜 Scripts

| Comando           | Descrição                      |
| ----------------- | ------------------------------ |
| `npm start`       | Inicia o Metro (alias Expo)    |
| `npm run android` | Abre emulador Android          |
| `npm run ios`     | Abre simulador iOS             |
| `npm run web`     | Abre versão Web (experimental) |
