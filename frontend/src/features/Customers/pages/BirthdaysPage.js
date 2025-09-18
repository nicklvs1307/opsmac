import React from 'react';
import { usePermissions } from '../../../hooks/usePermissions';
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
import { useCustomerBirthdays } from '@/features/Customers/api/customerService';
import { useAuth } from '@/app/providers/contexts/AuthContext';

const BirthdaysPage = () => {
  const { can } = usePermissions();
  const { user } = useAuth();
  const restaurantId = user?.restaurants?.[0]?.id;
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
        {birthdays && birthdays.length > 0 ? (
          <List>
            {birthdays.map((customer) => (
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

export default BirthdaysPage;
