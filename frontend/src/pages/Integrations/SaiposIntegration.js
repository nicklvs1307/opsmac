import React from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Divider } from '@mui/material';

const SaiposIntegration = () => {
  return (
    <Box>
      <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
        Configurações da Integração com o Saipos
      </Typography>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="body1" sx={{ mb: 2 }}>
          A Saipos é um sistema de gestão para restaurantes que oferece integrações com diversas plataformas, como sistemas de delivery e serviços de entrega.
        </Typography>
        <Typography variant="h6" component="h3" sx={{ mb: 1 }}>
          Pontos Chave para Integração:
        </Typography>
        <List dense>
          <ListItem>
            <ListItemText
              primary="1. Tipos de Integração:"
              secondary="As integrações com a Saipos geralmente envolvem sistemas de delivery (ex: iFood, Rappi), cardápios digitais e serviços de entrega."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="2. Credenciais:"
              secondary="Para realizar a integração, é comum a necessidade de IDs de parceiro, Client IDs, Client Secrets ou tokens de API, que são fornecidos pela Saipos ou pela plataforma parceira."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="3. Webhooks:"
              secondary="Algumas integrações podem utilizar webhooks para comunicação em tempo real, como para o status de pedidos."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="4. Documentação e Suporte:"
              secondary="A documentação da API da Saipos para integrações personalizadas não é publicamente disponível de forma abrangente. É fundamental entrar em contato direto com o suporte da Saipos para obter as informações e credenciais necessárias para a integração específica que você deseja realizar."
            />
          </ListItem>
        </List>
        <Divider sx={{ my: 2 }} />
        <Typography variant="body2" color="text.secondary">
          Para iniciar a integração com o Saipos, entre em contato com o suporte ou a equipe de parcerias da Saipos para obter a documentação e as credenciais apropriadas.
        </Typography>
      </Paper>
    </Box>
  );
};

export default SaiposIntegration;