import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, CircularProgress, Alert, Card, CardContent, CardMedia, Grid, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Tabs, Tab, AppBar, Toolbar, IconButton, Divider, Paper, Container, useTheme, useMediaQuery, InputAdornment, Slide, Zoom, Fade, Chip, Snackbar, Backdrop, List, ListItem, ListItemText, ListItemAvatar, Avatar } from '@mui/material';
import { useQuery } from 'react-query';
import axiosInstance from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import { Restaurant as RestaurantIcon, ShoppingCart as ShoppingCartIcon, Search as SearchIcon, LocalDining as LocalDiningIcon, Phone as PhoneIcon, Favorite as FavoriteIcon, ArrowUpward as ArrowUpwardIcon, Close as CloseIcon, Add as AddIcon, Remove as RemoveIcon, Delete as DeleteIcon, Person as PersonIcon, Home as HomeIcon, Payment as PaymentIcon, Notes as NotesIcon, LocalShipping as LocalShippingIcon, CheckCircle as CheckCircleIcon, WhatsApp as WhatsAppIcon } from '@mui/icons-material';

const fetchDeliveryMenu = async (restaurantSlug) => {
  const { data } = await axiosInstance.get(`/api/public/products/delivery/${restaurantSlug}`);
  
  // Agrupar produtos por categoria
  const groupedByCategory = data.reduce((acc, product) => {
    const category = product.category || 'Outros';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(product);
    return acc;
  }, {});
  
  return { products: data, categories: groupedByCategory };
};

