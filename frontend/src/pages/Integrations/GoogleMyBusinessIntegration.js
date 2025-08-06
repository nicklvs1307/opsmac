import React from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Divider } from '@mui/material';

const GoogleMyBusinessIntegration = () => {
  return (
    <Box>
      <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
        Configurações da Integração com o Google Meu Negócio
      </Typography>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="body1" sx={{ mb: 2 }}>
          A API do Google My Business (agora Google Business Profile API) permite gerenciar programaticamente a presença online de uma empresa no Google Search e Maps.
        </Typography>
        <Typography variant="h6" component="h3" sx={{ mb: 1 }}>
          Funcionalidades e Requisitos:
        </Typography>
        <List dense>
          <ListItem>
            <ListItemText
              primary="1. Gerenciamento de Localizações:"
              secondary="Adicionar, atualizar e remover informações de locais de negócios."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="2. Gerenciamento de Avaliações:"
              secondary="Ler e responder a avaliações de clientes diretamente pela API."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="3. Publicação de Postagens:"
              secondary="Criar e gerenciar postagens que aparecem no perfil da empresa."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="4. Acesso a Insights:"
              secondary="Obter dados sobre como os clientes interagem com o perfil da empresa."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="5. Autenticação:"
              secondary="A autenticação é feita via tokens OAuth 2.0. É necessário ter uma conta Google, um perfil no Google Meu Negócio, criar um projeto no Google API Console e solicitar acesso à API."
            />
          </ListItem>
        </List>
        <Divider sx={{ my: 2 }} />
        <Typography variant="body2" color="text.secondary">
          Para mais informações e documentação detalhada, consulte a documentação oficial da Google Business Profile API.
        </Typography>
      </Paper>
    </Box>
  );
};

export default GoogleMyBusinessIntegration;