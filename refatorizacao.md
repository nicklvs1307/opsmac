# Plano de Refatoração do Frontend

Este documento detalha o plano para refatorar o frontend da aplicação, com foco em melhores práticas, estruturação, eficiência, escalabilidade e padronização. Cada passo será marcado como "feito" após sua conclusão.

## 1. Análise da Estrutura Atual do Frontend (Feito)

### 1.1. Visão Geral

A estrutura atual do frontend é baseada em React e demonstra uma organização sólida, seguindo muitas das melhores práticas modernas.

**Pontos Fortes Identificados:**

*   **Ecossistema React Moderno**: Utiliza `react-router-dom` (v6), `react-query` (para gerenciamento de estado do servidor e data fetching), `react-hot-toast` (para notificações) e `react-i18next` (para internacionalização). Todas são bibliotecas atuais e amplamente utilizadas na indústria.
*   **Estrutura de Diretórios Clara**: A separação de responsabilidades é evidente com diretórios dedicados para `api`, `assets`, `components`, `config`, `contexts`, `hooks`, `locales`, `pages`, e `utils`. Isso facilita a localização e manutenção do código.
*   **Gerenciamento de Estado Global**: O uso da Context API (`AuthProvider`, `ThemeProvider`) para gerenciar estados globais como autenticação e tema é uma abordagem eficaz e escalável para muitas aplicações.
*   **Camada de API Bem Definida**:
    *   Utiliza Axios com uma `axiosInstance` centralizada, que inclui um interceptor de requisição para anexar tokens de autenticação (Bearer Token do `localStorage`). Isso garante que todas as chamadas de API sejam autenticadas de forma consistente e segura.
    *   As chamadas de API são modularizadas em arquivos de serviço (ex: `adminService.js`), promovendo reusabilidade e organização.
    *   As operações assíncronas são tratadas com `async/await`, resultando em código limpo e legível.
*   **Roteamento e Proteção de Rotas**: O `react-router-dom` é bem implementado, com rotas públicas e protegidas. O componente `ProtectedRoute` é uma excelente prática para controlar o acesso com base na autenticação e papéis do usuário.
*   **Componentização**: A presença de um componente `Layout` e a organização das páginas em diretórios específicos (`Auth`, `Dashboard`, `ERP`, etc.) indicam uma boa estratégia de componentização.
*   **Internacionalização**: A integração com `react-i18next` desde o `index.js` demonstra preocupação com a capacidade de suportar múltiplos idiomas.

### 1.2. Estratégia de Estilização Atual

A abordagem de estilização atual é uma mistura de:

*   **Estilos Base Globais**: Definidos em `index.css` (resets, tipografia, scrollbar, algumas classes utilitárias básicas).
*   **Estilos Específicos de Página/Componente**: Definidos em arquivos CSS co-localizados (ex: `Menu.css`), utilizando classes e variáveis CSS.

## 2. Refinamento da Estratégia de Estilização (Em Andamento)

### 2.1. Visão da Nova Arquitetura (Baseado em `update.txt`)

A nova arquitetura proposta em `update.txt` sugere uma estrutura modular e escalável, com foco em domínios (`features`) e elementos reutilizáveis (`shared`). Isso impacta diretamente a estratégia de estilização, direcionando para uma abordagem mais granular e controlada.

**Estrutura Relevante de `update.txt`:**

```
/src
  /app
    /providers
    /routes
  /features
    /auth
      /components
      /hooks
      /services
      /types
      index.ts
    /orders
      /components
      /hooks
      /services
      /types
  /shared
    /components    -> botões, inputs, modais (reutilizáveis)
    /hooks
    /lib           -> config de libs externas (axios, react-query)
    /styles        -> tema global, tailwind config, variáveis css
    /utils
```

### 2.2. Proposta de Estratégia de Estilização Modular e Escalável

Com base na análise atual e na visão da nova arquitetura, propomos a seguinte estratégia de estilização:

1.  **Adoção do Tailwind CSS para Estilização Utilitária e Rápida:**
    *   **Justificativa**: A menção explícita de "tailwind config" em `/shared/styles` na nova arquitetura indica uma preferência por uma abordagem utilitária. O Tailwind CSS é altamente configurável, oferece classes de baixo nível para construir qualquer design diretamente no markup, e é excelente para prototipagem rápida e consistência visual. Ele substituirá e expandirá as classes utilitárias básicas existentes em `index.css`.
    *   **Localização**: A configuração do Tailwind e quaisquer estilos base globais (como resets) serão gerenciados em `/src/shared/styles`.

2.  **CSS Modules para Componentes Específicos de `features`:**
    *   **Justificativa**: Para componentes que são específicos de um domínio (`/src/features/*/components`), o CSS Modules é a escolha ideal. Ele garante que os estilos sejam automaticamente escopados localmente, eliminando conflitos de nomes de classes e tornando os estilos verdadeiramente modulares e fáceis de manter dentro de cada feature.
    *   **Localização**: Arquivos `.module.css` co-localizados com os componentes dentro de suas respectivas pastas de `features`.

