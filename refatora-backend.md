Quero que você revise o Módulo de Fidelidade.
Para cada submódulo listado, siga este checklist detalhado:

1. Menu / Linkagem

Verifique se o item do submódulo está presente no menu e linka corretamente para a página esperada.

Detecte links quebrados, duplicados ou menus órfãos.

2. Páginas / Views

Liste todas as páginas do submódulo.

Verifique se alguma página está faltando (prevista mas não criada).

Analise se o design/UX está coerente com o sistema.

3. Funções / Workflows

Liste todas as funções existentes no submódulo.

Detecte funções não utilizadas (código morto) ou defasadas.

Verifique consistência na nomenclatura e boas práticas.

4. Backend — Rotas / Controllers / Services

Liste todas as rotas ligadas ao submódulo.

Verifique se cada rota está de fato implementada no controller.

Confirme se as rotas chamam services corretos.

Identifique rotas/documentadas mas não implementadas.

Detecte endpoints duplicados ou sem uso.

5. APIs / Integrações

Confirme se as APIs expostas estão documentadas.

Verifique chamadas externas (ex: para clientes, vendas, estoque) e a consistência das integrações.

Marque APIs obsoletas ou quebradas.

6. Permissionamento / Segurança

Analise o controle de permissões do submódulo:

Quem pode criar/editar/deletar.

Roles associadas (Admin, Gerente, Funcionário etc.).

Falhas de segurança (rota acessível sem login, sem checagem de role).

Verifique middleware de autenticação e policies.

7. Melhorias / Refatoração

Sugira melhorias em rotas, controllers e services.

Identifique código repetido que pode virar componente ou função compartilhada.

Indique pontos onde performance pode ser otimizada.

8. Checklist final por submódulo

O que já está 100% pronto.

O que está incompleto.

O que precisa ser criado do zero.

O que pode ser melhorado/refatorado.

Após revisar cada submódulo, passe para o próximo até concluir todos.
No final, faça um resumo geral com prioridades de correção/implementação, separado por:

Crítico (bloqueia funcionamento ou gera falhas graves)

Médio (melhoria importante)

Baixo (ajustes e refinamentos).