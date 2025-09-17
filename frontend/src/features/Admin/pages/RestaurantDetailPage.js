import React from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Box, CircularProgress, Alert, Paper, Grid } from '@mui/material';
import { useQuery } from 'react-query';
import { fetchRestaurants } from '../services/adminService';

const RestaurantDetailPage = () => {
  const { id } = useParams();

  const {
    data: restaurant,
    isLoading,
    isError,
    error,
  } = useQuery(['restaurant', id], () => fetchRestaurants(id), {
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return <Alert severity="error">Falha ao buscar detalhes do restaurante: {error.message}</Alert>;
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

        </Grid>
      </Box>
    </Container>
  );
};

export default RestaurantDetailPage;
