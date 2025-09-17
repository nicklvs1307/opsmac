# Análise e Plano de Refatoração do Sistema de Permissionamento

## 1. Visão Geral do Sistema

*   **Objetivo:** Entender a arquitetura, fluxos e mecanismos do sistema de permissionamento, criação de usuários e empresas (restaurantes), e gestão de permissões.
*   **Contexto:** Sistema multi-tenant com controle de acesso baseado em papéis (RBAC), sobrescritas de permissão por usuário e entitlements de restaurante.

## 2. Análise Detalhada (Etapas Concluídas)

### 2.1. Etapa 1: Análise da Estrutura do Banco de Dados e Modelos

*   **Resumo:** O sistema utiliza um modelo multi-tenant robusto, onde cada `Restaurant` é um inquilino isolado. As permissões são definidas em uma hierarquia de 4 níveis: `Modules` -> `Submodules` -> `Features` -> `Actions`.
*   **Tabelas Chave:**
    *   `users`: Usuários do sistema.
    *   `restaurants`: Entidades de negócio (inquilinos).
    *   `user_restaurants`: Tabela de junção para associar usuários a restaurantes (um usuário pode ter acesso a múltiplos restaurantes).
    *   `modules`, `submodules`, `features`, `actions`: Definem a granularidade das permissões.
    *   `roles`: Papéis que agrupam permissões, específicos por `restaurant_id`.
    *   `role_permissions`: Associa `Roles` a `Features` e `Actions`.
    *   `user_roles`: Associa `Users` a `Roles` dentro de um `Restaurant`.
    *   `user_permission_overrides`: Permissões específicas para um usuário que sobrescrevem as do seu papel.
    *   `restaurant_entitlements`: Controla o acesso de um restaurante a módulos/funcionalidades de alto nível.
*   **Observações:** Estrutura bem pensada, flexível e escalável para um ambiente multi-empresa.

### 2.2. Etapa 2: Análise do Fluxo de Criação de Entidades

*   **Criação de Usuários e Restaurantes:**
    *   `admin.service.js`: Contém funções robustas como `createRestaurantWithOwner` (cria restaurante, usuário proprietário, associa via `UserRestaurant` e atribui `Role` de "owner") e `createUser` (cria usuário, associa a restaurante e papel existentes).
    *   `iam.service.js`: Lida com a criação de `Roles` (`createRole`) e a atribuição de `Roles` a `Users` (`assignUserRole`).
    *   **Inconsistência Crítica:** `restaurant.service.js` possui `createRestaurantUser`. Esta função cria um `User` mas **não o associa a nenhum restaurante** via `UserRestaurant` nem atribui um `Role` via `UserRole`. A tentativa de atribuir `restaurant_id` diretamente ao modelo `User` é ineficaz, pois o campo não existe. Usuários criados por este método são "órfãos" no sistema de permissões multi-tenant.

### 2.3. Etapa 3: Análise da Atribuição e Atualização de Permissões

*   **Serviço Central:** `iam.service.js` é o principal responsável.
*   **Mecanismos:**
    *   **Atribuição/Remoção de Papéis:** `assignUserRole` e `removeUserRole` gerenciam a tabela `user_roles`.
    *   **Definição de Permissões de Papel:** `setRolePermissions` substitui o conjunto completo de `RolePermissions` para um `Role`.
    *   **Sobrescritas de Usuário:** `setUserPermissionOverride` e `deleteUserPermissionOverride` gerenciam `UserPermissionOverrides`.
    *   **Entitlements de Restaurante:** `setRestaurantEntitlements` e `setEntitlementsBulk` controlam o acesso de alto nível.
*   **Invalidação de Cache:** Todas as operações de modificação chamam `bumpPermVersion(restaurantId)` para invalidar o cache Redis, garantindo consistência.

### 2.4. Etapa 4: Análise da Verificação de Permissões (Enforcement)

*   **Função Principal:** `checkPermission(restaurantId, userId, featureKey, actionKey, isSuperadmin)` em `iam.service.js`.
*   **Fluxo:**
    1.  Superadmin tem acesso irrestrito.
    2.  Verifica cache Redis para snapshot de permissões do usuário.
    3.  Se não em cache, `buildSnapshot` é chamado para compilar todas as permissões:
        *   Coleta `UserRoles`, `RolePermissions`, `UserPermissionOverrides`, `RestaurantEntitlements` e a hierarquia de `Modules`/`Submodules`/`Features`.
        *   `_getEffectivePermission` resolve a permissão final com a seguinte precedência: **Entitlement (bloqueio) > Sobrescrita de Usuário > Permissão de Papel**.
    4.  Snapshot é salvo no cache Redis.
    5.  Permissão específica é retornada.