3.  **Design System e Componentes Reutilizáveis em `/shared/components`:**
    *   **Justificativa**: Para componentes de UI genéricos e reutilizáveis em toda a aplicação (ex: botões, inputs, modais, cards), que residirão em `/src/shared/components`, é crucial ter uma abordagem de estilização consistente.
    *   **Abordagem**: Estes componentes podem ser estilizados usando uma combinação de Tailwind CSS (para utilitários) e CSS Modules (para estilos mais complexos e específicos do componente). Alternativamente, se houver uma preferência futura por CSS-in-JS para esses componentes compartilhados, essa seria a localização para tal implementação.

4.  **Centralização de Estilos Globais e Variáveis CSS:**
    *   **Justificativa**: Manter os estilos globais (como resets, fontes base) e as variáveis CSS (cores, espaçamentos) em um local centralizado facilita a gestão do tema e a consistência visual.
    *   **Localização**: Todos os estilos globais e variáveis CSS serão consolidados em `/src/shared/styles`.

---

## 3. Remoção de Código Morto e Obsoleto (Cross-cutting Concern)

Durante cada etapa da refatoração, será dada atenção especial à identificação e remoção de código que não é mais utilizado, é redundante ou obsoleto. Isso inclui:

*   **Arquivos não utilizados**: CSS, JavaScript, imagens ou outros assets que não são referenciados em nenhum lugar.
*   **Funções e variáveis não utilizadas**: Dentro dos arquivos JavaScript e CSS.
*   **Estilos redundantes ou sobrescritos**: Classes CSS que não têm efeito ou são completamente substituídas por outras.
*   **Dependências não utilizadas**: Pacotes npm que não são mais necessários.
*   **Código comentado excessivo**: Remover blocos de código comentados que não servem a um propósito de documentação.

Esta será uma atividade contínua, garantindo que a base de código permaneça limpa e eficiente.

---

## 4. Configuração de Ambiente (Pré-requisito para Validação)

Para garantir que o frontend possa ser validado corretamente tanto em ambiente de desenvolvimento (localhost) quanto em produção (VPS), é crucial que a comunicação com o backend seja configurada de forma robusta.

### 4.1. Análise da Configuração Atual

*   O projeto utiliza `react-scripts` (Create React App).
*   Em desenvolvimento (`npm start`), o `package.json` possui uma configuração de `"proxy": "http://localhost:5000"`. Isso faz com que as requisições de API relativas (ex: `/api/users`) sejam automaticamente redirecionadas para `http://localhost:5000`.
*   Em produção (`npm run build`), o script de build em `package.json` define explicitamente `"build": "REACT_APP_API_URL=https://feedelizaapi.towersfy.com react-scripts build"`. Isso garante que a URL da API seja embutida no build final.

### 4.2. Problema Identificado

O problema de conectividade na VPS provavelmente ocorre se:

*   Uma versão de desenvolvimento (não um build de produção) está sendo executada na VPS, onde o `proxy` não funciona.
*   A URL `https://feedelizaapi.towersfy.com` não é acessível ou não é a URL correta do backend na VPS.
*   O ambiente da VPS não está configurado para definir a variável de ambiente `REACT_APP_API_URL` corretamente antes do build, caso a URL seja dinâmica.

### 4.3. Solução Proposta

A configuração atual é padrão e robusta para o Create React App. A solução envolve garantir o uso correto e a configuração da variável de ambiente `REACT_APP_API_URL`.

*   **Para Desenvolvimento Local (localhost):**
    *   Continue usando `npm start`. O `proxy` em `package.json` cuidará das requisições para `http://localhost:5000`.
    *   **Opcional**: Se preferir explicitar a URL da API para desenvolvimento ou se tiver chamadas de API absolutas, crie um arquivo `.env.development` na raiz do diretório `frontend` com o seguinte conteúdo:
        ```
        REACT_APP_API_URL=http://localhost:5000
        ```

*   **Para Implantação em Produção (VPS):**
    *   **Sempre utilize `npm run build`**: Este comando garante que a variável `REACT_APP_API_URL` seja embutida no build final da aplicação.
    *   **Verifique a Acessibilidade da URL**: Certifique-se de que `https://feedelizaapi.towersfy.com` é a URL correta e acessível do seu backend a partir da VPS.
    *   **Para URLs Dinâmicas na VPS**: Se a URL do backend na VPS for diferente ou precisar ser dinâmica (ex: em um pipeline de CI/CD):
        *   **Opção A (Simples)**: Altere o script `build` no `package.json` do frontend para a URL correta da sua VPS:
            ```json
            "build": "REACT_APP_API_URL=https://sua-url-backend-vps.com react-scripts build",
            ```
        *   **Opção B (Avançada)**: Configure seu pipeline de CI/CD ou o script de deploy na VPS para definir a variável de ambiente `REACT_APP_API_URL` *antes* de executar `npm run build`. Exemplo em um script shell:
            ```bash
            export REACT_APP_API_URL=https://sua-url-backend-vps.com
            npm run build
            ```

---

**Próximo Passo:**

Por favor, revise a seção **4. Configuração de Ambiente** e aplique as configurações necessárias para que seu frontend possa se comunicar corretamente com o backend tanto em desenvolvimento quanto em produção. Uma vez que a conectividade esteja validada, poderemos prosseguir com o teste da configuração do Tailwind CSS (Passo 2.3.4).

**Ações Pendentes para o Passo 2.3.4 (Teste da Configuração do Tailwind CSS):**

*   **Reverter Alterações em `App.js`**: Remover as classes Tailwind de teste adicionadas anteriormente.

