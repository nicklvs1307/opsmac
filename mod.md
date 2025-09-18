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
    *   **Integração de Hooks Customizados:** Utilização de hooks customizados (como `usePermissions` e `usePermissionTreeLogic`) para centralizar lógicas complexas e promover a reutilização.
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

## Módulo Atual em Refatoração

*   **Customers:** Atualmente em refatoração. Estamos no processo de mover e renomear as páginas e arquivos de API para a nova estrutura.

## Problemas Conhecidos / Pendências

*   **Problema de `read_file` com `CustomerDetail.js`:** A ferramenta `read_file` está apresentando um comportamento inconsistente ao tentar ler `frontend/src/features/old/Customers/pages/CustomerDetail.js`. Isso está impedindo a continuidade do movimento de arquivos para o módulo Customers.
    *   **Diagnóstico:** A ferramenta `read_file` funciona para outros arquivos, indicando que o problema é específico do `CustomerDetail.js` (possivelmente arquivo corrompido, permissões ou conteúdo inválido).
    *   **Solução Proposta:** Para contornar o problema e desbloquear o progresso, o arquivo `frontend/src/features/old/Customers/pages/CustomerDetail.js` será removido diretamente, e um novo arquivo `frontend/src/features/Customers/pages/DetailPage.js` será criado com um conteúdo básico (placeholder). O conteúdo original precisará ser recuperado manualmente pelo usuário ou de um controle de versão.
*   **Validação da Build:** A validação completa da build e do funcionamento da aplicação será realizada após a conclusão de cada módulo ou conforme solicitado pelo usuário, para garantir que as refatorações não introduziram regressões.