# Documentação das Pastas de Features (frontend/src/features)

Este documento detalha a provável finalidade e conteúdo de cada pasta dentro do diretório `frontend/src/features/`. Cada pasta representa uma funcionalidade ou módulo específico da aplicação.

---

## Admin
**Propósito:** Provavelmente contém funcionalidades e componentes relacionados à administração geral do sistema, acessíveis apenas por usuários com perfil de administrador. Pode incluir gestão de usuários, configurações globais, etc.

---

## Auth
**Propósito:** Gerencia tudo relacionado à autenticação de usuários, como login, registro, recuperação de senha e talvez lógica de sessão.

---

## Checkin
**Propósito:** Funcionalidades e componentes para o processo de check-in, que pode ser para clientes em um restaurante, eventos, etc.

---

## Common
**Propósito:** Esta pasta geralmente abriga componentes, hooks ou utilitários que são compartilhados e reutilizados por múltiplas features, evitando duplicação de código.

---

## Coupons
**Propósito:** Contém a lógica e a interface para a criação, gestão e aplicação de cupons de desconto ou promoções.

---

## Customers
**Propósito:** Gerencia informações e interações relacionadas aos clientes, como cadastro, histórico de pedidos, dados de contato, etc.

---

## Dashboard
**Propósito:** Componentes e lógica para a exibição de um painel de controle ou dashboard, que pode apresentar métricas, resumos e informações importantes para o usuário logado (proprietário, gerente, etc.).

---

## ERP
**Propósito:** Funcionalidades relacionadas a um sistema de Planejamento de Recursos Empresariais (ERP), que pode incluir gestão de estoque, finanças, etc. (dependendo da abrangência do sistema).

---

## Feedback
**Propósito:** Gerencia a coleta e exibição de feedbacks de clientes ou usuários, como formulários de pesquisa ou avaliações.

---

## Goals
**Propósito:** Funcionalidades para definir, acompanhar e gerenciar metas ou objetivos dentro do sistema.

---

## IAM
**Propósito:** (Identity and Access Management) Gerencia a identidade e o controle de acesso dos usuários, incluindo papéis, permissões e talvez grupos de usuários.

---

## Integrations
**Propósito:** Contém a lógica e os componentes para integrar a aplicação com serviços externos ou APIs de terceiros.

---

## Labels
**Propósito:** Funcionalidades relacionadas à criação, impressão ou gestão de etiquetas (labels), que podem ser para produtos, mesas, etc.

---

## Loyalty
**Propósito:** Gerencia programas de fidelidade para clientes, como pontos, recompensas e níveis de fidelidade.

---

## Management
**Propósito:** Uma pasta genérica que pode conter funcionalidades de gestão diversas que não se encaixam perfeitamente em outras categorias mais específicas. Pode ser necessário investigar mais a fundo.

---

## Orders
**Propósito:** Gerencia o ciclo de vida dos pedidos, desde a criação até o processamento e a entrega. Diferente da pasta `Waiter` que foca na criação do pedido pelo garçom, esta pode abranger a visão geral e gestão de todos os pedidos.

---

## Owner
**Propósito:** Funcionalidades e componentes específicos para o perfil de "Proprietário", que pode ter acesso a relatórios financeiros, configurações de restaurante, etc.

---

## Permission
**Propósito:** Lógica e componentes para a gestão de permissões de usuários, definindo o que cada perfil pode ou não fazer no sistema.

---

## Public
**Propósito:** Componentes ou páginas que são acessíveis publicamente, sem a necessidade de autenticação, como uma página inicial, "sobre nós", ou menus públicos.

---

## QRCode
**Propósito:** Funcionalidades relacionadas à geração, leitura ou gestão de códigos QR, que podem ser usados para mesas, produtos, promoções, etc.

---

## Relationship
**Propósito:** Pode se referir a funcionalidades de CRM (Customer Relationship Management) ou gestão de relacionamento com outros stakeholders.

---

## Reports
**Propósito:** Contém a lógica e a interface para a geração e visualização de diversos relatórios analíticos do sistema.

---

## Restaurant
**Propósito:** Gerencia as informações e configurações específicas do restaurante, como dados de contato, horários de funcionamento, mesas, etc.

---

## Rewards
**Propósito:** Funcionalidades para a gestão e resgate de recompensas, geralmente ligadas a programas de fidelidade.

---

## Satisfaction
**Propósito:** Pode estar relacionada à coleta e análise de dados de satisfação do cliente, como pesquisas NPS ou avaliações.

---

## Settings
**Propósito:** Contém as configurações gerais da aplicação ou configurações específicas do usuário/restaurante.

---

## Surveys
**Propósito:** Gerencia a criação, distribuição e análise de pesquisas de opinião ou satisfação.

---

## Team
**Propósito:** Funcionalidades para a gestão da equipe, como cadastro de funcionários, atribuição de funções, etc.

---

## ValidityControl
**Propósito:** Pode estar relacionada ao controle de validade de produtos, cupons, ou outras entidades dentro do sistema.

---

## Waiter
**Propósito:** Esta pasta encapsula todas as funcionalidades e componentes do frontend relacionados à interface e operações do garçom.

*   **`api/`**: Contém os serviços e hooks de React Query para interagir com o backend, buscando dados e enviando informações.
    *   `orderService.js`: Lida com a busca de produtos e a criação de pedidos.
    *   `waiterService.js`: Lida com a busca de mesas.
*   **`pages/`**: Contém os componentes de página que o garçom irá interagir.
    *   `OrderPage.js`: Página para criar um novo pedido para uma mesa, selecionando produtos e quantidades.
    *   `WaiterPage.js`: Página principal onde o garçom visualiza as mesas e pode selecionar uma para iniciar um pedido.
