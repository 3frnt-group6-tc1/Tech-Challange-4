O Tech Challenge da Fase 4 exige a evolução da sua aplicação React Native de gerenciamento financeiro, focando em aprimoramentos de arquitetura, performance e segurança.

Com base nos requisitos e nos conceitos avançados explorados nos materiais, apresentamos exemplos detalhados do que pode ser feito em cada área para evoluir a sua aplicação React Native.

---

## 1. Refatoração e Melhoria da Arquitetura

O objetivo é transformar o código para ser mais **escalável, modular, testável e fácil de manter**, aplicando os princípios da **Clean Architecture**.

### Aplicar padrões de arquitetura modular e Clean Architecture

A refatoração deve focar na separação clara entre as camadas de **Apresentação**, **Domínio** (Regras de Negócio e Casos de Uso) e **Infraestrutura** (Implementações de API e Banco de Dados).

| Requisito                         | Exemplos práticos (React Native)                                                                                                                                                                                                                                                                                                                                                                                            | Referências |
| :-------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------- |
| **Separação de Camadas**          | **1. Camada de Domínio (Entidades e Use Cases):** Criar classes puras (sem dependência de React Native) para representar as regras de negócio centrais, como a entidade `FinancialEntry` (entrada financeira). Implementar _Use Cases_ (Casos de Uso) para as funcionalidades principais (ex: `CreateEntryUseCase`, `GetBalanceUseCase`). Esses casos de uso devem orquestrar as regras e serem o **coração** da aplicação. |             |
| **Inversão de Dependência (DIP)** | **2. Abstração de Dados:** Definir **Interfaces** (contratos/abstrações) para acesso a dados (e.g., `FinancialEntryRepository`) dentro da camada de **Domínio**. A camada de Use Cases dependerá apenas dessa interface, e não da implementação concreta.                                                                                                                                                                   |             |
| **Implementação de Repositórios** | **3. Camada de Infraestrutura (Adapters):** Implementar a classe concreta (ex: `FinancialEntryRepositoryImpl`) que utiliza ferramentas de terceiros (como Axios para APIs REST ou bibliotecas de armazenamento local) para satisfazer a interface definida no Domínio.                                                                                                                                                      |             |
| **Modularização**                 | **4. Organização por Features:** Estruturar o projeto em módulos por funcionalidade (e.g., `/src/features/transactions`, `/src/features/reports`), e não por tipo de arquivo (como `/src/controllers` genérico), promovendo a organização e a adesão ao Princípio da Responsabilidade Única (SRP).                                                                                                                          |             |

### Implementar State Management Patterns avançados

Para otimizar o gerenciamento de estado em um aplicativo de médio a grande porte, é necessário migrar de soluções simples (como `useState`) para padrões que garantam a **previsibilidade** e **rastreabilidade** do estado global.

| Requisito                          | Exemplos práticos (React Native)                                                                                                                                                                                                                                                                                                  | Referências |
| :--------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------- |
| **Gerenciamento de Estado Global** | **5. Adoção de um Padrão Flux/Redux:** Implementar uma biblioteca como **Redux, MobX, Recoil ou Zustand**. Por exemplo, usar **Zustand** para criar _stores_ minimalistas ou **Redux** para centralizar o estado de entradas e balanço, garantindo que o estado só possa ser alterado por meio de ações claras (previsibilidade). |             |
| **Comunicação Reativa de Estado**  | **6. Uso de Padrões Reativos:** Integrar o gerenciamento de estado com padrões reativos (se não for nativamente reativo como MobX). Por exemplo, se usar Redux, pode-se integrar o RxJS por meio de bibliotecas como `redux-observable` para tratar efeitos colaterais e fluxos assíncronos de forma declarativa.                 |             |

---

## 2. Performance e Otimização

A otimização de performance visa melhorar o tempo de resposta, a fluidez da interface e a eficiência no consumo de recursos.

### Melhorar tempo de carregamento (Lazy Loading) e otimizar requisições (Cache)

| Requisito                         | Exemplos práticos (React Native)                                                                                                                                                                                                                                                                                                    | Referências |
| :-------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------- |
| **Lazy Loading e Code Splitting** | **7. Carregamento sob Demanda de Módulos:** Utilizar técnicas de **Code Splitting** no React Native para dividir o código e carregar módulos de telas menos acessadas (como relatórios anuais ou configurações avançadas) somente quando o usuário interage com a rota (`Lazy Loading`).                                            |             |
| **Otimização de Imagens**         | **8. Otimização e Cache de Imagens:** Garantir que imagens (como ícones de categorias ou avatares de usuário) estejam otimizadas (e.g., compressão, formato WebP). Implementar cache de imagens usando bibliotecas mobile específicas (e.g., `react-native-fast-image`) para que não precisem ser baixadas novamente a cada acesso. |             |
| **Armazenamento em Cache**        | **9. Cache de Dados de API:** Implementar um mecanismo de **cache para respostas de API** para dados estáticos ou pouco alterados (como a lista de categorias financeiras). Isso evita requisições HTTP repetitivas e melhora a experiência em visitas subsequentes.                                                                |             |
| **Renderização Otimizada**        | **10. Otimização de Listas Grandes:** Utilizar componentes de lista de alta performance (como `FlatList` ou `VirtualizedList` no React Native, de forma otimizada) para renderizar apenas os itens visíveis na tela, evitando a sobrecarga de renderização (`ListView.builder` conceito).                                           |             |

