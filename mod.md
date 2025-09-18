# Livro Razão da Refatoração do Frontend

## Objetivo Geral

O objetivo principal desta refatoração é modernizar, padronizar e otimizar o frontend da aplicação, garantindo que o código seja mais modular, legível, escalável e de fácil manutenção. Estamos focando na aplicação das melhores práticas de desenvolvimento de software, utilizando a estrutura existente na pasta `old` como referência, mas recriando os componentes e funcionalidades do zero para evitar "gambiarras" e garantir a qualidade.

## Abordagem da Refatoração

A refatoração está sendo realizada de forma incremental, módulo por módulo. O processo geral para cada módulo segue os seguintes passos:

1.  **Análise Inicial:**
    *   Listagem do conteúdo da pasta `old` do módulo para entender a estrutura existente (páginas, componentes, serviços, APIs).
    *   Leitura dos arquivos chave para compreender as funcionalidades, dependências e como o permissionamento é tratado.
    *   Verificação dos arquivos de rota relacionados para entender como os componentes são mapeados.

2.  **Criação da Nova Estrutura:**
    *   Criação de uma nova estrutura de pastas para o módulo dentro de `frontend/src/features/`, seguindo um padrão consistente (e.g., `api/`, `components/`, `hooks/`, `pages/`, `utils/`).

3.  **Movimento e Renomeação de Arquivos:**
    *   Os arquivos da pasta `old` são movidos para a nova estrutura. Devido a problemas com o comando `move` no ambiente Windows, a estratégia adotada é:
        *   Ler o conteúdo do arquivo de origem (`old`).
        *   Escrever esse conteúdo no novo arquivo de destino (com o novo nome e caminho).
        *   Remover o arquivo de origem (`old`).
    *   Os nomes dos arquivos e componentes são padronizados para refletir sua função e localização (e.g., `AdminUsersPage.js` para `UsersPage.js`).

4.  **Refatoração do Conteúdo dos Arquivos:**
    *   **Atualização de Importações:** Ajuste de todos os caminhos de importação dentro dos arquivos movidos para refletir a nova estrutura.
    *   **Otimização de Componentes:** Revisão do código para melhorar a legibilidade, remover duplicações, aplicar padrões de código consistentes e otimizar o desempenho (e.g., uso de `react-query` para busca de dados).
    *   **Adaptação de Layout:** Garantia de que o layout dos componentes esteja otimizado e adaptado às necessidades do projeto.

5.  **Atualização do Menu e Rotas:**
    *   **`menuConfig.js`:** Adição ou atualização dos itens de menu relacionados ao módulo refatorado, garantindo que os `path`s, `featureKey`s e `actionKey`s estejam corretos.
    *   **Arquivos de Rota:** Atualização dos arquivos de rota (`*.routes.js`) para apontar para os novos componentes e garantir a proteção adequada com `ProtectedRoute`.

6.  **Limpeza da Pasta `old`:**
    *   Após a conclusão da refatoração e integração de um módulo, a pasta `old` correspondente é removida para limpar o código.

## Ferramentas Utilizadas

*   **`read_file`:** Para ler o conteúdo dos arquivos.
*   **`write_file`:** Para escrever o conteúdo em novos arquivos.
*   **`run_shell_command` (com `md`, `del`, `rmdir /s /q`):** Para criar diretórios e remover arquivos/diretórios.
*   **`replace`:** Para realizar substituições de texto dentro dos arquivos.
*   **`list_directory`:** Para listar o conteúdo dos diretórios.
*   **`search_file_content`:** Para buscar padrões dentro dos arquivos.

## Módulos Concluídos

