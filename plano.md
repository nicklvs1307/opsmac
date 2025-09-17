# Plano de Refatoração: Estrutura do Diretório `frontend/src/features`

## 1. Objetivo

O objetivo desta refatoração é organizar e padronizar o diretório `frontend/src/features` com base em princípios de design orientado a domínio. Isso visa melhorar a manutenibilidade, escalabilidade e clareza do código, alinhando a estrutura do frontend com os domínios de negócio da aplicação e o sistema de permissões existente.

## 2. Estrutura Proposta para `frontend/src/features`

A nova estrutura será organizada por domínios de negócio principais, com subdiretórios para funcionalidades específicas dentro de cada domínio.

```
frontend/src/features/
├── Admin/                  // Funcionalidades relacionadas à administração geral do sistema
│   ├── Users/
│   ├── Restaurants/
│   ├── RolesAndPermissions/
│   └── ...
├── Common/                 // Componentes, hooks, utilitários compartilhados
│   ├── Components/
│   ├── Hooks/
│   ├── Utils/
│   └── ...
├── Customers/              // Todas as funcionalidades relacionadas ao cliente
│   ├── List/               // Gestão de Clientes
│   ├── Segmentation/       // Segmentação de Clientes
│   ├── Profile/
│   ├── Ranking/            // Ranking de Clientes
│   ├── Communication/      // Disparos, Campanhas Automaticas, Mensagens, Aniversariantes
│   └── ...
├── Financial/              // Todas as funcionalidades de gestão financeira
│   ├── AccountsPayable/
│   ├── AccountsReceivable/
│   ├── CashFlow/
│   ├── DRE/
│   ├── Payments/
│   ├── Fiscal/
│   └── ...
├── Integrations/           // Funcionalidades relacionadas a integrações de sistemas externos
│   ├── Ifood/
│   ├── DeliveryMuch/
│   ├── GoogleMyBusiness/
│   ├── Saipos/
│   ├── General/            // Integrações não específicas de um domínio
│   └── ...
├── Loyalty/                // Módulo de Fidelidade Consolidado
│   ├── Dashboard/          // Dashboards de Fidelidade (Geral, Check-in, Satisfação, Respostas, Relacionamento, Cupons)
│   ├── MonthlySummary/     // Resumo do mês
│   ├── SatisfactionOverview/ // Visão Geral da Satisfação
│   ├── SurveysComparison/  // Comparativo de Pesquisas
│   ├── Evolution/          // Evolução
│   ├── Benchmarking/       // Benchmarking
│   ├── MultipleChoice/     // Múltipla Escolha
│   ├── WordClouds/         // Nuvens de Palavras
│   ├── Checkin/
│   │   ├── Settings/
│   │   ├── Active/
│   │   └── ...
│   ├── Satisfaction/
│   │   ├── Settings/
│   │   ├── Surveys/
│   │   └── ...
│   ├── Responses/
│   │   ├── Management/
│   │   ├── Replicas/
│   │   ├── Goals/
│   │   ├── Import/
│   │   └── ...
│   ├── Coupons/
│   │   ├── List/
│   │   ├── Management/
│   │   ├── Validation/
│   │   ├── Raffle/
│   │   ├── Rewards/
│   │   ├── RewardsManagement/
│   │   ├── RewardsCreate/
│   │   ├── RedemptionReports/
│   │   └── ...
│   ├── Automation/
│   │   ├── Flows/
│   │   └── ...
│   └── Reports/            // Relatórios específicos de fidelidade
├── Management/             // Funcionalidades de gestão geral
│   ├── Team/
│   ├── Schedules/
│   ├── Commissions/
│   ├── Production/
│   └── ...
├── Orders/                 // Todas as funcionalidades de gerenciamento de pedidos
│   ├── Dashboard/
│   ├── POS/
│   ├── List/
│   ├── DigitalMenus/
│   ├── Delivery/
│   ├── DineIn/
│   └── ...
├── Public/                 // Funcionalidades voltadas para o público
│   ├── Menus/
│   ├── SurveyForms/
│   └── ...
├── QRCode/                 // Geração e gerenciamento de QR Code
├── Reports/                // Relatórios gerais (não específicos de um domínio)
│   ├── FinancialReports/
│   ├── SalesReports/
│   ├── StockReports/
│   └── ...
├── Settings/               // Configurações de toda a aplicação
│   ├── Profile/
│   ├── Business/
│   ├── Security/
│   ├── Notifications/
│   ├── Appearance/
│   ├── Whatsapp/
│   └── ...
├── Stock/                  // Todas as funcionalidades de gerenciamento de estoque
│   ├── Dashboard/
│   ├── Products/
│   ├── Ingredients/
│   ├── Suppliers/
│   ├── Movements/
│   ├── Inventory/
│   ├── TechnicalSheets/
│   ├── Adjustments/
│   ├── LotsAndValidity/
│   └── ...
├── ValidityControl/        // Funcionalidades específicas para controle de validade
│   ├── Labels/
│   ├── StockCounts/
│   ├── Expirations/
│   └── ...
└── IAM/                    // Gerenciamento de Identidade e Acesso
```

