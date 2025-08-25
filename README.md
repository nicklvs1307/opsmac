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


4. Implantação em Produção (Docker Swarm/Portainer):

   * Crucial: Antes de implantar, você DEVE criar os Docker Secrets em seu Docker Swarm.

   1     echo "sua_senha_do_banco_de_producao" | docker secret create db_password -
   2     echo "sua_chave_jwt_secreta_de_producao" | docker secret create jwt_secret -
      Substitua sua_senha_do_banco_de_producao e sua_chave_jwt_secreta_de_producao pelos seus segredos
  de produção reais.
   * Certifique-se de que seu arquivo docker-compose.yml na VPS seja o atualizado.
   * Se você tiver outras variáveis de ambiente não secretas para produção (por exemplo,
     NODE_ENV=production, FRONTEND_URL=https://your-production-frontend.com), você pode:
       * Defini-las diretamente no Portainer ao implantar a stack.
       * Ou, criar um arquivo .env em sua VPS ao lado do `docker-compose.yml` com essas variáveis não
         secretas específicas de produção.
   * Implante sua stack usando Portainer ou docker stack deploy -c docker-compose.yml your_stack_name.

   ✦ Configuração do Traefik (exemplo, pode variar)
  Você precisa ter o Traefik rodando como um serviço no seu Swarm.
  Este docker-compose.yml não inicia o Traefik, apenas o utiliza.
  Exemplo de como iniciar o Traefik:
  docker network create -d overlay traefik-public
  docker stack deploy -c traefik-stack.yml traefik
  (onde traefik-stack.yml contém a configuração do Traefik)
  #
  Para criar os secrets no Docker Swarm:
  echo "your_db_password" | docker secret create db_password -
  echo "your_jwt_secret" | docker secret create jwt_secret -
  #
  Para rodar localmente com docker-compose:
  docker-compose up --build
  #
  Para deploy em produção com Docker Swarm:
  docker stack deploy -c docker-compose.yml feedeliza
  #
  Para parar o stack:
  docker stack rm feedeliza
  #
  Para inspecionar os logs de um serviço:
  docker service logs -f feedeliza_backend
  #
  Para escalar um serviço:
  docker service scale feedeliza_backend=3
  #
  Para remover os secrets:
  docker secret rm db_password jwt_secret
  #
  Para remover a rede:
  docker network rm traefik-public
  #
  Para remover os volumes:
  docker volume rm feedeliza_uploads_data feedeliza_postgres_data
  #
  Para remover as imagens:
  docker rmi feedeliza-backend:latest feedeliza-frontend:latest
  #
  Para remover tudo (cuidado!):
  docker stack rm feedeliza && docker secret rm db_password jwt_secret && docker volume rm feedeliza_uploads_data 
  feedeliza_postgres_data && docker network rm traefik-public && docker rmi feedeliza-backend:latest 
  feedeliza-frontend:latest
  #
  Para rodar as migrações manualmente em produção:
  docker service create --name feedeliza-migrations --network traefik-public --env-file .env --secret db_password -e 
  DB_PASSWORD_FILE=/run/secrets/db_password --restart-condition=none feedeliza-backend:latest /bin/sh -c "npx 
  sequelize-cli db:migrate --config config/config.js --migrations-path migrations --models-path backend/models && npx 
  sequelize-cli db:seed:all --config config/config.js --seeders-path seeders"
  #
  Para rodar um comando dentro de um container (ex: bash):
  docker container exec -it <container_id> /bin/sh
  #
  Para ver os containers rodando:
  docker container ls
  #
  Para ver os serviços do stack:
  docker stack services feedeliza
  #
  Para ver as tarefas de um serviço:
  docker service ps feedeliza_backend
  #
  Para ver os logs de um container específico:
  docker logs <container_id>
  #
  Para inspecionar a configuração de um serviço:
  docker service inspect feedeliza_backend
  #
  Para inspecionar a configuração de uma rede:
  docker network inspect traefik-public
  #
  Para inspecionar a configuração de um volume:
  docker volume inspect feedeliza_uploads_data
  #
  Para inspecionar a configuração de um secret:
  docker secret inspect db_password
  #
  Para listar todos os stacks:
  docker stack ls
  #
  Para listar todos os serviços:
  docker service ls
  #
  Para listar todas as tarefas:
  docker task ls
  #
  Para listar todas as redes:
  docker network ls
  #
  Para listar todos os volumes:
  docker volume ls
  #
  Para listar todos os secrets:
  docker secret ls
  #
  Para listar todas as imagens:
  docker image ls
  #
  Para remover containers parados:
  docker container prune
  #
  Para remover imagens não utilizadas:
  docker image prune -a
  #
  Para remover volumes não utilizados:
  docker volume prune
  #
  Para remover redes não utilizadas:
  docker network prune
  #
  Para remover o cache de build:
  docker builder prune
  #
  Para limpar tudo (cuidado!):
  docker system prune -a --volumes
  #
  Lembre-se de substituir os valores de exemplo pelos seus valores de produção.
  #
  Este arquivo é um exemplo e pode precisar de ajustes para o seu ambiente específico.
  #
  Boa sorte!
  #
  - Feedeliza+
  #
  Fim do arquivo.
  #
  Obrigado por usar o Feedeliza+!
  #
  Se precisar de ajuda, entre em contato com o suporte.
  #
  https://feedeliza.com.br