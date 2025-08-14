import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Typography, CircularProgress, Alert, Card, CardContent, CardMedia, Grid, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Tabs, Tab, AppBar, Toolbar, IconButton, Divider, Paper, Container, useTheme, useMediaQuery, Zoom, Fade, Chip, Slide, Fab, List, ListItem, ListItemText, ListItemAvatar, Avatar, BottomNavigation, BottomNavigationAction, ThemeProvider, createTheme } from '@mui/material';
import { useQuery, useMutation } from 'react-query';
import axiosInstance from '../../api/axiosInstance';
import { Restaurant as RestaurantIcon, ShoppingCart as ShoppingCartIcon, LocalDining as LocalDiningIcon, Call as CallIcon, Receipt as ReceiptIcon, Search as SearchIcon, Info as InfoIcon, Star as StarIcon, StarBorder as StarBorderIcon, Add as AddIcon, Remove as RemoveIcon, Notifications as NotificationsIcon, NotificationsActive as NotificationsActiveIcon, Clear as ClearIcon, KeyboardArrowUp as KeyboardArrowUpIcon, Send as SendIcon, AddShoppingCart as AddShoppingCartIcon, SearchOff as SearchOffIcon, ArrowBack as ArrowBackIcon, Close as CloseIcon, Delete as DeleteIcon } from '@mui/icons-material';

const fetchDineInMenu = async (restaurantSlug, tableNumber) => {
    const { data } = await axiosInstance.get(`/public/menu/dine-in/${restaurantSlug}/${tableNumber}`);
    const groupedByCategory = data.products.reduce((acc, product) => {
      const category = product.Category?.name || 'Outros';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(product);
      return acc;
    }, {});
    return { ...data, categories: groupedByCategory };
  };
  
  const startTableSession = async (tableId) => {
    const { data } = await axiosInstance.post(`/public/menu/dine-in/${tableId}/start-session`);
    return data;
  };
  
  const callWaiter = async ({ sessionId, description }) => {
    const { data } = await axiosInstance.post(`/public/menu/dine-in/${sessionId}/call-waiter`, { description });
    return data;
  };
  
  const requestBill = async (sessionId) => {
    const { data } = await axiosInstance.post(`/public/menu/dine-in/${sessionId}/request-bill`);
    return data;
  };
  
  const getSessionStatus = async (sessionId) => {
    const { data } = await axiosInstance.get(`/public/menu/dine-in/${sessionId}/status`);
    return data;
  };

const premiumTheme = createTheme({
  palette: {
    primary: { main: '#E31837' },
    secondary: { main: '#1A1A1A' },
    accent: { main: '#FFD700' },
  },
  typography: {
    fontFamily: 'Montserrat, sans-serif',
  },
});

