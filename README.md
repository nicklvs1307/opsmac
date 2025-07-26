# Fidelix

Sistema completo de coleta e gestão de feedback de clientes para restaurantes.

## Funcionalidades

### 📱 Coleta de Feedback
- **QR Code**: Geração automática de QR codes para mesas
- **WhatsApp**: Integração com WhatsApp Business API
- **Tablet**: Interface touch-friendly para tablets nas mesas

### 📊 Dashboard de Análise
- **NPS (Net Promoter Score)**: Cálculo automático e visualização
- **Métricas de Satisfação**: Gráficos e relatórios detalhados
- **Análise Temporal**: Tendências e comparações por período

### 💬 Gestão de Respostas
- **Reclamações**: Sistema de tickets para resolver problemas
- **Elogios**: Destaque para feedbacks positivos
- **Respostas Automáticas**: Templates personalizáveis

### 🎁 Sistema de Recompensas
- **Cupons de Desconto**: Geração automática baseada em feedback
- **Programa de Fidelidade**: Pontos por avaliações
- **Promoções Personalizadas**: Ofertas baseadas no histórico

### 🗄️ Banco de Dados
- **Avaliações**: Armazenamento seguro de todos os feedbacks
- **Clientes**: Perfis e histórico de interações
- **Analytics**: Dados para relatórios e insights

### 🔐 Autenticação
- **Login Seguro**: Sistema de autenticação para donos
- **Níveis de Acesso**: Diferentes permissões por usuário
- **Recuperação de Senha**: Sistema de reset seguro

## Tecnologias Utilizadas

- **Frontend**: React.js com Material-UI
- **Backend**: Node.js com Express
- **Banco de Dados**: PostgreSQL
- **Autenticação**: JWT (JSON Web Tokens)
- **QR Code**: qrcode.js
- **Charts**: Chart.js
- **WhatsApp**: WhatsApp Business API

## Estrutura do Projeto

```
├── frontend/          # Interface do usuário
├── backend/           # API e lógica de negócio
├── database/          # Scripts e migrações do BD
├── docs/              # Documentação
└── deployment/        # Configurações de deploy
```

## Como Executar

1. Clone o repositório
2. Instale as dependências: `npm install`
3. Configure o banco de dados
4. Execute o backend: `npm run server`
5. Execute o frontend: `npm run client`

## Licença

MIT License