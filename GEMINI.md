# Diretrizes de Desenvolvimento do Projeto

Este documento estabelece as diretrizes e melhores práticas para o desenvolvimento de software neste projeto, visando garantir consistência, qualidade, manutenibilidade e escalabilidade do código.

## 1. Estrutura e Organização do Projeto

### 1.1. Backend (`backend/`)

*   **`controllers/`**: Contém a lógica de negócios e o tratamento das requisições HTTP. Cada arquivo deve ser responsável por um recurso ou um conjunto coeso de funcionalidades.
*   **`models/`**: Define os modelos Sequelize, representando as entidades do banco de dados e suas associações. Cada modelo deve ter seu próprio arquivo.
*   **`migrations/`**: Armazena as migrações do banco de dados, que são scripts para gerenciar o esquema do banco de dados de forma versionada.
*   **`routes/`**: Define as rotas da API, mapeando URLs para funções de controlador. As rotas devem ser agrupadas por recurso.
*   **`config/`**: Contém arquivos de configuração da aplicação, como configurações de banco de dados, segurança, etc.
*   **`utils/`**: Funções utilitárias e módulos auxiliares que podem ser reutilizados em diferentes partes do backend (ex: tratamento de erros, helpers de validação).
*   **`server.js`**: O ponto de entrada principal da aplicação Express.js, responsável pela configuração do servidor, middlewares globais e inicialização.

### 1.2. Frontend (`frontend/`)

*   **`src/`**: Contém o código-fonte principal da aplicação React.
    *   **`components/`**: Componentes React reutilizáveis e genéricos.
    *   **`pages/` ou `views/`**: Componentes que representam páginas ou telas completas da aplicação.
    *   **`assets/`**: Imagens, ícones, fontes e outros arquivos estáticos.
    *   **`styles/`**: Arquivos de estilo (CSS, SCSS, Tailwind CSS).
    *   **`services/`**: Funções para interação com a API backend.
    *   **`hooks/`**: Custom React Hooks.
    *   **`context/` ou `redux/`**: Gerenciamento de estado global.
*   **`public/`**: Contém arquivos estáticos que são servidos diretamente, como `index.html` e o manifesto da aplicação.

### 1.3. Nível Raiz do Projeto

*   **`docker-compose.yml`**: Define e executa aplicações Docker multi-container.
*   **`Dockerfile.backend`**: Dockerfile para construir a imagem do serviço backend.
*   **`Dockerfile.frontend`**: Dockerfile para construir a imagem do serviço frontend.
*   **`.env.example`**: Exemplo de arquivo de variáveis de ambiente.
*   **`README.md`**: Documentação geral do projeto, instruções de setup e execução.
*   **`.gitignore`**: Arquivo para ignorar arquivos e diretórios no controle de versão Git.

## 2. Padrões e Estilo de Codificação

### 2.1. JavaScript (Geral)

*   **Nomenclatura:**
    *   Variáveis, funções e propriedades de objetos: `camelCase` (ex: `userName`, `getUserData`).
    *   Classes e componentes React: `PascalCase` (ex: `Product`, `StockController`, `UserProfile`).
    *   Constantes globais: `UPPER_SNAKE_CASE` (ex: `API_BASE_URL`).
    *   Colunas do banco de dados e chaves estrangeiras: `snake_case` (ex: `user_id`, `created_at`).
*   **Declaração de Variáveis:** Preferir `const` por padrão. Usar `let` apenas quando o valor da variável precisar ser reatribuído. Evitar `var`.
*   **Funções:** Usar arrow functions (`=>`) para sintaxe concisa e para manter o contexto `this` em classes.
*   **Módulos:** Usar `require()` e `module.exports` para o backend (CommonJS) e `import`/`export` para o frontend (ES Modules).
*   **Comentários:** Usar comentários com moderação. Eles devem explicar o *porquê* de uma decisão de design ou de uma lógica complexa, e não o *quê* o código faz (o código deve ser autoexplicativo).

### 2.2. Sequelize (Backend)