### Utilizar técnicas de Programação Reativa

| Requisito                        | Exemplos práticos (React Native)                                                                                                                                                                                                                                                                                      | Referências |
| :------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------- |
| **Programação Reativa (RxJS)**   | **11. Controle de Fluxo de Dados:** Aplicar conceitos do RxJS para lidar com interações do usuário. Por exemplo, em uma tela de pesquisa de transações, utilizar o operador `debounceTime` para esperar que o usuário termine de digitar antes de disparar a busca na API, evitando chamadas excessivas e sobrecarga. |             |
| **Gerenciamento de Requisições** | **12. Evitar Condições de Corrida:** Usar operadores de alto nível, como `switchMap`, para cancelar requisições de rede obsoletas (por exemplo, se o usuário digita rapidamente em um campo de busca).                                                                                                                |             |

---

## 3. Segurança no Desenvolvimento

A segurança deve ser implementada em todos os pontos críticos da aplicação, seguindo os princípios de codificação segura e protegendo o tripé CIA (Confidencialidade, Integridade e Disponibilidade).

### Implementar autenticação segura e criptografia de dados sensíveis

| Requisito                           | Exemplos práticos (React Native)                                                                                                                                                                                                                                                                                                | Referências |
| :---------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :---------- |
| **Criptografia em Trânsito (APIs)** | **13. Garantir HTTPS/TLS:** Assegurar que todas as comunicações com o back-end e APIs sejam feitas exclusivamente via **HTTPS** (TLS), criptografando os dados em trânsito (incluindo credenciais).                                                                                                                             |             |
| **Proteção de Credenciais**         | **14. Hashing no Servidor:** O sistema de autenticação (back-end) deve armazenar senhas usando algoritmos de **hashing robustos** como **bcrypt** ou **Argon2** (nunca MD5 ou SHA-1). O processo deve incluir **Salting** para evitar ataques de _rainbow table_.                                                               |             |
| **Autenticação Multifator (MFA)**   | **15. Implementação de MFA:** Adicionar uma camada de **Autenticação Multifator** para contas de usuário. Isso pode ser implementado exigindo um código OTP (One-Time Password) gerado por um aplicativo autenticador, além da senha, para login.                                                                               |             |
| **Gerenciamento de Sessão/Tokens**  | **16. Tokens Seguros:** Utilizar tokens de autenticação (como JWTs) de curta duração (`Access Tokens`) e garantir que eles expirem rapidamente. Se necessário, implementar `Refresh Tokens` armazenados de forma segura (por exemplo, em armazenamento seguro nativo do dispositivo, e não em `LocalStorage` vulnerável a XSS). |             |
| **Segurança de Dependências**       | **17. Verificação de Vulnerabilidades:** Utilizar ferramentas de análise de código e dependências (como OWASP Dependency-Check ou Snyk) no pipeline de CI/CD para monitorar e manter as bibliotecas de React Native atualizadas, prevenindo vulnerabilidades em componentes de terceiros.                                       |             |
| **Validação de Entrada de Dados**   | **18. Sanitização no Frontend:** Aplicar sanitização (escapar) em todas as entradas de dados do usuário antes de renderizá-las na tela (no React Native) ou enviá-las ao servidor, prevenindo ataques de **Cross-Site Scripting (XSS)** e garantindo a integridade dos dados.                                                   |             |

- sonarqube
- synk
  -escapar formularios

Código Seguro: para evitar ataques XSS, é necessário "escapar" as entradas
do usuário antes de exibi-las.

<div>Bem-vindo, <%= escape(req.query.name) %>!</div>

- bycript para senha
  const bcrypt = require('bcrypt');
  const saltRounds = 10;
  const password = 'senhaSegura';
  // Gerar o hash da senha
  bcrypt.hash(password, saltRounds, function(err, hash)
  {
  if (err) throw err;
  console.log(`Hash gerado: ${hash}`);
  });
  // Verificar a senha
  bcrypt.compare(password, hash, function(err, result)
  {
  if (result) {
  console.log('Senha correta.');
  }
  else {
  console.log('Senha incorreta.');
  }
  });

- - Hash com SHA-256 (TypeScript/Node.js) Fonte: elaborado pelo autor (2024

import \* as crypto from 'crypto';
function gerarHash(mensagem: string): string {
return crypto.createHash('sha256').update(mensagem).digest('hex');
}
const mensagem: string = "Dados confidenciais";
const hashMensagem: string = gerarHash(mensagem);
console.log("Mensagem original:", mensagem);
console.log("Hash gerado:", hashMensagem);

- seesao (web)

Código Seguro:
Para garantir a segurança das sessões, o cookie deve ser protegido com a flag
httpOnly e ser transmitido apenas por HTTPS.
app.use(session({
secret: 'segredo_forte',
cookie: { secure: true, httpOnly: true, maxAge: 60000 },
resave: false,
saveUninitialized: false
}));
Código-font
