import React from 'react';
import { Box, Typography, Paper, CircularProgress, Alert, List, ListItem, ListItemText } from '@mui/material';
import { useQuery } from 'react-query';
import axiosInstance from '../../api/axiosInstance';

const fetchBirthdays = async () => {
  const { data } = await axiosInstance.get('/api/customers/birthdays', {
    headers: {
      'x-api-key': localStorage.getItem('api-key') || '', // Ou de onde você obtém sua API Key
    },
  });
  return data;
};

const CustomerBirthdays = () => {
  const { data, isLoading, error } = useQuery('customerBirthdays', fetchBirthdays);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">Erro ao carregar aniversariantes: {error.message}</Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Aniversariantes do Mês
      </Typography>
      <Paper elevation={1} sx={{ p: 2 }}>
        {data && data.length > 0 ? (
          <List>
            {data.map((customer) => (
              <ListItem key={customer.id}>
                <ListItemText 
                  primary={customer.name}
                  secondary={`Email: ${customer.email || 'N/A'} | Telefone: ${customer.phone || 'N/A'}`}
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography variant="body1">
            Nenhum cliente faz aniversário este mês.
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default CustomerBirthdays;