import {
    Dashboard as DashboardIcon,
    CheckBox as CheckinIcon,
    Star as SatisfactionIcon,
    Chat as ResponsesIcon,
    ConnectWithoutContact as RelationshipIcon,
    CardGiftcard as CouponsIcon,
    Sync as AutomationIcon,
    Settings as IntegrationsIcon,
    Assessment as ReportsIcon,
    Inventory as StockIcon,
    Receipt as OrdersIcon,
    Group as ManagementIcon,
    Label as CdvIcon,
    MonetizationOn as FinancialIcon
} from '@mui/icons-material';

export const menuStructure = [
    {
        module: 'fidelity',
        title: 'Fidelidade',
        icon: <DashboardIcon />,
        submenu: [
            {
                title: 'Geral',
                submenu: [
                    { title: 'Painel Inicial', path: '/fidelity/dashboard' },
                    { title: 'Resumo do mês', path: '/fidelity/monthly-summary' },
                    { title: 'Satisfação', path: '/fidelity/satisfaction-overview' },
                    { title: 'Comparativo Pesquisas', path: '/fidelity/surveys-comparison' },
                    { title: 'Evolução', path: '/fidelity/evolution' },
                    { title: 'Benchmarking', path: '/fidelity/benchmarking' },
                    { title: 'Multipla Escolha', path: '/fidelity/multiple-choice' },
                    { title: 'Nuvens de Palavras', path: '/fidelity/word-clouds' },
                ]
            },
            {
                title: 'Check in',
                icon: <CheckinIcon />,
                submenu: [
                    { title: 'Dashboard', path: '/fidelity/checkin/dashboard' },
                    { title: 'Configurações', path: '/fidelity/checkin/settings' },
                    { title: 'Checkin Ativos', path: '/fidelity/checkin/active' },
                ]
            },
            {
                title: 'Satisfação',
                icon: <SatisfactionIcon />,
                submenu: [
                    { title: 'Dashboard', path: '/fidelity/satisfaction/dashboard' },
                    { title: 'Configurações', path: '/fidelity/satisfaction/settings' },
                    { title: 'Pesquisas', path: '/fidelity/satisfaction/surveys' },
                ]
            },
            {
                title: 'Respostas',
                icon: <ResponsesIcon />,
                submenu: [
                    { title: 'Painel', path: '/fidelity/responses/dashboard' },
                    { title: 'Gestão as Respostas', path: '/fidelity/responses/management' },
                    { title: 'Replicas', path: '/fidelity/responses/replicas' },
                    { title: 'Metas', path: '/fidelity/responses/goals' },
                    { title: 'Importar', path: '/fidelity/responses/import' },
                ]
            },
            {
                title: 'Relacionamento',
                icon: <RelationshipIcon />,
                submenu: [
                    { title: 'Dashboard', path: '/fidelity/relationship/dashboard' },
                    { title: 'Ranking de Clientes', path: '/fidelity/relationship/ranking' },
                    { title: 'Disparos', path: '/fidelity/relationship/dispatches' },
                    { title: 'Campanhas Automaticas', path: '/fidelity/relationship/campaigns' },
                    { title: 'Mensagens', path: '/fidelity/relationship/messages' },
                    { title: 'Aniversariantes', path: '/fidelity/relationship/birthdays' },
                    { title: 'Gestão de Clientes', path: '/fidelity/relationship/customers' },
                    { title: 'Segmentação de Clientes', path: '/fidelity/relationship/segmentation' },
                ]
            },
            {
                title: 'Cupons',
                icon: <CouponsIcon />,
                submenu: [
                    { title: 'Painel', path: '/fidelity/coupons/dashboard' },
                    { title: 'Cupons', path: '/fidelity/coupons/list' },
                    { title: 'Gestão de Cupons', path: '/fidelity/coupons/management' },
                    { title: 'Validação', path: '/fidelity/coupons/validation' },
                    { title: 'Sorteio', path: '/fidelity/coupons/raffle' },
                    { title: 'Recompensas', path: '/fidelity/coupons/rewards' },
                    { title: 'Gestão de Recompensas', path: '/fidelity/coupons/rewards-management' },
                    { title: 'Cadastro de Recompensas', path: '/fidelity/coupons/rewards-create' },
                    { title: 'Relatorios de Resgate', path: '/fidelity/coupons/redemption-reports' },
                ]
            },
            {
                title: 'Automação',
                icon: <AutomationIcon />,
                submenu: [
                    { title: 'Fluxos', path: '/fidelity/automation/flows' },
                ]
            },
            { title: 'Integrações', icon: <IntegrationsIcon />, path: '/fidelity/integrations' },
            { title: 'Relatorios', icon: <ReportsIcon />, path: '/fidelity/reports' },
        ]
    },
    {
        module: 'stock',
        title: 'Estoque',
        icon: <StockIcon />,
        submenu: [
            { title: 'Dashboard', path: '/stock/dashboard' },
            { title: 'Movimentações', path: '/stock/movements' },
            { title: 'Fornecedores', path: '/stock/suppliers' },
            { title: 'Compras', path: '/stock/purchases' },
            { title: 'Vendas', path: '/stock/sales' },
            { title: 'Produtos', path: '/stock/products' },
            { title: 'Cadastro de Produtos', path: '/stock/products/create' },
            { title: 'Ingredientes e Insumos', path: '/stock/ingredients' },
            { title: 'Configurações', path: '/stock/settings' },
            { title: 'Relatorios', path: '/stock/reports' },
            { title: 'Contagem de Estoque', path: '/stock/counting' },
            { title: 'Inventario', path: '/stock/inventory' },
            {
                title: 'Ficha Tecnica',
                submenu: [
                    { title: 'Cadastro', path: '/stock/technical-sheet/create' },
                    { title: 'Fichas Tecnicas', path: '/stock/technical-sheet/list' },
                ]
            },
            { title: 'CMV', path: '/stock/cmv' },
            { title: 'Perdas e Ajustes', path: '/stock/adjustments' },
            { title: 'Lotes e Validades', path: '/stock/lots' },
            { title: 'Alertas', path: '/stock/alerts' },
        ]
    },
    {
        module: 'orders',
        title: 'Pedidos',
        icon: <OrdersIcon />,
        submenu: [
            { title: 'Painel', path: '/orders/dashboard' },
            { title: 'PDV', path: '/orders/pdv' },
            { title: 'Pedidos', path: '/orders/list' },
            { title: 'Integrações', path: '/orders/integrations' },
            { title: 'Delivery', path: '/orders/delivery' },
            { title: 'Relatorio de Vendas', path: '/orders/sales-report' },
            {
                title: 'Salão',
                submenu: [
                    { title: 'Mesas', path: '/orders/tables' },
                ]
            },
        ]
    },
    {
        module: 'management',
        title: 'Gestão',
        icon: <ManagementIcon />,
        submenu: [
            { title: 'Dashboard', path: '/management/dashboard' },
            { title: 'Escala de Funcionarios', path: '/management/schedule' },
            { title: 'Controle de Comissões', path: '/management/commissions' },
            { title: 'Custos Fixos e Variaveis', path: '/management/costs' },
            { title: 'Equipe', path: '/management/team' },
            { title: 'Produção', path: '/management/production' },
            { title: 'Permissões', path: '/management/permissions' },
        ]
    },
    {
        module: 'cdv',
        title: 'CDV',
        icon: <CdvIcon />,
        submenu: [
            { title: 'Painel', path: '/cdv/dashboard' },
            { title: 'Etiquetas', path: '/cdv/labels' },
            { title: 'Impressão Etiquetas', path: '/cdv/labels/print' },
            { title: 'Impressão em Grupo', path: '/cdv/labels/print-group' },
            { title: 'Contagem de Etiquetas', path: '/cdv/labels/count' },
            { title: 'Historico de Contagem', path: '/cdv/labels/count-history' },
            { title: 'Historico de Etiquetas', path: '/cdv/labels/history' },
            { title: 'Exclusão de Etiquetas', path: '/cdv/labels/delete' },
            { title: 'Contagem de Estoque', path: '/cdv/stock-count' },
            { title: 'Validades', path: '/cdv/expirations' },
            { title: 'Alerta de Validades', path: '/cdv/expirations-alert' },
        ]
    },
    {
        module: 'financial',
        title: 'Financeiro',
        icon: <FinancialIcon />,
        submenu: [
            {
                title: 'Contas a Pagar',
                submenu: [
                    { title: 'Fornecedores', path: '/financial/payables/suppliers' },
                    { title: 'Prazos', path: '/financial/payables/deadlines' },
                    { title: 'Boletos', path: '/financial/payables/invoices' },
                    { title: 'Recorrencia', path: '/financial/payables/recurring' },
                ]
            },
            { title: 'Contas a Receber', path: '/financial/receivables' },
            {
                title: 'Fluxo de Caixa',
                submenu: [
                    { title: 'Painel', path: '/financial/cash-flow/dashboard' },
                    { title: 'Visão', path: '/financial/cash-flow/view' },
                    { title: 'Projeção', path: '/financial/cash-flow/projection' },
                    { title: 'Historico', path: '/financial/cash-flow/history' },
                ]
            },
            {
                title: 'DRE',
                submenu: [
                    { title: 'Visão', path: '/financial/dre/view' },
                    { title: 'Receita', path: '/financial/dre/revenue' },
                    { title: 'Custo Variavel (CMV)', path: '/financial/dre/cmv' },
                    { title: 'Margem Bruta', path: '/financial/dre/gross-margin' },
                    { title: 'Custos Fixos', path: '/financial/dre/fixed-costs' },
                    { title: 'Lucro Liquido', path: '/financial/dre/net-profit' },
                ]
            },
            {
                title: 'Pagamentos',
                submenu: [
                    { title: 'Meio de Pagamentos', path: '/financial/payments/methods' },
                    { title: 'Taxas', path: '/financial/payments/fees' },
                    { title: 'Relatorios', path: '/financial/payments/reports' },
                ]
            },
            {
                title: 'Fiscal',
                submenu: [
                    { title: 'Notas Fiscais', path: '/financial/fiscal/invoices' },
                    { title: 'Impostos', path: '/financial/fiscal/taxes' },
                    { title: 'Integração SEFAZ', path: '/financial/fiscal/sefaz' },
                    { title: 'Relatórios', path: '/financial/fiscal/reports' },
                    { title: 'Configurações', path: '/financial/fiscal/settings' },
                ]
            },
        ]
    }
];