const PublicDeliveryMenu = () => {
  const { t } = useTranslation();
  const { restaurantSlug } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [notes, setNotes] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [favorites, setFavorites] = useState([]);
  
  // Carregar favoritos do localStorage ao iniciar
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favoriteItems');
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (e) {
        console.error('Erro ao carregar favoritos:', e);
      }
    }
  }, []);
  
  // Estados para feedback e confirmação
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info'); // 'success', 'error', 'warning', 'info'
  const [orderConfirmationOpen, setOrderConfirmationOpen] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState(null);
  
  // Controle de exibição do botão de voltar ao topo
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleCategoryChange = (event, newValue) => {
    setSelectedCategory(newValue);
  };
  
  const addToCart = (item) => {
    const existingItem = cartItems.find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
      setCartItems(cartItems.map(cartItem => 
        cartItem.id === item.id 
          ? { ...cartItem, quantity: cartItem.quantity + 1 } 
          : cartItem
      ));
    } else {
      setCartItems([...cartItems, { ...item, quantity: 1 }]);
    }
  };
  
  const removeFromCart = (itemId) => {
    const existingItem = cartItems.find(item => item.id === itemId);
    
    if (existingItem.quantity === 1) {
      setCartItems(cartItems.filter(item => item.id !== itemId));
    } else {
      setCartItems(cartItems.map(item => 
        item.id === itemId 
          ? { ...item, quantity: item.quantity - 1 } 
          : item
      ));
    }
  };

  const handleCheckout = async () => {
    // Validação básica
    if (!customerName || !customerPhone || !deliveryAddress) {
      setSnackbarMessage('Por favor, preencha todos os campos obrigatórios.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    // Mostrar feedback de carregamento
    setIsSubmitting(true);
    
    const totalAmount = cartItems.reduce((total, item) => total + (Number(item.price) * item.quantity), 0);

    // Preparar dados do pedido
    const orderData = {
      restaurant_id: menuData.products[0].restaurant_id, // Assuming all products belong to the same restaurant
      delivery_type: 'delivery', // This component is for delivery menu
      total_amount: totalAmount,
      items: cartItems.map(item => ({
        product_id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: Number(item.price),
      })),
      customer_details: {
        name: customerName,
        phone: customerPhone,
      },
      delivery_address: { address: deliveryAddress },
      payment_method: paymentMethod,
      notes: notes,
    };

    try {
      const response = await axiosInstance.post('/api/public/orders', orderData);
      
      // Feedback de sucesso
      setSnackbarMessage('Pedido realizado com sucesso!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      
      // Mostrar modal de confirmação
      setConfirmedOrderId(response.data.id || 'N/A');
      setOrderConfirmationOpen(true);
      
      // Limpar carrinho e formulário
      setCartItems([]);
      setTimeout(() => {
        setCartOpen(false);
      }, 500);
      
      setCustomerName('');
      setCustomerPhone('');
      setDeliveryAddress('');
      setPaymentMethod('');
      setNotes('');
      
      // Salvar informações do cliente no localStorage para uso futuro
      localStorage.setItem('customerInfo', JSON.stringify({
        name: customerName,
        phone: customerPhone,
        address: deliveryAddress
      }));
    } catch (error) {
      console.error('Erro ao finalizar pedido:', error);
      setSnackbarMessage(`Erro ao finalizar pedido: ${error.response?.data?.msg || error.message}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const { data: menuData, isLoading, isError } = useQuery(
    ['deliveryMenu', restaurantSlug],
    () => fetchDeliveryMenu(restaurantSlug),
    {
      enabled: !!restaurantSlug,
      onError: (error) => { // Added error handling
        console.error('Erro ao carregar cardápio de delivery:', error);
        toast.error(`Erro ao carregar cardápio: ${error.response?.data?.msg || error.message}`);
      }
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

  if (!menuData || !menuData.products || menuData.products.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography variant="h6">Nenhum item encontrado para este cardápio de delivery.</Typography>
      </Box>
    );
  }

  // Extrair categorias do menuData
  const categories = menuData ? Object.keys(menuData.categories) : [];
  
  
  
  // Adicionar ou remover dos favoritos
  const toggleFavorite = (itemId) => {
    if (favorites.includes(itemId)) {
      setFavorites(favorites.filter(id => id !== itemId));
    } else {
      setFavorites([...favorites, itemId]);
    }
    
    // Salvar favoritos no localStorage
    localStorage.setItem('favoriteItems', JSON.stringify([...favorites]));
  };
  
  // Filtrar produtos pelo termo de busca
  const filterProducts = (products) => {
    if (!searchTerm) return products;
    return products.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };
  
  // Verificar se um produto está nos favoritos
  const isFavorite = (itemId) => {
    return favorites.includes(itemId);
  };
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Header */}
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{ 
          background: 'linear-gradient(45deg, #8B0000 30%, #D10000 90%)',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Zoom in={true} style={{ transitionDelay: '150ms' }}>
              <RestaurantIcon sx={{ mr: 1, fontSize: isMobile ? 24 : 28 }} />
            </Zoom>
            <Fade in={true} timeout={800}>
              <Typography 
                variant={isMobile ? "subtitle1" : "h6"} 
                component="div" 
                sx={{ 
                  fontWeight: 'bold',
                  letterSpacing: 1,
                  textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
                }}
              >
                DON FONSECA
              </Typography>
            </Fade>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Fade in={true} timeout={1000}>
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  bgcolor: 'rgba(255,255,255,0.15)', 
                  borderRadius: 2, 
                  px: 1,
                  py: 0.5,
                  mr: isMobile ? 1 : 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.25)'
                  }
                }}
              >
                <SearchIcon sx={{ color: 'white', mr: 0.5, fontSize: isMobile ? 18 : 24 }} />
                <TextField
                  placeholder={t('common.search_item_placeholder')}
                  variant="standard"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    disableUnderline: true,
                    style: { color: 'white' },
                    startAdornment: isMobile ? null : (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: 'white', fontSize: 20 }} />
                      </InputAdornment>
                    )
                  }}
                  sx={{ 
                    width: isMobile ? 80 : 150,
                    '& input::placeholder': {
                      color: 'rgba(255,255,255,0.7)',
                      fontSize: isMobile ? '0.8rem' : '0.9rem'
                    }
                  }}
                />
              </Box>
            </Fade>
            
            <Zoom in={true} style={{ transitionDelay: '300ms' }}>
              <IconButton 
                color="inherit" 
                onClick={() => setCartOpen(!cartOpen)}
                sx={{ 
                  position: 'relative',
                  bgcolor: 'rgba(255,255,255,0.1)',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.2)'
                  }
                }}
              >
                <ShoppingCartIcon sx={{ fontSize: isMobile ? 20 : 24 }} />
                {cartItems.length > 0 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -5,
                      right: -5,
                      bgcolor: '#FFD700',
                      color: '#8B0000',
                      borderRadius: '50%',
                      width: isMobile ? 16 : 20,
                      height: isMobile ? 16 : 20,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: isMobile ? 10 : 12,
                      fontWeight: 'bold',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}
                  >
                    {cartItems.reduce((total, item) => total + item.quantity, 0)}
                  </Box>
                )}
              </IconButton>
            </Zoom>
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* Espaço para compensar a AppBar fixa */}
      <Toolbar />
      
      {/* Conteúdo principal */}
      <Container maxWidth="lg" sx={{ flexGrow: 1, py: 2 }}>
        {/* Banner */}
        <Paper 
          sx={{ 
            p: 3, 
            mb: 3, 
            borderRadius: 2,
            backgroundImage: 'linear-gradient(to right, #8B0000, #D10000)',
            color: 'white',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}
        >
          {/* Decorative elements */}
          <Box 
            sx={{ 
              position: 'absolute', 
              top: -20, 
              left: -20, 
              width: 100, 
              height: 100, 
              borderRadius: '50%', 
              background: 'rgba(255,255,255,0.1)',
              display: { xs: 'none', sm: 'block' }
            }} 
          />
          <Box 
            sx={{ 
              position: 'absolute', 
              bottom: -30, 
              right: -30, 
              width: 150, 
              height: 150, 
              borderRadius: '50%', 
              background: 'rgba(255,255,255,0.1)',
              display: { xs: 'none', sm: 'block' }
            }} 
          />
          
          <Fade in={true} timeout={1000}>
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                Peça agora mesmo!
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Entregamos em toda a cidade. Peça pelo WhatsApp.
              </Typography>
            </Box>
          </Fade>
          
          <Zoom in={true} style={{ transitionDelay: '500ms' }}>
            <Button 
              variant="contained" 
              startIcon={<PhoneIcon />}
              sx={{ 
                mt: { xs: 2, sm: 0 },
                bgcolor: 'white', 
                color: '#8B0000',
                fontWeight: 'bold',
                borderRadius: 2,
                boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                '&:hover': { 
                  bgcolor: '#f0f0f0',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 12px rgba(0,0,0,0.3)'
                },
                transition: 'all 0.3s ease'
              }}
              onClick={() => window.open('https://wa.me/5500000000000', '_blank')}
            >
              Pedir pelo WhatsApp
            </Button>
          </Zoom>
        </Paper>
        
        {/* Categories Tabs */}
        <Paper sx={{ mb: 2, borderRadius: 2, overflow: 'hidden' }}>
          <Tabs 
            value={selectedCategory} 
            onChange={handleCategoryChange} 
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              bgcolor: '#8B0000',
              '& .MuiTab-root': { color: 'white' },
              '& .Mui-selected': { color: 'white', fontWeight: 'bold' },
              '& .MuiTabs-indicator': { backgroundColor: 'white' }
            }}
          >
            {categories.map((category, index) => (
              <Tab label={category} key={index} />
            ))}
          </Tabs>
        </Paper>
        
        {/* Scroll to top button */}
        <Zoom in={showScrollTop}>
          <Box
            onClick={scrollToTop}
            sx={{
              position: 'fixed',
              bottom: 20,
              right: 20,
              zIndex: 10,
              bgcolor: '#8B0000',
              color: 'white',
              width: 40,
              height: 40,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 3px 5px rgba(0,0,0,0.3)',
              '&:hover': {
                bgcolor: '#D10000',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 8px rgba(0,0,0,0.4)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            <ArrowUpwardIcon />
          </Box>
        </Zoom>
        
        {/* Lista de produtos da categoria selecionada */}
        {categories.length > 0 && (
          <Box>
            {categories.map((category, index) => (
              <Box key={category} sx={{ display: selectedCategory === index ? 'block' : 'none' }}>
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: '#8B0000' }}>
                  {category}
                </Typography>
                <Grid container spacing={2}>
                  {filterProducts(menuData.categories[category]).map((item) => (
                    <Grid item xs={12} sm={6} md={4} key={item.id}>
                      <Card sx={{ 
                        display: 'flex', 
                        height: '100%', 
                        borderRadius: 2,
                        overflow: 'hidden',
                        boxShadow: 3,
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                        }
                      }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                          <CardMedia
                            component="img"
                            height="140"
                            image={item.imageUrl || `https://source.unsplash.com/random/300x200?food&sig=${item.id}`}
                            alt={item.name}
                          />
                          <CardContent sx={{ flexGrow: 1 }}>
                            <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                              {item.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              {item.description}
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="h6" color="#8B0000" fontWeight="bold">
                                R$ {Number(item.price).toFixed(2)}
                              </Typography>
                              <Button 
                                variant="contained" 
                                size="small" 
                                onClick={() => addToCart(item)}
                                sx={{ 
                                  bgcolor: '#8B0000', 
                                  '&:hover': { bgcolor: '#6B0000' },
                                  borderRadius: '20px',
                                  textTransform: 'none',
                                  fontWeight: 'bold'
                                }}
                              >
                                Adicionar
                              </Button>
                            </Box>
                          </CardContent>
                        </Box>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            ))}
          </Box>
        )}
      </Container>
      
      {/* Shopping Cart Dialog */}
      <Dialog
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        fullWidth
        maxWidth="sm"
        TransitionComponent={Slide}
        TransitionProps={{ direction: 'up' }}
        PaperProps={{
          sx: {
            borderRadius: isMobile ? '16px 16px 0 0' : 8,
            maxHeight: isMobile ? '90vh' : '80vh',
            margin: isMobile ? '0 0 0 0' : undefined,
            position: isMobile ? 'absolute' : undefined,
            bottom: isMobile ? 0 : undefined,
            width: isMobile ? '100%' : undefined,
            overflowY: 'auto'
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            background: 'linear-gradient(45deg, #8B0000 30%, #D10000 90%)',
            color: 'white',
            py: 2
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ShoppingCartIcon sx={{ mr: 1 }} />
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', flexGrow: 1 }}>
              Carrinho de Compras
            </Typography>
            <Chip 
              label={`${cartItems.length} ${cartItems.length === 1 ? 'item' : 'itens'}`} 
              size="small" 
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                color: 'white',
                fontWeight: 'bold',
                mr: 1
              }} 
            />
            <IconButton
              edge="end"
              color="inherit"
              onClick={() => setCartOpen(false)}
              aria-label="close"
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.1)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: isMobile ? 1.5 : 2, pt: 2 }}>
          {cartItems.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Fade in={true} timeout={800}>
                <Box>
                  <ShoppingCartIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2, opacity: 0.6 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Seu carrinho está vazio
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Adicione itens ao seu carrinho para continuar
                  </Typography>
                  <Button 
                    variant="contained" 
                    sx={{ 
                      mt: 2, 
                      bgcolor: '#8B0000', 
                      '&:hover': { bgcolor: '#6B0000' },
                      borderRadius: 2,
                      px: 3,
                      py: 1
                    }}
                    onClick={() => setCartOpen(false)}
                  >
                    Continuar Comprando
                  </Button>
                </Box>
              </Fade>
            </Box>
          ) : (
            <>
              <List sx={{ pt: 0 }}>
                {cartItems.map((item) => (
                  <Fade key={item.id} in={true} timeout={500}>
                    <ListItem sx={{ 
                      py: 2, 
                      px: 0, 
                      borderBottom: '1px solid #eee',
                      transition: 'background-color 0.2s ease',
                      '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' }
                    }}>
                      <ListItemAvatar>
                        <Avatar 
                          src={item.image || 'https://via.placeholder.com/40x40?text=P'} 
                          alt={item.name}
                          variant="rounded"
                          sx={{ 
                            width: isMobile ? 50 : 60, 
                            height: isMobile ? 50 : 60,
                            borderRadius: 2,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}
                        />
                      </ListItemAvatar>
                      <ListItemText
                        primary={item.name}
                        secondary={
                          <Typography variant="body2" color="primary" sx={{ fontWeight: 'bold', mt: 0.5 }}>
                            R$ {Number(item.price).toFixed(2)}
                          </Typography>
                        }
                        primaryTypographyProps={{ 
                          fontWeight: 'bold',
                          variant: isMobile ? 'body2' : 'body1'
                        }}
                        sx={{ ml: 1 }}
                      />
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        bgcolor: '#f5f5f5',
                        borderRadius: 2,
                        p: 0.5,
                        ml: 1
                      }}>
                        <IconButton 
                          size="small" 
                          onClick={() => removeFromCart(item.id)}
                          disabled={item.quantity <= 1}
                          sx={{ 
                            color: item.quantity <= 1 ? 'text.disabled' : '#8B0000',
                            '&.Mui-disabled': { opacity: 0.4 }
                          }}
                        >
                          <RemoveIcon fontSize="small" />
                        </IconButton>
                        <Typography sx={{ 
                          mx: 1, 
                          minWidth: 20, 
                          textAlign: 'center',
                          fontWeight: 'bold',
                          fontSize: isMobile ? '0.9rem' : '1rem'
                        }}>
                          {item.quantity}
                        </Typography>
                        <IconButton 
                          size="small" 
                          onClick={() => addToCart(item)}
                          sx={{ color: '#8B0000' }}
                        >
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      <IconButton 
                        edge="end" 
                        onClick={() => removeFromCart(item.id)}
                        sx={{ 
                          color: 'text.secondary',
                          '&:hover': { color: '#D10000' }
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItem>
                  </Fade>
                ))}
              </List>

              <Box sx={{ 
                mt: 2, 
                mb: 3, 
                textAlign: 'right',
                p: 2,
                bgcolor: '#f9f9f9',
                borderRadius: 2,
                border: '1px dashed #ddd'
              }}>
                <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
                  Subtotal:
                </Typography>
                <Typography variant="h5" sx={{ color: '#8B0000', fontWeight: 'bold' }}>
                  R$ {cartItems.reduce((total, item) => total + (Number(item.price) * item.quantity), 0).toFixed(2)}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ 
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <LocalShippingIcon /> Informações para Entrega
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Seu Nome Completo"
                    fullWidth
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    margin="normal"
                    required
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        '&.Mui-focused fieldset': {
                          borderColor: '#8B0000',
                        },
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#8B0000',
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Seu Telefone (com DDD)"
                    fullWidth
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    margin="normal"
                    required
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIcon sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        '&.Mui-focused fieldset': {
                          borderColor: '#8B0000',
                        },
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#8B0000',
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Endereço de Entrega Completo"
                    fullWidth
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    margin="normal"
                    required
                    multiline
                    rows={3}
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <HomeIcon sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        '&.Mui-focused fieldset': {
                          borderColor: '#8B0000',
                        },
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#8B0000',
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Método de Pagamento (Ex: Dinheiro, Cartão, Pix)"
                    fullWidth
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    margin="normal"
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PaymentIcon sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        '&.Mui-focused fieldset': {
                          borderColor: '#8B0000',
                        },
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#8B0000',
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Observações (Ex: Sem cebola, Troco para R$50)"
                    fullWidth
                    margin="normal"
                    multiline
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <NotesIcon sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        '&.Mui-focused fieldset': {
                          borderColor: '#8B0000',
                        },
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#8B0000',
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setCartOpen(false)}>Fechar</Button>
          {cartItems.length > 0 && (
            <Button 
              variant="contained" 
              sx={{ bgcolor: '#8B0000', '&:hover': { bgcolor: '#6B0000' } }}
              onClick={handleCheckout}
            >
              Finalizar Pedido
            </Button>
          )}
        </DialogActions>
      </Dialog>
      
      {/* Order Confirmation Dialog */}
      <Dialog
        open={orderConfirmationOpen}
        onClose={() => setOrderConfirmationOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            p: 1,
            maxWidth: 500,
            mx: 'auto'
          }
        }}
      >
        <DialogContent sx={{ textAlign: 'center', py: 4 }}>
          <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
            Pedido Confirmado!
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Seu pedido #{confirmedOrderId} foi recebido e está sendo processado.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Você receberá atualizações sobre o status do seu pedido.
            Em caso de dúvidas, entre em contato conosco pelo WhatsApp.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => setOrderConfirmationOpen(false)}
              sx={{ borderRadius: 2 }}
            >
              Fechar
            </Button>
            <Button
              variant="contained"
              startIcon={<WhatsAppIcon />}
              onClick={() => window.open('https://wa.me/5511999999999', '_blank')}
              sx={{ 
                bgcolor: '#25D366', 
                '&:hover': { bgcolor: '#128C7E' },
                borderRadius: 2
              }}
            >
              Contato
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: '100%', borderRadius: 2 }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
      
      {/* Loading Backdrop */}
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isSubmitting}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <CircularProgress color="inherit" />
          <Typography sx={{ mt: 2, color: 'white' }}>Processando seu pedido...</Typography>
        </Box>
      </Backdrop>
    </Box>
  );
};

export default PublicDeliveryMenu;