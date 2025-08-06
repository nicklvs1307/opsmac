import React from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Divider } from '@mui/material';

const DeliveryMuchIntegration = () => {
  return (
    <Box>
      <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
        Configurações da Integração com o Delivery Much
      </Typography>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="body1" sx={{ mb: 2 }}>
          A API Delivery Much permite a comunicação entre sistemas externos (PDVs, ERPs) e a plataforma Delivery Much para gerenciar pedidos, produtos e outras operações.
        </Typography>
        <Typography variant="h6" component="h3" sx={{ mb: 1 }}>
          Pontos Chave para Integração:
        </Typography>
        <List dense>
          <ListItem>
            <ListItemText
              primary="1. Autenticação OAuth2:"
              secondary="Utiliza o fluxo 'Resource Owner Password Credentials' (password grant) com client_id, client_secret, username e password da loja. Retorna um JWT."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="2. Ambientes Separados:"
              secondary="Possui ambientes distintos para desenvolvimento/teste e produção, com URLs de autenticação e API separadas."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="3. Comunicação Segura:"
              secondary="Toda a comunicação deve ser feita via HTTPS."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="4. Documentação e Credenciais:"
              secondary="A Delivery Much oferece um 'Portal do Desenvolvedor' e documentação via coleção Postman. Credenciais de desenvolvimento são fornecidas pela equipe de Engenharia, e as de produção após homologação e assinatura de termo."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="5. Funcionalidades:"
              secondary="Inclui recebimento de pedidos, criação de pedidos de teste, gerenciamento de produtos e informações sobre o fluxo de pedidos e meios de pagamento."
            />
          </ListItem>
        </List>
        <Divider sx={{ my: 2 }} />
        <Typography variant="body2" color="text.secondary">
          Para iniciar a integração, o primeiro passo é entrar em contato com a Delivery Much para obter as credenciais e a documentação detalhada.
        </Typography>
      </Paper>
    </Box>
  );
};

export default DeliveryMuchIntegration;