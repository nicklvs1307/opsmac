import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from 'react-query';
import axiosInstance from '../../api/axiosInstance';
import { Box, Typography, CircularProgress, Alert, Card, CardContent, CardMedia, Grid, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Tabs, Tab, AppBar, Toolbar, IconButton, Divider, Paper, Container, useTheme, useMediaQuery, Zoom, Fade, Chip, Slide, Fab, List, ListItem, ListItemText, ListItemAvatar, Avatar, BottomNavigation, BottomNavigationAction, ThemeProvider, createTheme, InputAdornment } from '@mui/material';
import { Restaurant as RestaurantIcon, ShoppingCart as ShoppingCartIcon, Search as SearchIcon, Add as AddIcon, Remove as RemoveIcon, Close as CloseIcon, Person as PersonIcon, Phone as PhoneIcon, Home as HomeIcon, Payment as PaymentIcon, Notes as NotesIcon } from '@mui/icons-material';
import toast from 'react-hot-toast';
import './PublicDeliveryMenu.css';

const fetchDeliveryMenu = async (restaurantSlug) => {
    const { data } = await axiosInstance.get(`/api/public/products/delivery/${restaurantSlug}`);
    const groupedByCategory = data.products.reduce((acc, product) => {
      const category = product.category?.name || 'Outros';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(product);
      return acc;
    }, {});
    return { ...data, categories: groupedByCategory };
};

const fetchRestaurantData = async (restaurantSlug) => {
    const { data } = await axiosInstance.get(`/public/restaurant/${restaurantSlug}`);
    return data;
};

