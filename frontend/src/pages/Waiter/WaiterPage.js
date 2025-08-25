import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../contexts/AuthContext';
import api from '../../api/axiosInstance';
import { Grid, Card, CardContent, Typography, Button, Box, Container } from '@mui/material';

const WaiterPage = () => {
  const { user, logout } = useAuth();
  const [tables, setTables] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const restaurantId = user?.restaurant?.id;

  useEffect(() => {
    if (restaurantId) {
      const fetchTables = async () => {
        try {
          // Waiters will need a specific endpoint to get tables, let's assume one exists or will be created.
          // For now, let's reuse the admin endpoint, assuming permissions are handled on the backend.
          const response = await api.get(`/restaurant/${restaurantId}/tables`); // This endpoint might need to be created
          setTables(response.data);
        } catch (err) {
          setError('Erro ao buscar mesas.');
        }
      };
      fetchTables();
    }
  }, [restaurantId]);

  const handleSelectTable = (tableId) => {
    navigate(`/waiter/order/${tableId}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Mesas</Typography>
        <Button variant="outlined" onClick={handleLogout}>
          Sair
        </Button>
      </Box>
      {error && <Typography color="error">{error}</Typography>}
      <Grid container spacing={3}>
        {tables.map((table) => (
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
