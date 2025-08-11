import React from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, CircularProgress, Alert, Card, CardContent, CardMedia, Grid } from '@mui/material';
import { useQuery } from 'react-query';
import axiosInstance from '../../api/axiosInstance';

const fetchDeliveryMenu = async (restaurantSlug) => {
  const { data } = await axiosInstance.get(`/api/public/products/delivery/${restaurantSlug}`);
  return data;
};

const PublicDeliveryMenu = () => {
  const { restaurantSlug } = useParams();

  const { data: menuItems, isLoading, isError } = useQuery(
    ['deliveryMenu', restaurantSlug],
    () => fetchDeliveryMenu(restaurantSlug),
    {
      enabled: !!restaurantSlug,
    }
  );

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Alert severity="error">Erro ao carregar o cardápio. Verifique o link ou tente novamente mais tarde.</Alert>
      </Box>
    );
  }

  if (!menuItems || menuItems.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography variant="h6">Nenhum item encontrado para este cardápio de delivery.</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom align="center">
        Cardápio de Delivery
      </Typography>
      <Grid container spacing={3}>
        {menuItems.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.id}>
            <Card>
              {/* You might add an image here if product has an image field */}
              {/* <CardMedia
                component="img"
                height="140"
                image={item.imageUrl || '/placeholder.png'}
                alt={item.name}
              /> */}
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  {item.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.description}
                </Typography>
                <Typography variant="h6" color="primary" mt={2}>
                  R$ {item.price.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default PublicDeliveryMenu;