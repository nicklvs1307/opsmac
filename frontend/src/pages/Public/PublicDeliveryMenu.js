import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import axiosInstance from '../../api/axiosInstance';
import { Box, Typography, CircularProgress, Alert, Card, CardContent, CardMedia, Grid, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Tabs, Tab, AppBar, Toolbar, IconButton, Divider, Paper, Container, useTheme, useMediaQuery, Zoom, Fade, Chip, Slide, Fab, List, ListItem, ListItemText, ListItemAvatar, Avatar, BottomNavigation, BottomNavigationAction, ThemeProvider, createTheme, InputAdornment } from '@mui/material';
import { Restaurant as RestaurantIcon, ShoppingCart as ShoppingCartIcon, Search as SearchIcon, Add as AddIcon, Remove as RemoveIcon, Close as CloseIcon } from '@mui/icons-material';

const fetchDeliveryMenu = async (restaurantSlug) => {
    const { data } = await axiosInstance.get(`/api/public/products/delivery/${restaurantSlug}`);
    const groupedByCategory = data.reduce((acc, product) => {
      const category = product.Category?.name || 'Outros';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(product);
      return acc;
    }, {});
    return { products: data, categories: groupedByCategory, restaurant: data[0]?.restaurant };
  };

const deliveryTheme = createTheme({
  palette: {
    primary: { main: '#E31837' },
    secondary: { main: '#1A1A1A' },
    accent: { main: '#FFD700' },
  },
  typography: {
    fontFamily: 'Montserrat, sans-serif',
  },
});

