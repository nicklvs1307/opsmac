import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/providers/contexts/AuthContext';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Container,
  CircularProgress,
  Alert,
} from '@mui/material';
import toast from 'react-hot-toast';

import { useWaiterTables } from './api/waiterService';

const WaiterPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const restaurantId = user?.restaurant?.id;

  const {
    data: tables,
    isLoading: isLoadingTables,
    isError: isErrorTables,
    error: tablesError,
  } = useWaiterTables(restaurantId, {
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Erro ao buscar mesas.');
    },
  });

  const handleSelectTable = (tableId) => {
    navigate(`/waiter/order/${tableId}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (isLoadingTables) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (isErrorTables) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Alert severity="error">{tablesError?.message || 'Erro ao carregar mesas.'}</Alert>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Mesas</Typography>
        <Button variant="outlined" onClick={handleLogout}>
          Sair
        </Button>
      </Box>
      <Grid container spacing={3}>
        {tables?.map((table) => (
          <Grid item xs={12} sm={6} md={4} key={table.id}>
            <Card sx={{ bgcolor: table.is_active ? '#e8f5e9' : '#ffebee' }}>
              <CardContent>
                <Typography variant="h6">{table.name}</Typography>
                <Typography color="text.secondary">
                  Status: {table.is_active ? 'Livre' : 'Ocupada'}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ mt: 2 }}
                  onClick={() => handleSelectTable(table.id)}
                  disabled={!table.is_active}
                >
                  Criar Pedido
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default WaiterPage;