## 3. Guia de Implementação Passo a Passo

Este plano deve ser executado de forma incremental, com testes e verificações a cada etapa.

### Fase 1: Preparação e Criação de Estrutura Base

1.  **Criação de Novos Diretórios de Domínio:**
    *   Crie os diretórios de nível superior que ainda não existem em `frontend/src/features/`:
        *   `Customers/`
        *   `Financial/`
        *   `Loyalty/`
        *   `Stock/`
        *   `IAM/` (se não for parte de `Admin/`)
    *   Crie os subdiretórios iniciais dentro desses novos domínios conforme a estrutura proposta (ex: `Loyalty/Dashboard/`, `Customers/List/`).

2.  **Configuração de Aliases de Importação (se necessário):**
    *   Verifique se o sistema de aliases de importação (ex: `@/features/`) está configurado para lidar com a nova estrutura. Se não, configure-o para facilitar as importações.

### Fase 2: Movimentação e Refatoração de Funcionalidades Existentes

Para cada item abaixo, siga o processo: **Mover arquivos -> Atualizar imports -> Testar.**

1.  **Refatorar `ERP/`:**
    *   Analise o conteúdo de `frontend/src/features/ERP/`.
    *   Mova as funcionalidades relacionadas a **Estoque** para `frontend/src/features/Stock/` (ex: `Menu` pode ser `Stock/Products/Menu` ou `Orders/DigitalMenus/Menu` dependendo do contexto).
    *   Mova as funcionalidades relacionadas a **Pedidos** para `frontend/src/features/Orders/`.
    *   Mova as funcionalidades relacionadas a **Financeiro** para `frontend/src/features/Financial/`.
    *   Após mover todo o conteúdo relevante, remova o diretório `frontend/src/features/ERP/`.

2.  **Refatorar `Owner/` e `Waiter/`:**
    *   Analise o conteúdo de `frontend/src/features/Owner/`. Mova suas funcionalidades para os domínios apropriados:
        *   Configurações específicas do proprietário: `Settings/Business/` ou `Admin/OwnerSpecificSettings/`.
        *   Dashboards/relatórios específicos: `Admin/Dashboard/` ou `Reports/OwnerReports/`.
    *   Analise o conteúdo de `frontend/src/features/Waiter/`. Mova suas funcionalidades para os domínios apropriados:
        *   Chamadas de garçom, gerenciamento de mesas: `Orders/DineIn/`.
        *   Gerenciamento de equipe de garçons: `Management/Team/`.
    *   Após mover todo o conteúdo, remova os diretórios `frontend/src/features/Owner/` e `frontend/src/features/Waiter/`.

3.  **Mover Funcionalidades para `Loyalty/`:**
    *   Mova os diretórios existentes: `Checkin/`, `Coupons/`, `Feedback/`, `Goals/`, `Loyalty/` (se for um agrupador), `Satisfaction/`, `Surveys/` para dentro de `frontend/src/features/Loyalty/`.
    *   Crie os subdiretórios necessários dentro de `Loyalty/` (ex: `Loyalty/Checkin/Settings/`, `Loyalty/Coupons/List/`) e mova os arquivos para lá.
    *   Consolide os dashboards relacionados à fidelidade em `Loyalty/Dashboard/`.
    *   Mova as funcionalidades de `Fidelity/Geral` (MonthlySummary, SatisfactionOverview, etc.) para `Loyalty/` como subdiretórios.
    *   Mova as funcionalidades de `Fidelity/Respostas` para `Loyalty/Responses/`.
    *   Mova as funcionalidades de `Fidelity/Automação` para `Loyalty/Automation/`.
    *   Mova os relatórios específicos de fidelidade para `Loyalty/Reports/`.