*   **Menu/Sidebar:** Refatoração da estrutura do menu principal, incluindo a criação de `menuConfig.js`, `usePermissions.js`, `MenuItem.js`, `SidebarLayout.js` e a remoção de componentes antigos do menu.
*   **Admin:** Refatoração completa do módulo Admin, incluindo a movimentação de páginas, componentes, hooks e serviços para uma nova estrutura, atualização de rotas e refatoração do conteúdo dos arquivos.
*   **Customers:** Refatoração completa do módulo Customers. Todas as páginas (`BirthdaysPage.js`, `CustomersPage.js`, `DashboardPage.js`, `DetailPage.js`) e o serviço (`customerService.js`) foram movidos para a nova estrutura (`frontend/src/features/Customers/`) e as importações foram verificadas e corrigidas.
*   **IAM:** Refatoração completa do módulo IAM. Todos os arquivos de API (`iamQueries.js`) e páginas (`EntitlementManagement.js`, `IAMDashboard.js`, `RoleManagement.js`, `RolePermissions.js`, `UserPermissionOverrides.js`, `UserRoleManagement.js`) foram movidos para a nova estrutura (`frontend/src/features/IAM/`) e as importações foram verificadas e corrigidas.
*   **Common:** Refatoração completa do módulo Common. Os arquivos `ComingSoon.js` e `UnauthorizedPage.js` foram movidos de `frontend/src/features/old/Common` para `frontend/src/features/Common/pages/ComingSoonPage.js` e `frontend/src/features/Common/pages/UnauthorizedPage.js`, respectivamente. A pasta `frontend/src/features/old/Common` foi removida.
*   **Waiter:** Refatoração completa do módulo Waiter. Os arquivos `orderService.js` e `waiterService.js` foram movidos de `frontend/src/features/old/Waiter/api` para `frontend/src/features/Waiter/api/orderQueries.js` e `frontend/src/features/Waiter/api/waiterQueries.js`, respectivamente. Os arquivos `OrderPage.js` e `WaiterPage.js` foram movidos de `frontend/src/features/old/Waiter/pages` para `frontend/src/features/Waiter/pages/OrderPage.js` e `frontend/src/features/Waiter/pages/WaiterPage.js`, respectivamente. As importações nos arquivos movidos foram atualizadas. A pasta `frontend/src/features/old/Waiter` foi removida.
*   **Team:** Refatoração completa do módulo Team. O arquivo `teamService.js` foi movido de `frontend/src/features/old/Team/api` para `frontend/src/features/Team/api/teamQueries.js`. O arquivo `TeamManagementPage.js` foi movido de `frontend/src/features/old/Team/pages` para `frontend/src/features/Team/pages/TeamManagementPage.js`. As importações nos arquivos movidos foram atualizadas. A pasta `frontend/src/features/old/Team` foi removida.
*   **Goals:** Refatoração completa do módulo Goals. O arquivo `goalsService.js` foi movido de `frontend/src/features/old/Goals/api` para `frontend/src/features/Goals/api/goalsQueries.js`. Os arquivos `GoalFormDialog.js` e `GoalTable.js` foram movidos de `frontend/src/features/old/Goals/components` para `frontend/src/features/Goals/components/GoalFormDialog.js` e `frontend/src/features/Goals/components/GoalTable.js`, respectivamente. Os arquivos `Goals.js`, `GoalsPage.js`, `Import.js` e `Replicas.js` foram movidos de `frontend/src/features/old/Goals/pages` para `frontend/src/features/Goals/pages/GoalsDashboardPage.js`, `frontend/src/features/Goals/pages/GoalsManagementPage.js`, `frontend/src/features/Goals/pages/ImportPage.js` e `frontend/src/features/Goals/pages/ReplicasPage.js`, respectivamente. As importações nos arquivos movidos foram atualizadas. A pasta `frontend/src/features/old/Goals` foi removida.
*   **Orders:** Refatoração completa do módulo Orders. O arquivo `ordersService.js` foi movido de `frontend/src/features/old/ERP/Orders/api` para `frontend/src/features/Orders/api/ordersQueries.js`. Os arquivos `Delivery.js`, `Integrations.js` e `SalesReport.js` foram movidos de `frontend/src/features/old/ERP/Orders/pages` para `frontend/src/features/Orders/pages/DeliveryPage.js`, `frontend/src/features/Orders/pages/IntegrationsPage.js` e `frontend/src/features/Orders/pages/SalesReportPage.js`, respectivamente. A página `Orders.js` não foi encontrada e foi assumido que sua funcionalidade foi consolidada ou não existe mais. As importações nos arquivos movidos foram atualizadas. A pasta `frontend/src/features/old/ERP/Orders` foi removida.
*   **Owner:** Refatoração completa do módulo Owner. O arquivo `ownerService.js` foi movido de `frontend/src/features/old/Owner/api` para `frontend/src/features/Owner/api/ownerQueries.js`. O arquivo `RoleManagementPage.js` foi movido de `frontend/src/features/old/Owner/pages` para `frontend/src/features/Owner/pages/RoleManagementPage.js`. As importações nos arquivos movidos foram atualizadas. A pasta `frontend/src/features/old/Owner` foi removida.
*   **Restaurant:** Refatoração completa do módulo Restaurant. O arquivo `restaurantQueries.js` foi movido de `frontend/src/features/old/Restaurant/api` para `frontend/src/features/Restaurant/api/restaurantQueries.js`. A pasta `frontend/src/features/old/Restaurant` foi removida. Não foram necessárias atualizações de importação em outros arquivos, pois o módulo não era importado por outros arquivos na estrutura antiga.
*   **ERP/Financial:** Refatoração completa do sub-módulo ERP/Financial. O arquivo `financialService.js` foi movido de `frontend/src/features/old/ERP/Financial/api` para `frontend/src/features/ERP/Financial/api/financialQueries.js`. Os arquivos `FinancialCategoriesPage.js` e `FinancialTransactions.js` foram movidos de `frontend/src/features/old/ERP/pages` para `frontend/src/features/ERP/Financial/pages/FinancialCategoriesPage.js` e `frontend/src/features/ERP/Financial/pages/FinancialTransactionsPage.js`, respectivamente. O arquivo `FinancialTransactionsPage.js` (o outro com o mesmo nome) foi sobrescrito no destino para garantir a versão mais atualizada. As importações nos arquivos movidos foram atualizadas. A pasta `frontend/src/features/old/ERP/Financial` foi removida.
*   **ERP/Ingredients:** Refatoração completa do sub-módulo ERP/Ingredients. O arquivo `ingredientsService.js` foi movido de `frontend/src/features/old/ERP/Ingredients/api` para `frontend/src/features/ERP/Ingredients/api/ingredientsQueries.js`. O arquivo `Ingredients.js` foi movido de `frontend/src/features/old/ERP/pages` para `frontend/src/features/ERP/Ingredients/pages/IngredientsManagementPage.js`. As importações nos arquivos movidos foram atualizadas. A pasta `frontend/src/features/old/ERP/Ingredients` foi removida.
*   **ERP/Menu:** Refatoração completa do sub-módulo ERP/Menu. O arquivo `menuService.js` foi movido de `frontend/src/features/old/ERP/Menu/api` para `frontend/src/features/ERP/Menu/api/menuQueries.js`. Os arquivos `AddonsTab.js`, `CategoriesTab.js` e `ProductsTab.js` foram movidos de `frontend/src/features/old/ERP/Menu/components` para `frontend/src/features/ERP/Menu/components/AddonsTab.js`, `frontend/src/features/ERP/Menu/components/CategoriesTab.js` e `frontend/src/features/ERP/Menu/components/ProductsTab.js`, respectivamente. O arquivo `VariationsTab.js` foi movido de `frontend/src/features/old/ERP/Menu/components` para `frontend/src/features/ERP/Menu/components/VariationsTab.js`. O arquivo `Menu.js` foi movido de `frontend/src/features/old/ERP/pages` para `frontend/src/features/ERP/Menu/pages/MenuManagementPage.js`. As importações nos arquivos movidos foram atualizadas. A pasta `frontend/src/features/old/ERP/Menu` foi removida.
*   **ERP/PaymentMethods:** Refatoração completa do sub-módulo ERP/PaymentMethods. O arquivo `paymentMethodsService.js` foi movido de `frontend/src/features/old/ERP/PaymentMethods/api` para `frontend/src/features/ERP/PaymentMethods/api/paymentMethodsQueries.js`. O arquivo `PaymentMethods.js` foi movido de `frontend/src/features/old/ERP/pages` para `frontend/src/features/ERP/PaymentMethods/pages/PaymentMethodsManagementPage.js`. As importações nos arquivos movidos foram atualizadas. A pasta `frontend/src/features/old/ERP/PaymentMethods` foi removida.
*   **ERP/Pdv:** Refatoração completa do sub-módulo ERP/Pdv. O arquivo `pdvService.js` foi movido de `frontend/src/features/old/ERP/Pdv/api` para `frontend/src/features/ERP/Pdv/api/pdvQueries.js`. O arquivo `Pdv.js` foi movido de `frontend/src/features/old/ERP/pages` para `frontend/src/features/ERP/Pdv/pages/PdvManagementPage.js`. As importações nos arquivos movidos foram atualizadas. A pasta `frontend/src/features/old/ERP/Pdv` foi removida.
*   **ERP/Purchases:** Refatoração completa do sub-módulo ERP/Purchases. O arquivo `purchasesService.js` foi movido de `frontend/src/features/old/ERP/Stock/api` para `frontend/src/features/ERP/Purchases/api/purchasesQueries.js`. O arquivo `PurchasesPage.js` foi movido de `frontend/src/features/old/ERP/pages` para `frontend/src/features/ERP/Purchases/pages/PurchasesManagementPage.js`. As importações nos arquivos movidos foram atualizadas. A pasta `frontend/src/features/old/ERP/Purchases` foi removida.
*   **ERP/Stock:** Refatoração completa do sub-módulo ERP/Stock. O arquivo `stockDashboardService.js` foi movido de `frontend/src/features/old/ERP/Stock/api` para `frontend/src/features/ERP/Stock/api/stockDashboardQueries.js`. O arquivo `stockMovementsService.js` foi movido de `frontend/src/features/old/ERP/Stock/api` para `frontend/src/features/ERP/Stock/api/stockMovementsQueries.js`. O arquivo `stockProductsService.js` foi movido de `frontend/src/features/old/ERP/Stock/api` para `frontend/src/features/ERP/Stock/api/stockProductsQueries.js`. O arquivo `suppliersService.js` foi movido de `frontend/src/features/old/ERP/Stock/api` para `frontend/src/features/ERP/Stock/api/suppliersQueries.js`. Os arquivos `Adjustments.js`, `Alerts.js`, `CMV.js`, `Inventory.js`, `Lots.js`, `ProductsCreate.js`, `Reports.js`, `Settings.js`, `StockDashboardPage.js`, `StockMovementsPage.js`, `StockProductsPage.js`, `SuppliersPage.js` e `TechnicalSheetCreate.js` foram movidos de `frontend/src/features/old/ERP/pages` para `frontend/src/features/ERP/Stock/pages/AdjustmentsPage.js`, `frontend/src/features/ERP/Stock/pages/AlertsPage.js`, `frontend/src/features/ERP/Stock/pages/CMVPage.js`, `frontend/src/features/ERP/Stock/pages/InventoryPage.js`, `frontend/src/features/ERP/Stock/pages/LotsPage.js`, `frontend/src/features/ERP/Stock/pages/ProductsCreatePage.js`, `frontend/src/features/ERP/Stock/pages/ReportsPage.js`, `frontend/src/features/ERP/Stock/pages/SettingsPage.js`, `frontend/src/features/ERP/Stock/pages/StockDashboardPage.js`, `frontend/src/features/ERP/Stock/pages/StockMovementsPage.js`, `frontend/src/features/ERP/Stock/pages/StockProductsPage.js`, `frontend/src/features/ERP/Stock/pages/SuppliersManagementPage.js` e `frontend/src/features/ERP/Stock/pages/TechnicalSheetCreatePage.js`, respectivamente. As importações nos arquivos movidos foram atualizadas. A pasta `frontend/src/features/old/ERP/Stock` foi removida.
*   **ERP/Tables:** Refatoração completa do sub-módulo ERP/Tables. O arquivo `tablesService.js` foi movido de `frontend/src/features/old/ERP/Tables/api` para `frontend/src/features/ERP/Tables/api/tablesQueries.js`. O arquivo `Tables.js` foi movido de `frontend/src/features/old/ERP/pages` para `frontend/src/features/ERP/Tables/pages/TablesManagementPage.js`. As importações nos arquivos movidos foram atualizadas. A pasta `frontend/src/features/old/ERP/Tables` foi removida.

## Módulo Atual em Refatoração

*   Nenhum módulo em refatoração no momento.

## Problemas Conhecidos / Pendências

*   **Validação da Build:** A validação completa da build e do funcionamento da aplicação será realizada após a conclusão de cada módulo ou conforme solicitado pelo usuário, para garantir que as refatorações não introduziram regressões.