*   **Definição de Modelos:**
    *   Cada modelo deve ser definido em seu próprio arquivo dentro de `backend/models/`.
    *   Usar `DataTypes.UUID` com `defaultValue: DataTypes.UUIDV4` para chaves primárias.
    *   Definir associações no método estático `associate` de cada modelo.
    *   Incluir regras de validação (`validate` property) dentro da definição do modelo para garantir a integridade dos dados.
*   **Configuração de Modelos:**
    *   Definir `tableName` explicitamente para o nome da tabela no plural e em `snake_case` (ex: `tableName: 'products'`).
    *   Configurar `timestamps: true` para que o Sequelize gerencie automaticamente as colunas `createdAt` e `updatedAt`.
    *   **Consistência:** Garantir que `underscored: true` seja configurado globalmente ou em cada modelo para que o Sequelize mapeie automaticamente `camelCase` para `snake_case` nas colunas do banco de dados. (Atualmente, `backend/models/index.js` define `underscored: false`, o que é inconsistente com o uso de `snake_case` nas migrações e modelos. Recomenda-se alterar para `underscored: true` para maior consistência).

### 2.3. Migrações (Backend)

*   **Estrutura:** Cada migração deve ter um método `up` (para aplicar as mudanças) e um método `down` (para reverter as mudanças).
*   **Assincronicidade:** Usar `async/await` para todas as operações de banco de dados.
*   **Nomenclatura de Colunas:** Seguir o padrão `snake_case` para nomes de colunas.
*   **Chaves Estrangeiras:** Definir chaves estrangeiras com `references`, `onUpdate: 'CASCADE'` e `onDelete` apropriado (`'CASCADE'`, `'SET NULL'`, `'RESTRICT'`).
*   **Timestamps:** Incluir `createdAt` e `updatedAt` do tipo `Sequelize.DATE` com `allowNull: false` nas tabelas que usarão timestamps do Sequelize.

### 2.4. Frontend (React)

*   **Componentes:**
    *   Manter componentes pequenos e focados em uma única responsabilidade.
    *   Usar componentes funcionais com Hooks.
    *   Props devem ser claras e bem definidas.
*   **Estado:** Gerenciar o estado de forma eficiente, usando `useState`, `useReducer` ou bibliotecas de gerenciamento de estado (ex: Redux, Context API) para estado global.
*   **Estilização:** Utilizar Tailwind CSS para estilização, seguindo as convenções do projeto.

## 3. Qualidade de Código e Padronização

### 3.1. Linting e Formatação

*   **ESLint:** Usar ESLint para identificar e reportar padrões problemáticos no código JavaScript/TypeScript. As regras devem ser consistentes em todo o projeto.
*   **Prettier:** Usar Prettier para formatar automaticamente o código, garantindo um estilo consistente e eliminando discussões sobre formatação.
*   **Integração:** Configurar ESLint e Prettier para rodarem automaticamente em pre-commit hooks ou como parte do pipeline de CI/CD.

### 3.2. Tratamento de Erros

*   **Centralização:** Implementar um middleware de tratamento de erros centralizado no backend (`server.js`) para capturar e responder a erros de forma consistente.
*   **Classes de Erro Customizadas:** Utilizar classes de erro customizadas (ex: `BaseError` e suas extensões) para categorizar e lidar com diferentes tipos de erros de forma programática.
*   **Mensagens de Erro:** Fornecer mensagens de erro claras e úteis para o cliente, evitando expor detalhes internos do servidor em produção.
*   **Logging:** Registrar erros no servidor para depuração e monitoramento.

### 3.3. Configuração

*   **Variáveis de Ambiente:** Todas as configurações sensíveis (chaves de API, credenciais de banco de dados) e variáveis que mudam entre ambientes (desenvolvimento, produção) devem ser armazenadas em variáveis de ambiente (arquivos `.env`).
*   **Acesso:** Acessar variáveis de ambiente via `process.env`.

## 4. Interação com o Banco de Dados

