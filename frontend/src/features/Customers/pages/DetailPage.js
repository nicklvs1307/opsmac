import React from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, CircularProgress, Alert, Paper, Grid, Button } from '@mui/material';
import { useCustomerDetail } from '../api/customerService';
import { usePermissions } from '../../../hooks/usePermissions';

const DetailPage = () => {
  const { id } = useParams();
  const { can } = usePermissions();

  const {
    data: customer,
    isLoading,
    isError,
    error,
  } = useCustomerDetail(id);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return <Alert severity="error">Erro ao carregar detalhes do cliente: {error.message}</Alert>;
  }

  if (!customer) {
    return <Alert severity="warning">Cliente não encontrado.</Alert>;
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Detalhes do Cliente: {customer.name}
      </Typography>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" color="text.secondary">Nome:</Typography>
            <Typography variant="body1">{customer.name}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" color="text.secondary">Email:</Typography>
            <Typography variant="body1">{customer.email || 'N/A'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" color="text.secondary">Telefone:</Typography>
            <Typography variant="body1">{customer.phone || 'N/A'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" color="text.secondary">Data de Nascimento:</Typography>
            <Typography variant="body1">{customer.birth_date || 'N/A'}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle1" color="text.secondary">Preferências:</Typography>
            <Typography variant="body1">{customer.preferences || 'N/A'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" color="text.secondary">Total de Visitas:</Typography>
            <Typography variant="body1">{customer.total_visits || 0}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" color="text.secondary">Avaliação Média:</Typography>
            <Typography variant="body1">{customer.average_rating || 'N/A'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" color="text.secondary">Última Visita:</Typography>
            <Typography variant="body1">{customer.last_visit || 'N/A'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" color="text.secondary">Segmento:</Typography>
            <Typography variant="body1">{customer.segment || 'N/A'}</Typography>
          </Grid>
        </Grid>
      </Paper>
      {/* Exemplo de uso de permissão para um botão de edição na página de detalhes */}
      {can('customers', 'update') && (
        <Box sx={{ mt: 3 }}>
          <Button variant="contained" onClick={() => console.log('Editar cliente')}>
            Editar Cliente
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default DetailPage;