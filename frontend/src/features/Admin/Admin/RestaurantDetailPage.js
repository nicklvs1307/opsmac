import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Box, CircularProgress, Alert, Paper, Grid } from '@mui/material';
// import ModuleEditor from '@/shared/components/Admin/ModuleEditor'; // Commented out as file not found
import { default as apiClient } from '@/shared/lib/axiosInstance';

const RestaurantDetailPage = () => {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getRestaurant = async () => {
      try {
        setLoading(true);
        // const data = await adminApi.getRestaurantById(id);
        const response = await apiClient.get(`/api/admin/restaurants/${id}`);
        setRestaurant(response.data);
      } catch (err) {
        setError('Falha ao buscar detalhes do restaurante.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    getRestaurant();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!restaurant) {
    return <Alert severity="warning">Restaurante não encontrado.</Alert>;
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {restaurant.name}
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Detalhes
            </Typography>
            <Paper sx={{ p: 2 }}>
              <Typography variant="body1">
                <strong>ID:</strong> {restaurant.id}
              </Typography>
              <Typography variant="body1">
                <strong>Descrição:</strong> {restaurant.description}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Módulos Ativos
            </Typography>
            <Paper sx={{ p: 2 }}>
              {/* <ModuleEditor restaurantId={id} /> */}
              <Typography variant="body2" color="text.secondary">
                Funcionalidade de edição de módulos desabilitada temporariamente.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default RestaurantDetailPage;