const PublicDeliveryMenu = () => {
  const { restaurantSlug } = useParams();
  const [cartItems, setCartItems] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { data: menuData, isLoading, isError } = useQuery(
    ['deliveryMenu', restaurantSlug],
    () => fetchDeliveryMenu(restaurantSlug),
    { enabled: !!restaurantSlug }
  );

  const addToCart = (item) => {
    setCartItems((prev) => {
      const exist = prev.find((x) => x.id === item.id);
      if (exist) {
        return prev.map((x) =>
          x.id === item.id ? { ...exist, quantity: exist.quantity + 1 } : x
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (item) => {
    setCartItems((prev) =>
      prev.reduce((acc, x) => {
        if (x.id === item.id) {
          if (x.quantity === 1) return acc;
          return [...acc, { ...x, quantity: x.quantity - 1 }];
        }
        return [...acc, x];
      }, [])
    );
  };

  const filteredProducts = menuData?.products.filter(p => 
    (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (selectedCategory === 'all' || p.Category?.name === selectedCategory)
  );

  const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const totalItemsInCart = cartItems.reduce((total, item) => total + item.quantity, 0);

  if (isLoading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh"><CircularProgress /></Box>;
  if (isError) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh"><Alert severity="error">Erro ao carregar cardápio.</Alert></Box>;

  return (
    <ThemeProvider theme={deliveryTheme}>
      <Box sx={{ maxWidth: '500px', margin: '0 auto', backgroundColor: '#F8F8F8', minHeight: '100vh' }}>
        <AppBar position="sticky" sx={{ backgroundColor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <Toolbar>
            <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
              <RestaurantIcon sx={{ color: 'accent.main' }} />
              {menuData.restaurant?.name || 'Don Fonseca'}
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            <IconButton onClick={() => setCartOpen(true)}>
              <ShoppingCartIcon />
              {totalItemsInCart > 0 && <Chip label={totalItemsInCart} size="small" sx={{ position: 'absolute', top: 0, right: 0, backgroundColor: 'primary.main', color: 'white' }} />}
            </IconButton>
          </Toolbar>
        </AppBar>

        <Box sx={{ p: 2, backgroundColor: 'primary.main', color: 'white', textAlign: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>🚀 Delivery Turbo</Typography>
          <Typography variant="body2">Entregamos em 35 minutos ou 20% de desconto!</Typography>
        </Box>

        <Box sx={{ p: 2, position: 'sticky', top: 64, zIndex: 900, backgroundColor: '#F8F8F8' }}>
          <TextField 
            fullWidth 
            placeholder="Buscar hambúrguer, porção, bebida..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
              sx: { borderRadius: '12px', backgroundColor: 'white' }
            }}
          />
        </Box>

        <Box sx={{ px: 2, pb: 2, position: 'sticky', top: 130, zIndex: 800, backgroundColor: '#F8F8F8' }}>
          <Box sx={{ display: 'flex', overflowX: 'auto', gap: 1, pb: 1 }}>
            <Chip label="Tudo" onClick={() => setSelectedCategory('all')} color={selectedCategory === 'all' ? 'primary' : 'default'} />
            {Object.keys(menuData.categories).map(cat => (
              <Chip key={cat} label={cat} onClick={() => setSelectedCategory(cat)} color={selectedCategory === cat ? 'primary' : 'default'} />
            ))}
          </Box>
        </Box>

        <Box sx={{ p: 2 }}>
          <Grid container spacing={2}>
            {filteredProducts?.map(item => (
              <Grid item xs={12} sm={6} key={item.id}>
                <Card sx={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  <CardMedia component="img" height="140" image={item.imageUrl || `https://source.unsplash.com/random/300x200?food&sig=${item.id}`} alt={item.name} />
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>{item.name}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ minHeight: 40 }}>{item.description}</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main' }}>R$ {Number(item.price).toFixed(2)}</Typography>
                      <IconButton onClick={() => addToCart(item)} sx={{ backgroundColor: 'primary.main', color: 'white', '&:hover': { backgroundColor: 'primary.dark' } }}><AddIcon /></IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {totalItemsInCart > 0 && (
          <Paper sx={{ position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', width: 'calc(100% - 32px)', maxWidth: 500, borderRadius: '50px', p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'primary.main', color: 'white', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip label={totalItemsInCart} sx={{ backgroundColor: 'white', color: 'primary.main', fontWeight: 700 }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>R$ {cartTotal.toFixed(2)}</Typography>
            </Box>
            <Button onClick={() => setCartOpen(true)} variant="contained" sx={{ backgroundColor: 'white', color: 'primary.main', borderRadius: '20px', fontWeight: 700, '&:hover': { backgroundColor: '#f0f0f0' } }}>Ver Carrinho</Button>
          </Paper>
        )}

        <Dialog open={cartOpen} onClose={() => setCartOpen(false)} fullScreen={useMediaQuery(theme.breakpoints.down('sm'))} PaperProps={{ sx: { borderRadius: { sm: '24px' } } }}>
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Seu Pedido
            <IconButton onClick={() => setCartOpen(false)}><CloseIcon /></IconButton>
          </DialogTitle>
          <DialogContent dividers>
            {cartItems.map(item => (
              <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
                <Avatar src={item.imageUrl} sx={{ width: 80, height: 80, borderRadius: '10px' }} />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography sx={{ fontWeight: 700 }}>{item.name}</Typography>
                  <Typography color="primary" sx={{ fontWeight: 700 }}>R$ {(item.price * item.quantity).toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconButton size="small" onClick={() => removeFromCart(item)}><RemoveIcon /></IconButton>
                  <Typography>{item.quantity}</Typography>
                  <IconButton size="small" onClick={() => addToCart(item)}><AddIcon /></IconButton>
                </Box>
              </Box>
            ))}
          </DialogContent>
          <DialogActions sx={{ flexDirection: 'column', p: 2 }}>
            <Box sx={{ width: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography>Subtotal</Typography><Typography>R$ {cartTotal.toFixed(2)}</Typography></Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography>Taxa de Entrega</Typography><Typography>R$ 5.00</Typography></Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography variant="h6" sx={{ fontWeight: 700 }}>Total</Typography><Typography variant="h6" sx={{ fontWeight: 700 }}>R$ {(cartTotal + 5).toFixed(2)}</Typography></Box>
            </Box>
            <Button fullWidth variant="contained" sx={{ mt: 2, py: 1.5, borderRadius: '12px', fontWeight: 700 }}>Finalizar Pedido</Button>
          </DialogActions>
        </Dialog>

      </Box>
    </ThemeProvider>
  );
};

export default PublicDeliveryMenu;
