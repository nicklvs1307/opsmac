import React from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Container,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useGetPublicMenu } from '../api/publicService';

const DineInMenu = () => {
  const { t } = useTranslation();
  const { restaurantSlug } = useParams();

  const { data: products, isLoading, isError, error } = useGetPublicMenu(restaurantSlug);

  const groupedProducts = products
    ? products.reduce((acc, product) => {
        const category = product.category || t('common.others');
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(product);
        return acc;
      }, {})
    : {};

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
        <Alert severity="error">
          {t('public_menu.error_loading_menu')}
          {error.response?.data?.msg || error.message}
        </Alert>
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" align="center" gutterBottom>
        {t('public_menu.our_menu_title')}
      </Typography>

      {Object.keys(groupedProducts).length > 0 ? (
        Object.entries(groupedProducts).map(([category, items]) => (
          <Box key={category} mb={4}>
            <Typography
              variant="h4"
              component="h2"
              gutterBottom
              sx={{ borderBottom: '2px solid', borderColor: 'primary.main', pb: 1 }}
            >
              {category}
            </Typography>
            <Grid container spacing={3}>
              {items.map((product) => (
                <Grid item xs={12} sm={6} md={4} key={product.id}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" component="h3" gutterBottom>
                        {product.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {product.description}
                      </Typography>
                      <Typography variant="h6" color="primary">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(product.price)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        ))
      ) : (
        <Typography align="center">{t('public_menu.no_products_found')}</Typography>
      )}
    </Container>
  );
};

export default DineInMenu;
