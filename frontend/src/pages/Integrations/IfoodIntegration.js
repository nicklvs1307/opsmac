import React from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Divider } from '@mui/material';

const IfoodIntegration = () => {
  return (
    <Box>
      <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
        Configurações da Integração com o Ifood
      </Typography>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Para integrar seu sistema com o Ifood, você precisará acessar o Portal do Desenvolvedor do Ifood, onde poderá gerenciar suas credenciais e configurar os módulos da API.
        </Typography>
        <Typography variant="h6" component="h3" sx={{ mb: 1 }}>
          Passos e Informações Importantes:
        </Typography>
        <List dense>
          <ListItem>
            <ListItemText
              primary="1. Portal do Desenvolvedor Ifood:"
              secondary="Acesse developer.ifood.com.br para registrar-se como desenvolvedor e criar sua aplicação."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="2. Módulos da API:"
              secondary="A API do Ifood é dividida em módulos como Autenticação, Merchant (lojas), Order (pedidos), Catalog (cardápio), Financial e Reviews."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="3. Autenticação:"
              secondary="Geralmente envolve o uso de Client ID e Client Secret para autenticação via OAuth 2.0 (client_credentials ou authorization_code)."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="4. Homologação:"
              secondary="Sua aplicação precisará passar por um processo de homologação para ser aprovada para uso em produção."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="5. Gerenciamento de Pedidos:"
              secondary="A API permite receber, confirmar e atualizar o status dos pedidos. É crucial implementar tratamento de erros e considerar o uso de webhooks para notificações em tempo real."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="6. Limites de Requisição (Rate Limits):"
              secondary="Esteja ciente dos limites de requisição para evitar bloqueios. Implemente retentativas com backoff exponencial para requisições que falharem."
            />
          </ListItem>
        </List>
        <Divider sx={{ my: 2 }} />
        <Typography variant="body2" color="text.secondary">
          Para detalhes completos e documentação técnica, consulte o Portal do Desenvolvedor Ifood.
        </Typography>
      </Paper>
    </Box>
  );
};

export default IfoodIntegration;