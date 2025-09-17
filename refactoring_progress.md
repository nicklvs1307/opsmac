## Refatoração do Módulo de Fidelidade

### Visão Geral

O objetivo desta refatoração foi corrigir uma série de erros 500 e outros problemas que estavam afetando o módulo de fidelidade e outras áreas relacionadas do sistema. A análise inicial do `error.log` revelou problemas de sintaxe, inconsistências nos nomes de campos do banco de dados e chamadas de função incorretas.

### Alterações Realizadas

1.  **Correção de Erro de Sintaxe em `feedbacks.service.js`**:
    *   Um erro de sintaxe (`SyntaxError: Unexpected token '!'`) estava impedindo o carregamento das rotas do domínio `feedbacks`. O erro foi causado por um parêntese e uma chave de fechamento ausentes em uma chamada de função `findOne` do Sequelize.
    *   Uma chamada para uma função `handleWhatsAppNotification` indefinida também foi comentada para evitar um `ReferenceError`.

2.  **Padronização do Campo `restaurantId`**:
    *   A causa principal da maioria dos erros 500 nos módulos `rewards`, `surveys` e `dashboard` foi a inconsistência no nome do campo que armazena o ID do restaurante. Nos modelos Sequelize, o campo era definido como `restaurant_id`, mas nas consultas, `restaurantId` era usado.
    *   Todas as ocorrências de `restaurantId` nas cláusulas `where` das consultas do Sequelize foram alteradas para `restaurant_id` nos seguintes arquivos:
        *   `backend/src/domains/rewards/rewards.service.js`
        *   `backend/src/domains/surveys/surveys.service.js`
        *   `backend/src/domains/dashboard/dashboard.service.js`

3.  **Correções no Módulo `rewards`**:
    *   Além da padronização do `restaurantId`, o nome do campo `customerId` também foi corrigido em algumas partes do `rewards.service.js` para garantir consistência.
    *   A função `canCustomerUseReward` foi aprimorada para receber o `restaurantId` como parâmetro, adicionando uma camada extra de segurança para evitar que clientes de um restaurante usem recompensas de outro.

### Resultados

Com essas correções, os erros 500 que estavam ocorrendo nas listagens e análises dos módulos de recompensas, pesquisas e no painel principal foram resolvidos. O módulo de fidelidade deve agora estar funcional e as rotas de feedback devem carregar corretamente.