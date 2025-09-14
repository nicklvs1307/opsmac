# Plano de Refatoração do Frontend

Este documento detalha o plano de refatoração do frontend, o progresso realizado e as próximas etapas.

## Análise Inicial (Concluída)

Foi realizada uma análise detalhada do frontend, abrangendo:
*   **Estrutura Geral e Organização:** `package.json`, `index.js`, `App.js`, estrutura de pastas `features`.
*   **Gerenciamento de Estado:** `AuthContext.js` (useReducer, React Query).
*   **Estilização e UI:** `ThemeContext.js` (Material-UI, tema claro/escuro), `globals.css` (Tailwind CSS).
*   **Internacionalização:** `i18n.js`, `locales/`.
*   **Requisições HTTP:** `axiosInstance.js`.
*   **Roteamento:** `router.js` (React Router DOM v6).

## Plano de Ação Consolidado

### 1. Modularização do Roteamento
*   **Objetivo:** Dividir o arquivo de rotas `frontend/src/app/router.js` em arquivos menores por funcionalidade para melhorar a organização e manutenibilidade.
*   **Status:** **CONCLUÍDO**

### 2. Otimização da Estilização (Tailwind CSS e Material-UI)
*   **Objetivo:** Otimizar o uso de estilos, remover redundâncias e melhorar a organização do tema Material-UI.
*   **Status:** **EM ANDAMENTO**
    *   **2.1. Remover classes utilitárias customizadas redundantes em `globals.css`:**
        *   **Status:** **CONCLUÍDO**
        *   **Detalhes:** Classes como `.mb-1`, `.flex-center` foram removidas de `frontend/src/styles/globals.css`, priorizando as classes do Tailwind CSS.
    *   **2.2. Reavaliar `body { zoom: 0.85; }` em `globals.css`:**
        *   **Status:** **CONCLUÍDO**
        *   **Detalhes:** A propriedade `zoom: 0.85;` foi removida do `body` em `frontend/src/styles/globals.css` para melhorar a acessibilidade e consistência.
    *   **2.3. Modularizar as sobrescritas de componentes do Material-UI em `ThemeContext.js`:**
        *   **Status:** **CONCLUÍDO**
        *   **Detalhes:** Todas as sobrescritas de componentes do Material-UI foram extraídas de `ThemeContext.js` para arquivos dedicados no diretório `frontend/src/app/providers/contexts/theme`.

### 3. Tratamento de Erros e Autenticação (Axios)
*   **Objetivo:** Melhorar a robustez e a clareza no tratamento de requisições HTTP e erros.
*   **Status:** **CONCLUÍDO**
*   **Detalhes:** Foi implementado um `errorHandler.js` para centralizar o tratamento de erros e o `axiosInstance.js` foi atualizado para utilizar este handler e refinar a lógica do interceptor de requisição.

### 4. Gerenciamento de Estado de Autenticação
*   **Objetivo:** Simplificar a lógica de carregamento inicial do usuário e permissões.
*   **Status:** **CONCLUÍDO**
*   **Detalhes:** A lógica de carregamento inicial do usuário e permissões foi refatorada para utilizar os hooks `useFetchMe` e `useFetchPermissions` do `react-query`, centralizando a busca de dados e simplificando o `AuthContext.js`.

### 5. Internacionalização
*   **Objetivo:** Melhorar a seleção e persistência do idioma do usuário.
*   **Status:** **CONCLUÍDO**
*   **Detalhes:** O `i18n.js` foi atualizado para utilizar o `i18next-browser-languagedetector` para detecção dinâmica e persistência do idioma do usuário no `localStorage`.

### 6. Consistência Interna das Features
*   **Objetivo:** Padronizar a estrutura de subpastas dentro de cada diretório de feature.
*   **Status:** **EM ANDAMENTO**
*   **Detalhes:** A feature `Auth` foi refatorada, movendo `Login.js` para `frontend/src/features/Auth/pages/Login.js` e removendo o diretório redundante `frontend/src/features/Auth/Auth/`. Os imports foram atualizados. A padronização será aplicada às demais features.
    *   **6.1. Padronização da sub-feature `CDV/Admin`:**
        *   **Status:** **CONCLUÍDO**
        *   **Detalhes:** A estrutura da sub-feature `CDV/Admin` foi verificada e já segue o padrão de ter uma pasta `pages/` para suas páginas, contendo `index.js`.
    *   **6.2. Padronização da sub-feature `CDV/api`:**
        *   **Status:** **CONCLUÍDO**
        *   **Detalhes:** A estrutura da sub-feature `CDV/api` foi verificada e seus arquivos (`labelQueries.js`, `productionService.js`, `stockCountService.js`) estão bem organizados como serviços de API.
    *   **6.3. Padronização da sub-feature `CDV/CountHistory`:**
        *   **Status:** **CONCLUÍDO**
        *   **Detalhes:** A estrutura da sub-feature `CDV/CountHistory` foi verificada e já segue o padrão de ter uma pasta `pages/` para suas páginas, contendo `index.js`.

### 7. Revisão de Nomenclatura de Features
*   **Objetivo:** Garantir clareza e evitar sobreposição de responsabilidades entre os nomes das features.
*   **Status:** **NÃO INICIADO**

## Onde Paramos

Atualmente, estamos na **Fase 6 do plano de refatoração**, continuando a padronização da estrutura de subpastas dentro de cada diretório de feature. A feature `Auth` e as sub-features `CDV/Admin`, `CDV/api` e `CDV/CountHistory` já foram verificadas/refatoradas.