*   **ORM:** Utilizar Sequelize como Object-Relational Mapper (ORM) para todas as interações com o banco de dados.
*   **Consultas SQL Brutas:** Evitar o uso de consultas SQL brutas. Se for absolutamente necessário, garantir que as consultas sejam parametrizadas e sanitizadas para prevenir ataques de injeção de SQL.
*   **Transações:** Usar transações Sequelize para operações que envolvem múltiplas modificações no banco de dados, garantindo atomicidade.

## 5. Design da API (Backend)

*   **Princípios RESTful:** Projetar a API seguindo os princípios RESTful, utilizando verbos HTTP (GET, POST, PUT, DELETE) e URLs baseadas em recursos.
*   **Nomenclatura de Endpoints:** Usar substantivos no plural para os recursos (ex: `/api/products`, `/api/users`).
*   **Códigos de Status HTTP:** Retornar códigos de status HTTP apropriados para cada resposta (ex: 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 404 Not Found, 500 Internal Server Error).
*   **Validação de Entrada:** Validar todos os dados de entrada do cliente para garantir a segurança e a integridade dos dados.

## 6. Limpeza e Manutenibilidade

*   **Modularidade:** Dividir o código em módulos pequenos e coesos, cada um com uma responsabilidade clara.
*   **Reusabilidade:** Identificar e extrair lógica comum em funções ou módulos reutilizáveis.
*   **Nomes Significativos:** Usar nomes de variáveis, funções e classes que sejam descritivos e reflitam seu propósito.
*   **Remoção de Código Morto:** Remover código não utilizado ou comentado que não é mais relevante.
*   **Refatoração:** Realizar refatorações regulares para melhorar a estrutura e a legibilidade do código sem alterar seu comportamento externo.

## 7. Testes

*   **Testes Unitários:** Escrever testes unitários para funções e módulos individuais para verificar seu comportamento isoladamente.
*   **Testes de Integração:** Escrever testes de integração para verificar a interação entre diferentes módulos e componentes (ex: controladores com modelos, serviços com APIs externas).
*   **Testes de Ponta a Ponta (E2E):** (Se aplicável) Escrever testes E2E para simular o fluxo do usuário na aplicação completa.
*   **Cobertura de Testes:** Buscar uma boa cobertura de testes para as partes críticas da aplicação.

## 8. Documentação

*   **README.md:** Manter o `README.md` atualizado com instruções claras sobre como configurar, executar e testar o projeto.
*   **Documentação da API:** Utilizar ferramentas como Swagger/OpenAPI para documentar os endpoints da API, facilitando o consumo por outros desenvolvedores.
*   **Comentários no Código:** Usar comentários para explicar lógicas complexas, decisões de design não óbvias ou seções de código que podem ser confusas.

## 9. Segurança

*   **Validação de Entrada:** Validar e sanitizar todas as entradas do usuário para prevenir ataques como XSS, SQL Injection, etc.
*   **Autenticação e Autorização:** Implementar mecanismos robustos de autenticação (ex: JWT) e autorização baseados em papéis.
*   **Proteção contra Força Bruta:** Usar rate limiting para proteger endpoints de login e outras rotas sensíveis.
*   **Segurança de Dados:** Proteger dados sensíveis (senhas, informações pessoais) usando criptografia e armazenamento seguro.
*   **Dependências:** Manter as dependências atualizadas para evitar vulnerabilidades conhecidas.

## 10. Performance

*   **Otimização de Consultas:** Otimizar consultas ao banco de dados, usando índices apropriados e evitando N+1 queries.
*   **Cache:** Implementar cache para dados frequentemente acessados.
*   **Otimização de Imagens:** Otimizar imagens para a web no frontend.
*   **Carregamento Lazy:** Implementar carregamento lazy para componentes e rotas no frontend.

---

**Observações do Gemini:**

*   **Fase 9 - Componentes Compartilhados:** A identificação programática de componentes duplicados é complexa e pode exigir revisão manual.
*   **Fase 10 - Qualidade:** A execução direta de ESLint/Prettier ou verificações de tipo pode ser limitada pelas ferramentas disponíveis no ambiente do agente.
*   **Fase 11 - Teste de Fumaça:** A execução de testes de fumaça que exigem um ambiente de navegador ou conhecimento específico de frameworks de teste não é suportada diretamente pelo agente.
