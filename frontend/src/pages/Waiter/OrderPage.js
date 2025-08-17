import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import api from '../../api';
import { 
    Container, Typography, Button, Box, List, ListItem, ListItemText, 
    IconButton, Paper, Grid 
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';

const OrderPage = () => {
  const { tableId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [error, setError] = useState('');

  const restaurantId = user?.restaurant?.id;

  useEffect(() => {
    if (restaurantId) {
        const fetchProducts = async () => {
          try {
            const response = await api.get(`/restaurant/${restaurantId}/products`); // This endpoint might need to be created
            setProducts(response.data);
          } catch (err) {
            setError('Erro ao buscar produtos.');
          }
        };
        fetchProducts();
    }
  }, [restaurantId]);

  const addToCart = (product) => {
    setCart(prevCart => {
        const itemInCart = prevCart.find(item => item.id === product.id);
        if (itemInCart) {
            return prevCart.map(item => 
                item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
            );
        }
        return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => {
        const itemInCart = prevCart.find(item => item.id === productId);
        if (itemInCart.quantity === 1) {
            return prevCart.filter(item => item.id !== productId);
        }
        return prevCart.map(item => 
            item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
        );
    });
  };

  const handleCreateOrder = async () => {
    if (cart.length === 0) {
        setError('O carrinho está vazio.');
        return;
    }
    try {
        const orderResponse = await api.post(`/restaurant/${restaurantId}/orders`, { 
            table_id: tableId,
            items: cart.map(item => ({ product_id: item.id, quantity: item.quantity }))
        });
        navigate('/waiter');
    } catch (err) {
        setError('Erro ao criar o pedido. Tente novamente.');
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>Novo Pedido para Mesa {tableId}</Typography>
        <Grid container spacing={4}>
            <Grid item xs={12} md={7}>
                <Paper elevation={2} sx={{ p: 2 }}>
                    <Typography variant="h6">Produtos</Typography>
                    <List sx={{ maxHeight: '60vh', overflow: 'auto' }}>
                        {products.map(product => (
                            <ListItem key={product.id} secondaryAction={
                                <IconButton edge="end" color="primary" onClick={() => addToCart(product)}>
                                    <AddCircleIcon />
                                </IconButton>
                            }>
                                <ListItemText 
                                    primary={product.name}
                                    secondary={`R$ ${product.price}`}
                                />
                            </ListItem>
                        ))}
                    </List>
                </Paper>
            </Grid>

            <Grid item xs={12} md={5}>
                <Paper elevation={2} sx={{ p: 2 }}>
                    <Typography variant="h6">Carrinho</Typography>
                    <List>
                        {cart.map(item => (
                            <ListItem key={item.id}>
                                <ListItemText primary={`${item.name} (x${item.quantity})`} />
                                <IconButton size="small" onClick={() => removeFromCart(item.id)}><RemoveCircleIcon /></IconButton>
                                <IconButton size="small" onClick={() => addToCart(item)}><AddCircleIcon /></IconButton>
                            </ListItem>
                        ))}
                    </List>
                    {cart.length > 0 && (
                        <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={handleCreateOrder}>
                            Finalizar Pedido
                        </Button>
                    )}
                </Paper>
            </Grid>
        </Grid>
        {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
        <Button sx={{ mt: 2 }} onClick={() => navigate('/waiter')}>Voltar para Mesas</Button>
    </Container>
  );
};

export default OrderPage;