*   **Observações:** Sistema eficiente, granular e performático devido ao uso de cache e lógica de resolução clara.

## 3. Pontos Fortes do Sistema

*   **Granularidade:** Controle de permissões em nível de ação para cada funcionalidade.
*   **Multi-Tenant:** Isolamento robusto de permissões por restaurante.
*   **Flexibilidade:** Suporte a RBAC, sobrescritas de usuário e entitlements de alto nível.
*   **Performance:** Uso inteligente de cache Redis para verificações rápidas.
*   **Consistência:** Mecanismo `bumpPermVersion` para garantir que as alterações de permissão sejam refletidas.

## 4. Plano de Refatoração Proposto

### 4.1. Fase 1: Correção da Inconsistência `createRestaurantUser`

*   **Problema:** A função `createRestaurantUser` em `backend/src/domains/restaurant/restaurant.service.js` cria usuários sem associá-los corretamente a restaurantes ou papéis, e tenta atribuir um campo inexistente (`restaurant_id`) ao modelo `User`.
*   **Ações:**
    1.  **Remover/Depreciar:**
        *   Remover a função `createRestaurantUser` de `backend/src/domains/restaurant/restaurant.service.js`.
        *   Remover a chamada a `createRestaurantUser` de `backend/src/domains/restaurant/restaurant.controller.js`.
        *   Remover a rota associada a `createRestaurantUser` de `backend/src/domains/restaurant/restaurant.routes.js`.
    2.  **Consolidar Criação de Usuários:**
        *   Direcionar todas as chamadas de criação de usuário para as funções existentes e corretas em `admin.service.js` (`createUser` ou `createRestaurantWithOwner`), que garantem a correta associação com `UserRestaurant` e `UserRole`.

### 4.2. Fase 2: Melhorias Gerais no Sistema de Permissões

*   **Objetivo:** Aumentar a robustez e a manutenibilidade.
*   **Ações:**
    1.  **Validação de Tipos/Esquemas:**
        *   Implementar validação mais robusta (ex: Joi ou similar) para dados de permissão (chaves de módulos, submódulos, funcionalidades, ações) nas camadas de API e serviço. Isso evitará erros por chaves inválidas ou inexistentes.
    2.  **Registro de Auditoria para Alterações de Permissão:**
        *   Garantir que todas as operações de modificação de permissões (criação/atualização de papéis, atribuição de papéis, sobrescritas, entitlements) gerem eventos de auditoria detalhados na tabela `audit_logs`.

### 4.3. Fase 3: Aprimoramento de Funcionalidades (Considerações Futuras)

*   **Objetivo:** Melhorar a usabilidade e a capacidade de gerenciamento do sistema.
*   **Ações:**
    1.  **Interface de Usuário para Gerenciamento de Permissões:**
        *   Desenvolver uma UI dedicada que permita a super-administradores e administradores de restaurante gerenciar visualmente:
            *   Criação, edição e exclusão de papéis.
            *   Atribuição/revogação de permissões a papéis.
            *   Atribuição/revogação de papéis a usuários dentro de um restaurante.
            *   Gerenciamento de sobrescritas de permissão por usuário.
            *   Gerenciamento de entitlements de restaurante.
    2.  **Ferramenta de Simulação/Teste de Permissões:**
        *   Criar uma ferramenta interna ou endpoint de API que, dado um `userId`, `restaurantId`, `featureKey` e `actionKey`, retorne a permissão efetiva e a razão (ex: "concedido pelo papel 'Gerente'", "negado por entitlement", "concedido por sobrescrita").
    3.  **Modelos/Herança de Papéis:**
        *   Explorar a implementação de modelos de papéis base que possam ser herdados ou personalizados por cada restaurante, ou um mecanismo para papéis herdarem permissões de um papel pai.

## 5. Próximos Passos

*   Iniciar a **Fase 1 do plano de refatoração** para corrigir a inconsistência crítica da função `createRestaurantUser`.
