import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/providers/contexts/AuthContext';
import {
  Container,
  Typography,
  Button,
  Box,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Paper,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import toast from 'react-hot-toast';

import { useWaiterProducts, useCreateWaiterOrder } from '@/features/Waiter/api/orderQueries';

const OrderPage = () => {
  const { tableId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [cart, setCart] = useState([]);

  const restaurantId = user?.restaurant?.id;

  const {
    data: products,
    isLoading: isLoadingProducts,
    isError: isErrorProducts,
    error: productsError,
  } = useWaiterProducts(restaurantId, {
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Erro ao buscar produtos.');
    },
  });

  const createOrderMutation = useCreateWaiterOrder({
    onSuccess: () => {
      navigate('/waiter');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Erro ao criar o pedido. Tente novamente.');
    },
  });

  const addToCart = (product) => {
    setCart((prevCart) => {
      const itemInCart = prevCart.find((item) => item.id === product.id);
      if (itemInCart) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => {
      const itemInCart = prevCart.find((item) => item.id === productId);
      if (itemInCart.quantity === 1) {
        return prevCart.filter((item) => item.id !== productId);
      }
      return prevCart.map((item) =>
        item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
      );
    });
  };

  const handleCreateOrder = () => {
    if (cart.length === 0) {
      toast.error('O carrinho está vazio.');
      return;
    }
    createOrderMutation.mutate({
      restaurantId,
      orderData: {
        table_id: tableId,
        items: cart.map((item) => ({ product_id: item.id, quantity: item.quantity })),
      },
    });
  };

  if (isLoadingProducts) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (isErrorProducts) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Alert severity="error">{productsError?.message || 'Erro ao carregar produtos.'}</Alert>
      </Box>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Novo Pedido para Mesa {tableId}
      </Typography>
      <Grid container spacing={4}>
        <Grid item xs={12} md={7}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6">Produtos</Typography>
            <List sx={{ maxHeight: '60vh', overflow: 'auto' }}>
              {products?.map((product) => (
                <ListItem
                  key={product.id}
                  secondaryAction={
                    <IconButton edge="end" color="primary" onClick={() => addToCart(product)}>
                      <AddCircleIcon />
                    </IconButton>
                  }
                >
                  <ListItemText primary={product.name} secondary={`R$ ${product.price}`} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6">Carrinho</Typography>
            <List>
              {cart.map((item) => (
                <ListItem key={item.id}>
                  <ListItemText primary={`${item.name} (x${item.quantity})`} />
                  <IconButton size="small" onClick={() => removeFromCart(item.id)}>
                    <RemoveCircleIcon />
                  </IconButton>
                  <IconButton size="small" onClick={() => addToCart(item)}>
                    <AddCircleIcon />
                  </IconButton>
                </ListItem>
              ))}
            </List>
            {cart.length > 0 && (
              <Button
                variant="contained"
                fullWidth
                sx={{ mt: 2 }}
                onClick={handleCreateOrder}
                disabled={createOrderMutation.isLoading}
              >
                {createOrderMutation.isLoading ? (
                  <CircularProgress size={20} />
                ) : (
                  'Finalizar Pedido'
                )}
              </Button>
            )}
          </Paper>
        </Grid>
      </Grid>
      {createOrderMutation.isError && (
        <Typography color="error" sx={{ mt: 2 }}>
          {createOrderMutation.error?.message || 'Erro ao criar o pedido.'}
        </Typography>
      )}
      <Button sx={{ mt: 2 }} onClick={() => navigate('/waiter')}>
        Voltar para Mesas
      </Button>
    </Container>
  );
};

export default OrderPage;
