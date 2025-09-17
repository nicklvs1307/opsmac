# Plano de Refatoração: Integração de Pesquisa de Satisfação com Cupons de Recompensa

## 1. Objetivo

O objetivo desta refatoração é integrar o sistema de **Pesquisa de Satisfação** com o de **Cupons**. Ao final do fluxo, um cliente que responder a uma pesquisa de satisfação receberá um cupom como forma de agradecimento e incentivo, unificando os submódulos "Satisfação" e "Cupons" dentro do módulo de "Fidelidade".

---

## 2. Análise do Backend

A análise se concentrará em entender a estrutura de dados e a lógica de negócios existente para pesquisas e cupons.

### 2.1. Modelos de Dados (Sequelize)

Vou inspecionar os seguintes modelos em `backend/models/` para entender os relacionamentos:
- `Survey.js`: Define a estrutura da pesquisa (perguntas, etc).
- `SurveyResponse.js`: Armazena as respostas de um cliente a uma pesquisa.
- `Coupon.js`: Define a estrutura de um cupom (código, desconto, validade).
- `Customer.js`: Representa o cliente que responde a pesquisa e recebe o cupom.
- `Reward.js`: Parece ser um modelo genérico para recompensas, que pode ser a ponte entre a pesquisa e o cupom.

**Hipótese:** O modelo `Survey` precisará de uma associação com `Reward` (ex: `rewardId`) para definir qual recompensa será dada.

### 2.2. Lógica de Negócios (Serviços e Rotas)

Vou investigar os seguintes diretórios para encontrar a lógica de processamento:
- `backend/src/domains/surveys/`: Provável local dos serviços e rotas para gerenciar pesquisas e respostas.
- `backend/src/domains/coupons/`: Local dos serviços para gerar e gerenciar cupons.
- `backend/routes/index.js`: Para ter uma visão geral de como as rotas estão estruturadas.

**Objetivo:** Identificar o serviço exato que processa o `POST` de uma nova `SurveyResponse`. É neste ponto que a lógica de criação do cupom será adicionada.

---

## 3. Análise do Frontend

A análise focará em mapear o fluxo do usuário e identificar os componentes React envolvidos.

### 3.1. Fluxo do Usuário

1.  O usuário acessa a pesquisa (provavelmente através de um link ou QR code).
2.  Preenche o formulário da pesquisa.
3.  Envia o formulário.
4.  Vê uma mensagem de "Obrigado".

**Objetivo:** Modificar o passo 4 para exibir o cupom ganho.

### 3.2. Componentes React

Vou investigar os seguintes diretórios em `frontend/src/`:
- `features/surveys/` ou `features/feedback/`: Provável local dos componentes da pesquisa (`SurveyForm`, `SurveyPage`).
- `features/coupons/`: Local dos componentes que já exibem cupons (`CouponCard`, `MyCouponsList`), para reutilização de UI.
- `services/` ou `api/`: Local dos clientes de API que fazem as chamadas para o backend.

**Objetivo:** Identificar o componente que gerencia o estado do formulário e a função que dispara o envio dos dados para a API.

---

## 4. Estratégia de Implementação

### 4.1. Backend

1.  **Alterar Modelo:** Adicionar uma chave estrangeira `rewardId` ao modelo `Survey.js` para associá-lo a uma recompensa.
2.  **Atualizar Serviço de Resposta:** No serviço que salva a `SurveyResponse`, adicionar os seguintes passos:
    a. Após salvar a resposta, carregar a `Survey` associada, incluindo o `Reward`.
    b. Se a pesquisa tiver uma recompensa, chamar o `CouponService` para gerar um novo cupom para o `customerId`.
    c. O `CouponService` provavelmente precisará de informações do `Reward` (ex: tipo de desconto, valor).
3.  **Atualizar Rota da API:** A rota `POST /survey-responses` (ou similar) deverá retornar os detalhes do cupom recém-criado no corpo da resposta JSON.

### 4.2. Frontend

1.  **Atualizar Serviço da API:** A função no frontend que chama a API para submeter a pesquisa deve ser atualizada para processar os dados do cupom que virão na resposta.
2.  **Gerenciar Estado:** O componente principal da pesquisa (ex: `SurveyPage`) irá gerenciar um novo estado, como `generatedCoupon`.
3.  **Exibir Cupom:**
    a. Após a submissão bem-sucedida, o estado `generatedCoupon` será preenchido com os dados retornados pela API.
    b. Em vez de uma simples mensagem de "Obrigado", será renderizado um componente (possivelmente um modal) que exibirá os detalhes do cupom (`CouponCard`), parabenizando o usuário pela recompensa.

---

## 5. Plano de Execução Passo a Passo

1.  **[FEITO]** Criar este arquivo `plano.md`.
2.  **[A FAZER]** **Análise Backend:** Ler os arquivos dos modelos e serviços identificados para confirmar as hipóteses.
3.  **[A FAZER]** **Implementação Backend:**
    - Modificar `backend/models/Survey.js`.
    - Modificar o serviço de `SurveyResponse` em `backend/src/domains/`.
4.  **[A FAZER]** **Análise Frontend:** Ler os arquivos dos componentes e serviços identificados.
5.  **[A FAZER]** **Implementação Frontend:**
    - Modificar o serviço de API em `frontend/src/services/`.
    - Modificar o componente de formulário/página da pesquisa em `frontend/src/features/`.
6.  **[A FAZER]** **Validação:** Realizar um teste de ponta-a-ponta para garantir que o fluxo está funcionando como esperado.