const PublicDineInMenu = () => {
  const { t } = useTranslation();
  const { restaurantSlug, tableNumber } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [sessionId, setSessionId] = useState(localStorage.getItem(`tableSession_${restaurantSlug}_${tableNumber}`));
  const [openWaiterDialog, setOpenWaiterDialog] = useState(false);
  const [waiterCallDescription, setWaiterCallDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  const { data: menuData, isLoading: isLoadingMenu, isError: isErrorMenu } = useQuery(
    ['dineInMenu', restaurantSlug, tableNumber],
    () => fetchDineInMenu(restaurantSlug, tableNumber),
    { enabled: !!restaurantSlug && !!tableNumber }
  );

  const addToCart = (item) => {
    setCartItems((prevItems) => {
      const isItemInCart = prevItems.find((cartItem) => cartItem.id === item.id);
      if (isItemInCart) {
        return prevItems.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prevItems, { ...item, quantity: 1 }];
    });
  };

  const categories = menuData ? Object.keys(menuData.categories) : [];

  if (isLoadingMenu) {
    return <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh"><CircularProgress /></Box>;
  }

  if (isErrorMenu) {
    return <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh"><Alert severity="error">Erro ao carregar o cardápio.</Alert></Box>;
  }

  const restaurant = menuData?.restaurant;
  const table = menuData?.table;

  return (
    <ThemeProvider theme={premiumTheme}>
      <Box sx={{ display: 'grid', gridTemplateRows: '90px 1fr auto', height: '100vh', maxWidth: '1024px', margin: '0 auto', backgroundColor: 'white', boxShadow: '0 0 30px rgba(0,0,0,0.08)', position: 'relative', overflow: 'hidden' }}>
        {/* Header */}
        <AppBar position="static" sx={{ background: 'linear-gradient(135deg, #1A1A1A, #000)', boxShadow: '0 2px 15px rgba(0,0,0,0.1)', zIndex: 10 }}>
          <Toolbar sx={{ justifyContent: 'space-between', padding: '0 25px' }}>
            <Typography variant="h4" sx={{ color: 'accent.main', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
            {restaurant?.logo ? <img src={restaurant.logo} alt={restaurant.name} height="40" /> : <RestaurantIcon sx={{ color: 'primary.main' }} />}
              {restaurant?.name || 'DON FONSECA'}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <IconButton sx={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', '&:hover': { backgroundColor: 'primary.main', transform: 'scale(1.1)' } }} onClick={() => setOpenWaiterDialog(true)}>
                <NotificationsIcon />
              </IconButton>
              <Typography sx={{ backgroundColor: 'primary.main', padding: '8px 18px', borderRadius: '30px', fontWeight: 600 }}>
                MESA {table?.table_number || tableNumber}
              </Typography>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Main Content */}
        <Box sx={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '220px 1fr', overflow: 'hidden' }}>
          {/* Sidebar */}
          <Box sx={{ display: { xs: 'none', md: 'block' }, backgroundColor: 'white', overflowY: 'auto', borderRight: '1px solid #eee', boxShadow: '2px 0 10px rgba(0,0,0,0.03)', padding: '20px 0' }}>
            {categories.map((category, index) => (
              <Button key={index} onClick={() => setSelectedCategory(index)} sx={{ display: 'flex', width: '100%', padding: '15px 25px', justifyContent: 'flex-start', fontWeight: 600, color: selectedCategory === index ? 'primary.main' : 'text.secondary', borderLeft: selectedCategory === index ? '4px solid' : '4px solid transparent', borderColor: 'primary.main', backgroundColor: selectedCategory === index ? 'rgba(227, 24, 55, 0.05)' : 'transparent' }}>
                {category}
              </Button>
            ))}
          </Box>

          {/* Menu Items */}
          <Box sx={{ overflowY: 'auto', padding: '25px' }}>
            {isMobile && (
              <Tabs value={selectedCategory} onChange={(e, newValue) => setSelectedCategory(newValue)} variant="scrollable" scrollButtons="auto" sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                {categories.map((category, index) => (
                  <Tab label={category} key={index} />
                ))}
              </Tabs>
            )}
            {categories.map((category, index) => (
              <Box key={index} sx={{ display: selectedCategory === index ? 'block' : 'none' }}>
                <Typography variant="h4" sx={{ mb: 1, fontWeight: 'bold' }}>{category}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>{menuData.categories[category][0]?.Category?.description || ''}</Typography>
                <Grid container spacing={3}>
                  {menuData.categories[category].map(item => (
                    <Grid item xs={12} sm={6} md={4} key={item.id}>
                      <Card sx={{ borderRadius: '12px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)', transition: 'all 0.4s', '&:hover': { transform: 'translateY(-8px)', boxShadow: '0 12px 25px rgba(0,0,0,0.1)' }, position: 'relative', border: '1px solid #f0f0f0' }}>
                        {item.featured && <Chip label="MAIS PEDIDO" sx={{ position: 'absolute', top: '15px', right: '15px', backgroundColor: 'accent.main', color: 'secondary.main', fontWeight: 700, zIndex: 2 }} />}
                        <Box sx={{ height: '180px', position: 'relative', overflow: 'hidden' }}>
                          <CardMedia component="img" height="180" image={item.imageUrl || `https://source.unsplash.com/random/300x200?food&sig=${item.id}`} alt={item.name} />
                          <Box sx={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '50%', background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)' }} />
                        </Box>
                        <CardContent sx={{ padding: '20px' }}>
                          <Typography variant="h6" component="div" sx={{ fontWeight: 700, mb: 1, color: 'secondary.main' }}>{item.name}</Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: '60px' }}>{item.description}</Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main' }}>R$ {Number(item.price).toFixed(2)}</Typography>
                            <Button onClick={() => addToCart(item)} variant="contained" startIcon={<AddIcon />} sx={{ background: 'linear-gradient(135deg, #E31837, #FF4757)', borderRadius: '8px', fontWeight: 600, boxShadow: '0 3px 10px rgba(227, 24, 55, 0.3)', '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 5px 15px rgba(227, 24, 55, 0.4)' } }}>Adicionar</Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Footer */}
        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, display: { xs: 'block', md: 'none' }, zIndex: 10, borderTop: '1px solid #eee' }} elevation={3}>
          <BottomNavigation showLabels>
            <BottomNavigationAction label="Cardápio" icon={<RestaurantIcon />} />
            <BottomNavigationAction label="Buscar" icon={<SearchIcon />} />
            <BottomNavigationAction label="Chamar Garçom" icon={<NotificationsIcon />} onClick={() => setOpenWaiterDialog(true)} />
            <BottomNavigationAction label="Carrinho" icon={<ShoppingCartIcon />} onClick={() => setCartOpen(true)} />
            <BottomNavigationAction label="Conta" icon={<ReceiptIcon />} />
          </BottomNavigation>
        </Paper>

        {/* Cart Dialog */}
        <Dialog open={cartOpen} onClose={() => setCartOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: '15px', maxHeight: '80vh' } }}>
          <DialogTitle sx={{ background: 'linear-gradient(135deg, #1A1A1A, #000)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Meu Pedido
            <IconButton onClick={() => setCartOpen(false)} sx={{ color: 'white' }}><CloseIcon /></IconButton>
          </DialogTitle>
          <DialogContent sx={{ padding: '20px' }}>
            {/* Cart items will be rendered here */}
          </DialogContent>
          <DialogActions sx={{ padding: '20px', backgroundColor: '#f9f9f9', borderTop: '1px solid #eee' }}>
            <Box sx={{ width: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Subtotal:</Typography>
                <Typography>R$ 0,00</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Taxa de serviço:</Typography>
                <Typography>R$ 0,00</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.2rem', borderTop: '1px solid #eee', pt: 1, mt: 1 }}>
                <Typography>Total:</Typography>
                <Typography>R$ 0,00</Typography>
              </Box>
              <Button fullWidth variant="contained" sx={{ mt: 2, background: 'linear-gradient(135deg, #E31837, #FF4757)', padding: '15px', fontWeight: 600 }}>Finalizar Pedido</Button>
            </Box>
          </DialogActions>
        </Dialog>

        {/* Waiter Dialog */}
        <Dialog open={openWaiterDialog} onClose={() => setOpenWaiterDialog(false)} PaperProps={{ sx: { borderRadius: '15px' } }}>
          <DialogTitle sx={{ background: 'linear-gradient(135deg, #1A1A1A, #000)', color: 'white' }}>Chamar Garçom</DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <TextField label="Mensagem (opcional)" fullWidth variant="outlined" value={waiterCallDescription} onChange={(e) => setWaiterCallDescription(e.target.value)} />
          </DialogContent>
          <DialogActions sx={{ padding: '20px' }}>
            <Button onClick={() => setOpenWaiterDialog(false)}>Cancelar</Button>
            <Button variant="contained" sx={{ background: 'linear-gradient(135deg, #E31837, #FF4757)' }}>Enviar Chamada</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
};

export default PublicDineInMenu;