4.  **Mover Funcionalidades para `Customers/`:**
    *   Mova o diretório existente `Customers/` para `frontend/src/features/Customers/List/`.
    *   Mova as funcionalidades de `Fidelity/Relacionamento` (Ranking de Clientes, Segmentação de Clientes, Disparos, Campanhas Automaticas, Mensagens, Aniversariantes) para `frontend/src/features/Customers/` em subdiretórios lógicos (ex: `Customers/Ranking/`, `Customers/Segmentation/`, `Customers/Communication/`).

5.  **Mover Funcionalidades para `Stock/`:**
    *   Mova as funcionalidades relacionadas a estoque que estavam em `ERP/` ou em outros locais para `frontend/src/features/Stock/`.
    *   Crie subdiretórios como `Products/`, `Ingredients/`, `Suppliers/`, `Movements/`, `Inventory/`, `TechnicalSheets/`, `Adjustments/`, `LotsAndValidity/` e organize os arquivos.

6.  **Mover Funcionalidades para `Management/`:**
    *   Mova o diretório existente `Team/` para `frontend/src/features/Management/Team/`.
    *   Mova o diretório existente `Permission/` para `frontend/src/features/Admin/RolesAndPermissions/` ou `frontend/src/features/IAM/Permissions/`.
    *   Organize outras funcionalidades de gestão (escalas, comissões, produção) em subdiretórios.

7.  **Mover Funcionalidades para `ValidityControl/`:**
    *   Mova o diretório existente `Labels/` para `frontend/src/features/ValidityControl/Labels/`.
    *   Organize outras funcionalidades de controle de validade (contagens de estoque, vencimentos) em subdiretórios.

8.  **Mover Funcionalidades para `Settings/`:**
    *   Organize as funcionalidades de configurações (Perfil, Empresa, Segurança, WhatsApp, Notificações, Aparência) em subdiretórios dentro de `frontend/src/features/Settings/`.

9.  **Mover Funcionalidades para `Integrations/`:**
    *   Organize as integrações existentes (Ifood, DeliveryMuch, GoogleMyBusiness, Saipos) em subdiretórios. Crie um `General/` para integrações mais genéricas.

10. **Mover Funcionalidades para `Reports/`:**
    *   Crie subdiretórios para relatórios gerais (ex: `FinancialReports/`, `SalesReports/`, `StockReports/`).

11. **Atualização de Imports:**
    *   Após cada movimentação, utilize ferramentas de refatoração da IDE (se disponíveis) ou faça uma busca global e substituição para atualizar todos os caminhos de importação (`import ... from '...'`) nos arquivos afetados.

### Fase 3: Verificação e Testes

1.  **Executar Linter e Formatador:**
    *   `npm run lint` (ou comando equivalente) para garantir que as convenções de código sejam mantidas.
    *   `npm run format` (ou comando equivalente) para padronizar a formatação.
2.  **Executar Testes Unitários e de Integração:**
    *   `npm test` (ou comando equivalente) para verificar se as funcionalidades continuam operacionais.
3.  **Testes Manuais:**
    *   Navegue pela aplicação para garantir que todas as páginas e funcionalidades do menu (conforme `menuStructure.js`) estejam funcionando corretamente.
4.  **Verificação de Permissões:**
    *   Teste diferentes perfis de usuário (admin, owner, manager, employee) para garantir que o sistema de permissões esteja funcionando como esperado com a nova estrutura.

## 4. Considerações e Melhores Práticas

*   **Incrementalidade:** Realize as mudanças em pequenos passos, commitando frequentemente. Isso facilita a identificação e correção de problemas.
*   **Controle de Versão:** Utilize o Git para gerenciar as mudanças. Crie uma branch específica para esta refatoração.
*   **Comunicação:** Mantenha a equipe informada sobre o progresso e quaisquer desafios.
*   **Documentação:** Atualize a documentação interna (se houver) para refletir a nova estrutura.
*   **Testes:** Priorize a criação ou atualização de testes para as funcionalidades refatoradas.
*   **Backend:** Embora este plano foque no frontend, considere um alinhamento similar para o `backend/src/domains` no futuro, se ainda não estiver perfeitamente alinhado.

Este plano detalhado deve guiá-lo através do processo de refatoração. Por favor, me avise se tiver alguma dúvida ou se quiser ajustar algum ponto.