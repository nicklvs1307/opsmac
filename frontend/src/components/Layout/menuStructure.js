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
  MonetizationOn as FinancialIcon,
  Settings as SettingsIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';

export const menuStructure = [
  {
    module: 'fidelity',
    title: 'Fidelidade',
    icon: <DashboardIcon />,
    roles: ['admin', 'owner', 'manager'],
    submenu: [
      {
        title: 'Geral',
        roles: ['admin', 'owner', 'manager'],
        submenu: [
          {
            title: 'Painel Inicial',
            path: '/fidelity/dashboard',
            roles: ['admin', 'owner', 'manager'],
          },
          {
            title: 'Resumo do mês',
            path: '/fidelity/monthly-summary',
            roles: ['admin', 'owner', 'manager'],
          },
          {
            title: 'Satisfação',
            path: '/fidelity/satisfaction-overview',
            roles: ['admin', 'owner', 'manager'],
          },
          {
            title: 'Comparativo Pesquisas',
            path: '/fidelity/surveys-comparison',
            roles: ['admin', 'owner', 'manager'],
          },
          { title: 'Evolução', path: '/fidelity/evolution', roles: ['admin', 'owner', 'manager'] },
          {
            title: 'Benchmarking',
            path: '/fidelity/benchmarking',
            roles: ['admin', 'owner', 'manager'],
          },
          {
            title: 'Multipla Escolha',
            path: '/fidelity/multiple-choice',
            roles: ['admin', 'owner', 'manager'],
          },
          {
            title: 'Nuvens de Palavras',
            path: '/fidelity/word-clouds',
            roles: ['admin', 'owner', 'manager'],
          },
        ],
      },
      {
        title: 'Check in',
        icon: <CheckinIcon />,
        roles: ['admin', 'owner', 'manager'],
        submenu: [
          {
            title: 'Dashboard',
            path: '/fidelity/checkin/dashboard',
            roles: ['admin', 'owner', 'manager'],
          },
          {
            title: 'Configurações',
            path: '/fidelity/checkin/settings',
            roles: ['admin', 'owner', 'manager'],
          },
          {
            title: 'Checkin Ativos',
            path: '/fidelity/checkin/active',
            roles: ['admin', 'owner', 'manager'],
          },
        ],
      },
      {
        title: 'Satisfação',
        icon: <SatisfactionIcon />,
        roles: ['admin', 'owner', 'manager'],
        submenu: [
          {
            title: 'Dashboard',
            path: '/fidelity/satisfaction/dashboard',
            roles: ['admin', 'owner', 'manager'],
          },
          {
            title: 'Configurações',
            path: '/fidelity/satisfaction/settings',
            roles: ['admin', 'owner', 'manager'],
          },
          {
            title: 'Pesquisas',
            path: '/fidelity/satisfaction/surveys',
            roles: ['admin', 'owner', 'manager'],
          },
        ],
      },
      {
        title: 'Respostas',
        icon: <ResponsesIcon />,
        roles: ['admin', 'owner', 'manager'],
        submenu: [
          {
            title: 'Painel',
            path: '/fidelity/responses/dashboard',
            roles: ['admin', 'owner', 'manager'],
          },
          {
            title: 'Gestão as Respostas',
            path: '/fidelity/responses/management',
            roles: ['admin', 'owner', 'manager'],
          },
          {
            title: 'Replicas',
            path: '/fidelity/responses/replicas',
            roles: ['admin', 'owner', 'manager'],
          },
          {
            title: 'Metas',
            path: '/fidelity/responses/goals',
            roles: ['admin', 'owner', 'manager'],
          },
          {
            title: 'Importar',
            path: '/fidelity/responses/import',
            roles: ['admin', 'owner', 'manager'],
          },
        ],
      },
      {
        title: 'Relacionamento',
        icon: <RelationshipIcon />,
        roles: ['admin', 'owner', 'manager'],
        submenu: [
          {
            title: 'Dashboard',
            path: '/fidelity/relationship/dashboard',
            roles: ['admin', 'owner', 'manager'],
          },
          {
            title: 'Ranking de Clientes',
            path: '/fidelity/relationship/ranking',
            roles: ['admin', 'owner', 'manager'],
          },
          {
            title: 'Disparos',
            path: '/fidelity/relationship/dispatches',
            roles: ['admin', 'owner', 'manager'],
          },
          {
            title: 'Campanhas Automaticas',
            path: '/fidelity/relationship/campaigns',
            roles: ['admin', 'owner', 'manager'],
          },
          {
            title: 'Mensagens',
            path: '/fidelity/relationship/messages',
            roles: ['admin', 'owner', 'manager'],
          },
          {
            title: 'Aniversariantes',
            path: '/fidelity/relationship/birthdays',
            roles: ['admin', 'owner', 'manager'],
          },
          {
            title: 'Gestão de Clientes',
            path: '/fidelity/relationship/customers',
            roles: ['admin', 'owner', 'manager'],
          },
          {
            title: 'Segmentação de Clientes',
            path: '/fidelity/relationship/segmentation',
            roles: ['admin', 'owner', 'manager'],
          },
        ],
      },
      {
        title: 'Cupons',
        icon: <CouponsIcon />,
        roles: ['admin', 'owner', 'manager'],
        submenu: [
          {
            title: 'Painel',
            path: '/fidelity/coupons/dashboard',
            roles: ['admin', 'owner', 'manager'],
          },
          { title: 'Cupons', path: '/fidelity/coupons/list', roles: ['admin', 'owner', 'manager'] },
          {
            title: 'Gestão de Cupons',
            path: '/fidelity/coupons/management',
            roles: ['admin', 'owner', 'manager'],
          },
          {
            title: 'Validação',
            path: '/fidelity/coupons/validation',
            roles: ['admin', 'owner', 'manager'],
          },
          {
            title: 'Sorteio',
            path: '/fidelity/coupons/raffle',
            roles: ['admin', 'owner', 'manager'],
          },
          {
            title: 'Recompensas',
            path: '/fidelity/coupons/rewards',
            roles: ['admin', 'owner', 'manager'],
          },
          {
            title: 'Gestão de Recompensas',
            path: '/fidelity/coupons/rewards-management',
            roles: ['admin', 'owner', 'manager'],
          },
          {
            title: 'Cadastro de Recompensas',
            path: '/fidelity/coupons/rewards-create',
            roles: ['admin', 'owner', 'manager'],
          },
          {
            title: 'Relatorios de Resgate',
            path: '/fidelity/coupons/redemption-reports',
            roles: ['admin', 'owner', 'manager'],
          },
        ],
      },
      {
        title: 'Automação',
        icon: <AutomationIcon />,
        roles: ['admin', 'owner', 'manager'],
        submenu: [
          {
            title: 'Fluxos',
            path: '/fidelity/automation/flows',
            roles: ['admin', 'owner', 'manager'],
          },
        ],
      },
      {
        title: 'Integrações',
        icon: <IntegrationsIcon />,
        path: '/fidelity/integrations',
        roles: ['admin', 'owner', 'manager'],
      },
      {
        title: 'Relatorios',
        icon: <ReportsIcon />,
        path: '/fidelity/reports',
        roles: ['admin', 'owner', 'manager'],
      },
    ],
  },
  {
    module: 'stock',
    title: 'Estoque',
    icon: <StockIcon />,
    roles: ['admin', 'owner', 'manager'],
    submenu: [
      { title: 'Dashboard', path: '/stock/dashboard', roles: ['admin', 'owner', 'manager'] },
      { title: 'Movimentações', path: '/stock/movements', roles: ['admin', 'owner', 'manager'] },
      { title: 'Fornecedores', path: '/stock/suppliers', roles: ['admin', 'owner', 'manager'] },
      { title: 'Compras', path: '/stock/purchases', roles: ['admin', 'owner', 'manager'] },
      { title: 'Vendas', path: '/stock/sales', roles: ['admin', 'owner', 'manager'] },
      { title: 'Produtos', path: '/stock/products', roles: ['admin', 'owner', 'manager'] },
      {
        title: 'Cadastro de Produtos',
        path: '/stock/products/create',
        roles: ['admin', 'owner', 'manager'],
      },
      {
        title: 'Ingredientes e Insumos',
        path: '/stock/ingredients',
        roles: ['admin', 'owner', 'manager'],
      },
      { title: 'Configurações', path: '/stock/settings', roles: ['admin', 'owner', 'manager'] },
      { title: 'Relatorios', path: '/stock/reports', roles: ['admin', 'owner', 'manager'] },
      {
        title: 'Contagem de Estoque',
        path: '/stock/counting',
        roles: ['admin', 'owner', 'manager'],
      },
      { title: 'Inventario', path: '/stock/inventory', roles: ['admin', 'owner', 'manager'] },
      {
        title: 'Ficha Tecnica',
        roles: ['admin', 'owner', 'manager'],
        submenu: [
          {
            title: 'Cadastro',
            path: '/stock/technical-sheet/create',
            roles: ['admin', 'owner', 'manager'],
          },
          {
            title: 'Fichas Tecnicas',
            path: '/stock/technical-sheet/list',
            roles: ['admin', 'owner', 'manager'],
          },
        ],
      },
      { title: 'CMV', path: '/stock/cmv', roles: ['admin', 'owner', 'manager'] },
      {
        title: 'Perdas e Ajustes',
        path: '/stock/adjustments',
        roles: ['admin', 'owner', 'manager'],
      },
      { title: 'Lotes e Validades', path: '/stock/lots', roles: ['admin', 'owner', 'manager'] },
      { title: 'Alertas', path: '/stock/alerts', roles: ['admin', 'owner', 'manager'] },
    ],
  },
  {
    module: 'orders',
    title: 'Pedidos',
    icon: <OrdersIcon />,
    roles: ['admin', 'owner', 'manager'],
    submenu: [
      { title: 'Painel', path: '/orders/dashboard', roles: ['admin', 'owner', 'manager'] },
      { title: 'PDV', path: '/orders/pdv', roles: ['admin', 'owner', 'manager'] },
      { title: 'Pedidos', path: '/orders/list', roles: ['admin', 'owner', 'manager'] },
      { title: 'Integrações', path: '/orders/integrations', roles: ['admin', 'owner', 'manager'] },
      { title: 'Delivery', path: '/orders/delivery', roles: ['admin', 'owner', 'manager'] },
      {
        title: 'Relatorio de Vendas',
        path: '/orders/sales-report',
        roles: ['admin', 'owner', 'manager'],
      },
      {
        title: 'Salão',
        roles: ['admin', 'owner', 'manager'],
        submenu: [{ title: 'Mesas', path: '/orders/tables', roles: ['admin', 'owner', 'manager'] }],
      },
    ],
  },
  {
    module: 'management',
    title: 'Gestão',
    icon: <ManagementIcon />,
    roles: ['admin', 'owner', 'manager'],
    submenu: [
      { title: 'Dashboard', path: '/management/dashboard', roles: ['admin', 'owner', 'manager'] },
      {
        title: 'Escala de Funcionarios',
        path: '/management/schedule',
        roles: ['admin', 'owner', 'manager'],
      },
      {
        title: 'Controle de Comissões',
        path: '/management/commissions',
        roles: ['admin', 'owner', 'manager'],
      },
      {
        title: 'Custos Fixos e Variaveis',
        path: '/management/costs',
        roles: ['admin', 'owner', 'manager'],
      },
      { title: 'Equipe', path: '/management/team', roles: ['admin', 'owner', 'manager'] },
      { title: 'Produção', path: '/management/production', roles: ['admin', 'owner', 'manager'] },
      {
        title: 'Permissões',
        path: '/management/permissions',
        roles: ['admin', 'owner', 'manager'],
      },
    ],
  },
  {
    module: 'cdv',
    title: 'CDV',
    icon: <CdvIcon />,
    roles: ['admin', 'owner', 'manager'],
    submenu: [
      { title: 'Painel', path: '/cdv/dashboard', roles: ['admin', 'owner', 'manager'] },
      { title: 'Etiquetas', path: '/cdv/labels', roles: ['admin', 'owner', 'manager'] },
      {
        title: 'Impressão Etiquetas',
        path: '/cdv/labels/print',
        roles: ['admin', 'owner', 'manager'],
      },
      {
        title: 'Impressão em Grupo',
        path: '/cdv/labels/print-group',
        roles: ['admin', 'owner', 'manager'],
      },
      {
        title: 'Contagem de Etiquetas',
        path: '/cdv/labels/count',
        roles: ['admin', 'owner', 'manager'],
      },
      {
        title: 'Historico de Contagem',
        path: '/cdv/labels/count-history',
        roles: ['admin', 'owner', 'manager'],
      },
      {
        title: 'Historico de Etiquetas',
        path: '/cdv/labels/history',
        roles: ['admin', 'owner', 'manager'],
      },
      {
        title: 'Exclusão de Etiquetas',
        path: '/cdv/labels/delete',
        roles: ['admin', 'owner', 'manager'],
      },
      {
        title: 'Contagem de Estoque',
        path: '/cdv/stock-count',
        roles: ['admin', 'owner', 'manager'],
      },
      { title: 'Validades', path: '/cdv/expirations', roles: ['admin', 'owner', 'manager'] },
      {
        title: 'Alerta de Validades',
        path: '/cdv/expirations-alert',
        roles: ['admin', 'owner', 'manager'],
      },
    ],
  },
  {
    module: 'financial',
    title: 'Financeiro',
    icon: <FinancialIcon />,
    roles: ['admin', 'owner', 'manager'],
    submenu: [
      {
        title: 'Contas a Pagar',
        roles: ['admin', 'owner', 'manager'],
        submenu: [
          {
            title: 'Fornecedores',
            path: '/financial/payables/suppliers',
            roles: ['admin', 'owner', 'manager'],
          },
          {
            title: 'Prazos',
            path: '/financial/payables/deadlines',
            roles: ['admin', 'owner', 'manager'],
          },
          {
            title: 'Boletos',
            path: '/financial/payables/invoices',
            roles: ['admin', 'owner', 'manager'],
          },
          {
            title: 'Recorrencia',
            path: '/financial/payables/recurring',
            roles: ['admin', 'owner', 'manager'],
          },
        ],
      },
      {
        title: 'Contas a Receber',
        path: '/financial/receivables',
        roles: ['admin', 'owner', 'manager'],
      },
      {
        title: 'Fluxo de Caixa',
        roles: ['admin', 'owner', 'manager'],
        submenu: [
          {
            title: 'Painel',
            path: '/financial/cash-flow/dashboard',
            roles: ['admin', 'owner', 'manager'],
          },
          {
            title: 'Visão',
            path: '/financial/cash-flow/view',
            roles: ['admin', 'owner', 'manager'],
          },
          {
            title: 'Projeção',
            path: '/financial/cash-flow/projection',
            roles: ['admin', 'owner', 'manager'],
          },
          {
            title: 'Historico',
            path: '/financial/cash-flow/history',
            roles: ['admin', 'owner', 'manager'],
          },
        ],
      },
      {
        title: 'DRE',
        roles: ['admin', 'owner', 'manager'],
        submenu: [
          { title: 'Visão', path: '/financial/dre/view', roles: ['admin', 'owner', 'manager'] },
          {
            title: 'Receita',
            path: '/financial/dre/revenue',
            roles: ['admin', 'owner', 'manager'],
          },
          {
            title: 'Custo Variavel (CMV)',
            path: '/financial/dre/cmv',
            roles: ['admin', 'owner', 'manager'],
          },
          {
            title: 'Margem Bruta',
            path: '/financial/dre/gross-margin',
            roles: ['admin', 'owner', 'manager'],
          },
          {
            title: 'Custos Fixos',
            path: '/financial/dre/fixed-costs',
            roles: ['admin', 'owner', 'manager'],
          },
          {
            title: 'Lucro Liquido',
            path: '/financial/dre/net-profit',
            roles: ['admin', 'owner', 'manager'],
          },
        ],
      },
      {
        title: 'Pagamentos',
        roles: ['admin', 'owner', 'manager'],
        submenu: [
          {
            title: 'Meio de Pagamentos',
            path: '/financial/payments/methods',
            roles: ['admin', 'owner', 'manager'],
          },
          {
            title: 'Taxas',
            path: '/financial/payments/fees',
            roles: ['admin', 'owner', 'manager'],
          },
          {
            title: 'Relatorios',
            path: '/financial/payments/reports',
            roles: ['admin', 'owner', 'manager'],
          },
        ],
      },
      {
        title: 'Fiscal',
        roles: ['admin', 'owner', 'manager'],
        submenu: [
          {
            title: 'Notas Fiscais',
            path: '/financial/fiscal/invoices',
            roles: ['admin', 'owner', 'manager'],
          },
          {
            title: 'Impostos',
            path: '/financial/fiscal/taxes',
            roles: ['admin', 'owner', 'manager'],
          },
          {
            title: 'Integração SEFAZ',
            path: '/financial/fiscal/sefaz',
            roles: ['admin', 'owner', 'manager'],
          },
          {
            title: 'Relatórios',
            path: '/financial/fiscal/reports',
            roles: ['admin', 'owner', 'manager'],
          },
          {
            title: 'Configurações',
            path: '/financial/fiscal/settings',
            roles: ['admin', 'owner', 'manager'],
          },
        ],
      },
    ],
  },
  {
    title: 'Configurações',
    icon: <SettingsIcon />,
    path: '/settings',
    roles: ['admin', 'owner'],
  },
  {
    title: 'Admin',
    icon: <AdminIcon />,
    path: '/admin',
    roles: ['super_admin'],
  },
];
