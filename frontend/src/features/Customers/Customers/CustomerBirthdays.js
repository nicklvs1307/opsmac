import React from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { useCustomerBirthdays } from '@/features/Customers/api/customerQueries';

const CustomerBirthdays = () => {
  const { data: birthdays, isLoading, isError, error } = useCustomerBirthdays(restaurantId);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return <Alert severity="error">Erro ao carregar aniversariantes: {error.message}</Alert>;
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
          <Typography variant="body1">Nenhum cliente faz aniversário este mês.</Typography>
        )}
      </Paper>
    </Box>
  );
};

export default CustomerBirthdays;