const createDeliveryOrder = async (orderData) => {
    const { data } = await axiosInstance.post('/api/public/orders', orderData);
    return data;
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [cartItems, setCartItems] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [notes, setNotes] = useState('');

  const { data: menuData, isLoading, isError } = useQuery(
    ['deliveryMenu', restaurantSlug],
    () => fetchDeliveryMenu(restaurantSlug),
    { enabled: !!restaurantSlug }
  );

  const { data: restaurantData } = useQuery(
    ['restaurantData', restaurantSlug],
    () => fetchRestaurantData(restaurantSlug),
    { enabled: !!restaurantSlug }
  );

  const orderMutation = useMutation(createDeliveryOrder, {
      onSuccess: () => {
          toast.success('Pedido realizado com sucesso!');
          setCartItems([]);
          setCartOpen(false);
      },
      onError: () => {
          toast.error('Erro ao realizar o pedido.');
      }
  });

  const handleCheckout = () => {
    if (!customerName || !customerPhone || !deliveryAddress) {
        toast.error('Por favor, preencha seu nome, telefone e endereço.');
        return;
    }
    const orderData = {
        restaurant_id: restaurantData.id,
        delivery_type: 'delivery',
        total_amount: cartTotal,
        items: cartItems.map(item => ({ product_id: item.id, quantity: item.quantity, price: item.price, name: item.name })),
        customer_details: { name: customerName, phone: customerPhone },
        delivery_address: { address: deliveryAddress },
        payment_method: paymentMethod,
        notes: notes,
    };
    orderMutation.mutate(orderData);
  };

  const addToCart = (item) => {
    setCartItems((prev) => {
      const exist = prev.find((x) => x.id === item.id);
      if (exist) {
        return prev.map((x) => x.id === item.id ? { ...exist, quantity: exist.quantity + 1 } : x);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (item) => {
    setCartItems((prev) => prev.reduce((acc, x) => {
        if (x.id === item.id) {
            if (x.quantity === 1) return acc;
            return [...acc, { ...x, quantity: x.quantity - 1 }];
        }
        return [...acc, x];
    }, []));
  };

  const filteredProducts = menuData?.products.filter(p => 
    (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))) &&
    (selectedCategory === 'all' || p.category?.name === selectedCategory)
  );

  const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const totalItemsInCart = cartItems.reduce((total, item) => total + item.quantity, 0);

  if (isLoading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh"><CircularProgress /></Box>;
  if (isError) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh"><Alert severity="error">Erro ao carregar cardápio.</Alert></Box>;

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  return (
    <ThemeProvider theme={deliveryTheme}>
      <Box sx={{ maxWidth: '500px', margin: '0 auto', backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
        {/* Header */}
        <AppBar position="sticky" className="header">
          <Toolbar className="header-container">
            <Box className="logo">
                <RestaurantIcon sx={{ marginRight: '10px' }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white' }}>Meu Cardápio</Typography>
            </Box>
            <Box className="user-actions">
                <IconButton color="inherit" aria-label="search">
                    <SearchIcon />
                </IconButton>
                <IconButton color="inherit" aria-label="user">
                    <PersonIcon />
                </IconButton>
                <IconButton color="inherit" onClick={() => setCartOpen(true)}>
                    <ShoppingCartIcon />
                    {totalItemsInCart > 0 && <Chip label={totalItemsInCart} size="small" sx={{ position: 'absolute', top: 0, right: 0, backgroundColor: 'var(--success)', color: 'white' }} />}
                </IconButton>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Restaurant Info */}
        <Box className="restaurant-info">
            <Box className="restaurant-container">
                <img src={restaurantData?.logo ? `${API_URL}${restaurantData.logo}` : "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cmVzdGF1cmFudHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60"} alt="Restaurante" className="restaurant-image" />
                <Box className="restaurant-details">
                    <Typography variant="h6" component="h2" sx={{ fontSize: '22px', marginBottom: '5px' }}>{restaurantData?.name || 'Restaurante Sabor & Arte'}</Typography>
                    <Box className="restaurant-meta">
                        <Typography component="span"><i className="fas fa-star"></i> 4.8 (250+)</Typography>
                        <Typography component="span"><i className="fas fa-clock"></i> 30-45 min</Typography>
                        <Typography component="span"><i className="fas fa-tag"></i> $ - Média</Typography>
                        <Typography component="span"><i className="fas fa-map-marker-alt"></i> 1.2 km</Typography>
                    </Box>
                    <Typography variant="body2">Culinária brasileira com toques contemporâneos</Typography>
                </Box>
            </Box>
        </Box>

        <Box sx={{ p: 2, backgroundColor: '#f9f9f9' }}>
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

        {/* Categories */}
        <Box className="categories">
            <Box sx={{ display: 'flex', overflowX: 'auto', gap: 1, pb: 1 }}>
                <Chip label="Todos" onClick={() => setSelectedCategory('all')} className={selectedCategory === 'all' ? 'category active' : 'category'} />
                {menuData && Object.keys(menuData.categories).map(cat => (
                    <Chip key={cat} label={cat} onClick={() => setSelectedCategory(cat)} className={selectedCategory === cat ? 'category active' : 'category'} />
                ))}
            </Box>
        </Box>

        <main className="menu-container">
            {menuData && Object.keys(menuData.categories).map(categoryName => (
                <section className="menu-section" key={categoryName}>
                    <h3 className="section-title">{categoryName}</h3>
                    <div className="menu-items">
                        {menuData.categories[categoryName]
                            .filter(item =>
                                (item.name.toLowerCase().includes(searchTerm.toLowerCase()) || (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())))
                            )
                            .map(item => {
                                const currentItemInCart = cartItems.find(cartItem => cartItem.id === item.id);
                                const quantityInCart = currentItemInCart ? currentItemInCart.quantity : 0;

                                return (
                                    <div className="menu-item" key={item.id}>
                                        <div className="item-info">
                                            <h4 className="item-title">{item.name}</h4>
                                            <p className="item-description">{item.description}</p>
                                            <p className="item-price">R$ {Number(item.price).toFixed(2)}</p>
                                            <div className="item-actions">
                                                <div className="quantity-control">
                                                    <button className="quantity-btn minus" onClick={() => removeFromCart(item)}>-</button>
                                                    <span className="quantity">{quantityInCart}</span>
                                                    <button className="quantity-btn plus" onClick={() => addToCart(item)}>+</button>
                                                </div>
                                                <button className="add-btn" onClick={() => addToCart(item)}>Adicionar</button>
                                            </div>
                                        </div>
                                        <img src={item.image_url || `https://source.unsplash.com/random/300x200?food&sig=${item.id}`} alt={item.name} className="item-image" />
                                    </div>
                                );
                            })}
                    </div>
                </section>
            ))}
        </main>

        {totalItemsInCart > 0 && !cartOpen && (
            <div className="cart-btn" onClick={() => setCartOpen(true)}>
                <ShoppingCartIcon />
                <span className="cart-count">{totalItemsInCart}</span>
            </div>
        )}

        <Dialog open={cartOpen} onClose={() => setCartOpen(false)} fullScreen={isMobile} PaperProps={{ sx: { borderRadius: { sm: '24px' } } }}>
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Seu Pedido
            <IconButton onClick={() => setCartOpen(false)}><CloseIcon /></IconButton>
          </DialogTitle>
          <DialogContent dividers>
            {cartItems.map(item => (
              <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
                <Avatar src={item.image_url ? item.image_url: ''} sx={{ width: 80, height: 80, borderRadius: '10px' }} />
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
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Informações para Entrega</Typography>
            <Grid container spacing={2}>
                <Grid item xs={12}><TextField fullWidth label="Nome Completo" value={customerName} onChange={e => setCustomerName(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon /></InputAdornment> }} /></Grid>
                <Grid item xs={12}><TextField fullWidth label="Telefone (WhatsApp)" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon /></InputAdornment> }} /></Grid>
                <Grid item xs={12}><TextField fullWidth label="Endereço Completo" value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} multiline rows={3} InputProps={{ startAdornment: <InputAdornment position="start"><HomeIcon /></InputAdornment> }} /></Grid>
                <Grid item xs={12}><TextField fullWidth label="Forma de Pagamento" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><PaymentIcon /></InputAdornment> }} /></Grid>
                <Grid item xs={12}><TextField fullWidth label="Observações (opcional)" value={notes} onChange={e => setNotes(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><NotesIcon /></InputAdornment> }} /></Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ flexDirection: 'column', p: 2 }}>
            <Box sx={{ width: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography>Subtotal</Typography><Typography>R$ {cartTotal.toFixed(2)}</Typography></Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography>Taxa de Entrega</Typography><Typography>R$ 5.00</Typography></Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography variant="h6" sx={{ fontWeight: 700 }}>Total</Typography><Typography variant="h6" sx={{ fontWeight: 700 }}>R$ {(cartTotal + 5).toFixed(2)}</Typography></Box>
            </Box>
            <Button onClick={handleCheckout} fullWidth variant="contained" sx={{ mt: 2, py: 1.5, borderRadius: '12px', fontWeight: 700 }} disabled={orderMutation.isLoading}>
                {orderMutation.isLoading ? <CircularProgress size={24} color="inherit" /> : 'Finalizar Pedido'}
            </Button>
          </DialogActions>
        </Dialog>

      </Box>
    </ThemeProvider>
  );
};

export default PublicDeliveryMenu;
