import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Typography, CircularProgress, Alert, Card, CardContent, CardMedia, Grid, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Tabs, Tab, AppBar, Toolbar, IconButton, Divider, Paper, Container, useTheme, alpha, Badge, useMediaQuery, Zoom, Fade, Chip, Slide, Fab, List, ListItem, ListItemText, ListItemAvatar, Avatar, BottomNavigation, BottomNavigationAction } from '@mui/material';
import { useQuery, useMutation } from 'react-query';
import axiosInstance from '../../api/axiosInstance';
import { Restaurant as RestaurantIcon, ShoppingCart as ShoppingCartIcon, LocalDining as LocalDiningIcon, Call as CallIcon, Receipt as ReceiptIcon, Search as SearchIcon, Info as InfoIcon, Star as StarIcon, StarBorder as StarBorderIcon, Add as AddIcon, Remove as RemoveIcon, Notifications as NotificationsIcon, NotificationsActive as NotificationsActiveIcon, Clear as ClearIcon, KeyboardArrowUp as KeyboardArrowUpIcon, Send as SendIcon, AddShoppingCart as AddShoppingCartIcon, SearchOff as SearchOffIcon, ArrowBack as ArrowBackIcon, Close as CloseIcon, Delete as DeleteIcon } from '@mui/icons-material';

const fetchDineInMenu = async (tableId) => {
  const { data } = await axiosInstance.get(`/public/menu/dine-in/${tableId}`);
  
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

const PublicDineInMenu = () => {
  const { t } = useTranslation();
  const { tableId } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  
  const [sessionId, setSessionId] = useState(localStorage.getItem(`tableSession_${tableId}`));
  const [openWaiterDialog, setOpenWaiterDialog] = useState(false);
  const [waiterCallDescription, setWaiterCallDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  
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

  // Query for menu items
  const { data: menuData, isLoading: isLoadingMenu, isError: isErrorMenu } = useQuery(
    ['dineInMenu', tableId],
    () => fetchDineInMenu(tableId),
    {
      enabled: !!tableId,
    }
  );
  
  // Carregar favoritos do localStorage ao iniciar
  useEffect(() => {
    const savedFavorites = localStorage.getItem('dineInFavorites');
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (e) {
        console.error('Erro ao carregar favoritos:', e);
        localStorage.removeItem('dineInFavorites');
      }
    }
  }, []);

  const toggleFavorite = (itemId) => {
    const newFavorites = favorites.includes(itemId)
      ? favorites.filter(id => id !== itemId)
      : [...favorites, itemId];
    
    setFavorites(newFavorites);
    localStorage.setItem('dineInFavorites', JSON.stringify(newFavorites));
  };

  const isFavorite = (itemId) => favorites.includes(itemId);

  const handleCategoryChange = (event, newValue) => {
    setSelectedCategory(newValue);
    setShowFavorites(false);
    setSearchTerm('');
    setShowSearch(false);
  };
  
  const toggleSearch = () => {
    setShowSearch(!showSearch);
    if (showSearch) {
      setSearchTerm('');
    } else {
      setShowFavorites(false);
    }
  };

  const toggleFavoritesView = () => {
    setShowFavorites(!showFavorites);
    if (showFavorites) {
      setSelectedCategory(0);
    } else {
      setSearchTerm('');
      setShowSearch(false);
    }
  };

  const filterProducts = (products) => {
    if (!searchTerm) return products;
    
    return products.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };
  
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      alert('Seu carrinho está vazio!'); // Or use toast/snackbar
      return;
    }

    if (!sessionId) {
      alert('Sessão da mesa não iniciada. Por favor, recarregue a página.'); // Or use toast/snackbar
      return;
    }

    // Assuming restaurant_id is available from menuData
    const restaurantId = menuData?.products?.[0]?.restaurant_id;
    if (!restaurantId) {
      alert('Não foi possível identificar o restaurante.'); // Or use toast/snackbar
      return;
    }

    const totalAmount = cartItems.reduce((total, item) => total + (Number(item.price) * item.quantity), 0);

    const orderData = {
      restaurant_id: restaurantId,
      table_session_id: sessionId, // Use table_session_id for dine-in
      delivery_type: 'dine_in', // Specify dine-in type
      total_amount: totalAmount,
      items: cartItems.map(item => ({
        product_id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: Number(item.price),
      })),
      // No customer_details, delivery_address, payment_method, notes for dine-in order placement
    };

    try {
      // Assuming the order endpoint is /api/public/orders as in PublicDeliveryMenu.js
      const response = await axiosInstance.post('/api/public/orders', orderData);
      alert('Pedido realizado com sucesso!'); // Or use toast/snackbar
      setCartItems([]); // Clear cart
      setCartOpen(false); // Close cart dialog
      // Optionally, show order confirmation dialog
    } catch (error) {
      console.error('Erro ao finalizar pedido:', error);
      alert(`Erro ao finalizar pedido: ${error.response?.data?.msg || error.message}`); // Or use toast/snackbar
    }
  };

  // Mutation to start session
  const sessionMutation = useMutation(() => startTableSession(tableId), {
    onSuccess: (data) => {
      setSessionId(data.session.id);
      localStorage.setItem(`tableSession_${tableId}`, data.session.id);
    },
    onError: (error) => {
      console.error('Error starting session:', error);
      // Handle error, maybe show a toast
    }
  });

  // Query for session status (polling)
  const { data: sessionStatus, refetch: refetchSessionStatus } = useQuery(
    ['sessionStatus', sessionId],
    () => getSessionStatus(sessionId),
    {
      enabled: !!sessionId,
      refetchInterval: 5000, // Poll every 5 seconds
    }
  );

  // Mutation to call waiter
  const callWaiterMutation = useMutation(callWaiter, {
    onSuccess: () => {
      alert('Chamada para o garçom enviada!');
      setOpenWaiterDialog(false);
      setWaiterCallDescription('');
      refetchSessionStatus(); // Refetch status to update UI
    },
    onError: (error) => {
      console.error('Error calling waiter:', error);
      alert('Erro ao chamar o garçom.');
    }
  });

  // Mutation to request bill
  const requestBillMutation = useMutation(requestBill, {
    onSuccess: () => {
      alert('Solicitação de conta enviada!');
      refetchSessionStatus(); // Refetch status to update UI
    },
    onError: (error) => {
      console.error('Error requesting bill:', error);
      alert('Erro ao solicitar a conta.');
    }
  });

  useEffect(() => {
    if (tableId && !sessionId) {
      sessionMutation.mutate();
    }
  }, [tableId, sessionId, sessionMutation]);

  if (isLoadingMenu) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (isErrorMenu) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Alert severity="error">Erro ao carregar o cardápio. Verifique o link ou tente novamente mais tarde.</Alert>
      </Box>
    );
  }

  if (!menuData || !menuData.products || menuData.products.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography variant="h6">Nenhum item encontrado para este cardápio de salão.</Typography>
      </Box>
    );
  }

  // Extrair categorias do menuData
  const categories = menuData ? Object.keys(menuData.categories) : [];
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Header */}
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{ 
          background: 'linear-gradient(45deg, #3a1c71 30%, #d76d77 75%, #ffaf7b 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
        }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', py: isMobile ? 0.5 : 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Zoom in={true} style={{ transitionDelay: '150ms' }}>
              <RestaurantIcon sx={{ mr: 1, fontSize: isMobile ? 22 : 28 }} />
            </Zoom>
            <Fade in={true} timeout={800}>
              <Typography 
                variant={isMobile ? "subtitle1" : "h6"} 
                component="div" 
                sx={{ 
                  fontWeight: 'bold',
                  letterSpacing: 0.8,
                  textShadow: '1px 1px 2px rgba(0,0,0,0.2)'
                }}
              >
                MESA {tableId}
              </Typography>
            </Fade>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: isMobile ? 0.5 : 1 }}>
            {showSearch ? (
              <Fade in={showSearch}>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    bgcolor: 'rgba(255,255,255,0.15)', 
                    borderRadius: 2, 
                    px: 1,
                    py: 0.5,
                    mr: isMobile ? 0.5 : 1,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.25)'
                    }
                  }}
                >
                  <TextField
                    placeholder={t('common.search_item_placeholder')}
                    variant="standard"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      disableUnderline: true,
                      style: { color: 'white' },
                    }}
                    sx={{ 
                      width: isMobile ? 80 : 150,
                      '& input::placeholder': {
                        color: 'rgba(255,255,255,0.7)',
                        fontSize: isMobile ? '0.8rem' : '0.9rem'
                      }
                    }}
                  />
                  <IconButton 
                    size="small" 
                    onClick={toggleSearch}
                    sx={{ color: 'white', p: 0.5 }}
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Fade>
            ) : (
              <IconButton 
                color="inherit" 
                onClick={toggleSearch}
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.1)',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.2)'
                  }
                }}
              >
                <SearchIcon sx={{ fontSize: isMobile ? 20 : 24 }} />
              </IconButton>
            )}
            
            <IconButton 
              color="inherit" 
              onClick={toggleFavoritesView}
              sx={{ 
                bgcolor: showFavorites ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.2)'
                }
              }}
            >
              <StarIcon sx={{ 
                color: showFavorites ? '#FFD700' : 'inherit',
                fontSize: isMobile ? 20 : 24 
              }} />
            </IconButton>
            
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
                    color: '#3a1c71',
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
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* Espaço para compensar a AppBar fixa */}
      <Toolbar />
      
      {/* Main content */}
      <Container maxWidth="lg" sx={{ flexGrow: 1, py: 2 }}>
        {sessionStatus && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Status da Sessão: {sessionStatus.status.replace(/_/g, ' ')}
            {sessionStatus.pending_calls && sessionStatus.pending_calls.length > 0 && (
              <>
                <br />
                Chamadas Pendentes: {sessionStatus.pending_calls.map(call => call.type).join(', ')}
              </>
            )}
          </Alert>
        )}
        
        {/* Search results indicator */}
        {searchTerm && (
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="subtitle1">
              {t('common.search_results_for')}: <strong>{searchTerm}</strong>
            </Typography>
            <Button 
              size="small" 
              onClick={() => setSearchTerm('')}
              startIcon={<ClearIcon />}
              color="primary"
              variant="outlined"
            >
              {t('common.clear_search')}
            </Button>
          </Box>
        )}

        {/* Favorites view indicator */}
        {showFavorites && (
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center' }}>
              <StarIcon sx={{ color: '#FFD700', mr: 1 }} /> Meus Favoritos
            </Typography>
            <Button 
              size="small" 
              onClick={toggleFavoritesView}
              color="primary"
              variant="outlined"
            >
              Ver Todos
            </Button>
          </Box>
        )}
        
        {/* Tabs de categorias */}
        <Paper 
          elevation={0}
          sx={{ 
            mb: 2, 
            borderRadius: 2, 
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}
        >
          <Tabs 
            value={selectedCategory} 
            onChange={handleCategoryChange} 
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              bgcolor: 'white',
              '& .MuiTab-root': { 
                color: '#3a1c71', 
                textTransform: 'none',
                fontWeight: 'medium',
                fontSize: '0.95rem',
                py: 1.5,
                minWidth: 'auto',
                px: 2.5,
                transition: 'all 0.3s ease',
                '&:hover': {
                  color: '#d76d77',
                  bgcolor: 'rgba(215, 109, 119, 0.05)'
                }
              },
              '& .Mui-selected': { 
                color: '#3a1c71', 
                fontWeight: 'bold' 
              },
              '& .MuiTabs-indicator': { 
                backgroundColor: '#d76d77',
                height: 3,
                borderRadius: '3px 3px 0 0'
              }
            }}
          >
            {categories.map((category, index) => (
              <Tab label={category} key={index} />
            ))}
          </Tabs>
        </Paper>
        
        {/* Lista de produtos da categoria selecionada */}
        {categories.length > 0 && (
          <Box>
            {(showFavorites ? 
              // Show favorites
              categories.flatMap(category => 
                menuData.categories[category].filter(item => favorites.includes(item.id))
              ) : 
              // Show filtered products from selected category or search results
              searchTerm ? 
                filterProducts(menuData.products) :
                categories.map((category, index) => (
                  <Box key={category} sx={{ display: selectedCategory === index ? 'block' : 'none' }}>
                    <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: '#8B0000' }}>
                      {category}
                    </Typography>
                    <Grid container spacing={2}>
                      {menuData.categories[category].map((item) => (
                        <Grid item xs={12} sm={6} md={4} key={item.id}>
                          <Card 
                        elevation={0}
                        sx={{ 
                          height: '100%', 
                          borderRadius: 3,
                          overflow: 'hidden',
                          border: '1px solid rgba(0,0,0,0.05)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-5px)',
                            boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
                            '& .product-image': {
                              transform: 'scale(1.05)'
                            }
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                          <Box sx={{ position: 'relative', overflow: 'hidden', height: 160 }}>
                            <CardMedia
                              component="img"
                              height="160"
                              image={item.imageUrl || `https://source.unsplash.com/random/300x200?food&sig=${item.id}`}
                              alt={item.name}
                              sx={{ 
                                transition: 'transform 0.5s ease',
                                objectFit: 'cover',
                              }}
                              className="product-image"
                            />
                            <Box sx={{ 
                              position: 'absolute', 
                              bottom: 0, 
                              left: 0, 
                              right: 0, 
                              height: '50%', 
                              background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)',
                              zIndex: 1 
                            }} />
                            {item.featured && (
                              <Chip
                                label="Destaque"
                                size="small"
                                sx={{
                                  position: 'absolute',
                                  top: 8,
                                  left: 8,
                                  bgcolor: '#d76d77',
                                  color: 'white',
                                  fontWeight: 'bold',
                                  fontSize: 10,
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                  zIndex: 2
                                }}
                              />
                            )}
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(item.id);
                              }}
                              sx={{
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                bgcolor: 'rgba(255, 255, 255, 0.8)',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                zIndex: 2,
                                '&:hover': { 
                                  bgcolor: 'rgba(255, 255, 255, 0.95)',
                                  transform: 'scale(1.1)'
                                },
                                width: 32,
                                height: 32
                              }}
                            >
                              {isFavorite(item.id) ? (
                                <StarIcon sx={{ color: '#FFD700', fontSize: 18 }} />
                              ) : (
                                <StarBorderIcon sx={{ fontSize: 18 }} />
                              )}
                            </IconButton>
                          </Box>
                          <CardContent sx={{ flexGrow: 1, p: isMobile ? 2 : 2.5 }}>
                            <Typography 
                              gutterBottom 
                              variant="h6" 
                              component="div" 
                              sx={{ 
                                fontWeight: 'bold',
                                fontSize: isMobile ? 16 : 18,
                                color: '#3a1c71',
                                display: '-webkit-box',
                                WebkitLineClamp: 1,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                lineHeight: 1.3,
                                mb: 0.5
                              }}
                            >
                              {item.name}
                            </Typography>
                            <Typography 
                              variant="body2" 
                              color="text.secondary" 
                              sx={{ 
                                mb: 2,
                                fontSize: isMobile ? 13 : 14,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                height: 40,
                                opacity: 0.8
                              }}
                            >
                              {item.description}
                            </Typography>
                            <Box sx={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center',
                              mt: item.description ? 0 : 2 
                            }}>
                              <Typography 
                                variant="h6" 
                                sx={{ 
                                  color: '#d76d77', 
                                  fontWeight: 'bold',
                                  fontSize: isMobile ? 16 : 18
                                }}
                              >
                                R$ {Number(item.price).toFixed(2).replace('.', ',')}
                              </Typography>
                              <Button 
                                variant="contained" 
                                size="small" 
                                onClick={() => addToCart(item)}
                                startIcon={<AddShoppingCartIcon />}
                                sx={{ 
                                  bgcolor: '#3a1c71', 
                                  '&:hover': { 
                                    bgcolor: '#2a1555',
                                    boxShadow: '0 4px 12px rgba(58, 28, 113, 0.4)',
                                  },
                                  textTransform: 'none',
                                  borderRadius: 6,
                                  px: 2,
                                  boxShadow: '0 2px 8px rgba(58, 28, 113, 0.3)',
                                  transition: 'all 0.3s ease'
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
                ))
            )}
            
            {/* Empty state for search or favorites */}
            {((showFavorites && favorites.length === 0) || 
              (searchTerm && filterProducts(menuData.products).length === 0)) && (
              <Paper 
                elevation={0}
                sx={{ 
                  p: 5, 
                  textAlign: 'center', 
                  borderRadius: 3,
                  bgcolor: 'white',
                  border: '1px dashed rgba(0,0,0,0.1)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  mt: 2
                }}
              >
                {showFavorites ? (
                  <>
                    <StarBorderIcon sx={{ fontSize: 70, color: '#FFD700', mb: 2, opacity: 0.8 }} />
                    <Typography variant="h6" sx={{ color: '#3a1c71', fontWeight: 'medium' }}>
                      Você ainda não tem favoritos
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3, maxWidth: 400, mx: 'auto' }}>
                      Marque produtos como favoritos clicando no ícone de estrela para encontrá-los facilmente depois
                    </Typography>
                  </>
                ) : (
                  <>
                    <SearchOffIcon sx={{ fontSize: 70, color: '#d76d77', mb: 2, opacity: 0.8 }} />
                    <Typography variant="h6" sx={{ color: '#3a1c71', fontWeight: 'medium' }}>
                      {t('common.no_products_found_for_search', { searchTerm })}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3, maxWidth: 400, mx: 'auto' }}>
                      {t('common.try_other_terms_or_browse_categories')}
                    </Typography>
                  </>
                )}
                <Button 
                  variant="contained" 
                  color="primary" 
                  startIcon={showFavorites ? <ArrowBackIcon /> : <ClearIcon />}
                  onClick={showFavorites ? toggleFavoritesView : () => setSearchTerm('')}
                  sx={{ 
                    mt: 1,
                    bgcolor: '#3a1c71',
                    borderRadius: 6,
                    px: 3,
                    py: 1,
                    boxShadow: '0 2px 8px rgba(58, 28, 113, 0.3)',
                    '&:hover': {
                      bgcolor: '#2a1555',
                      boxShadow: '0 4px 12px rgba(58, 28, 113, 0.4)',
                    }
                  }}
                >
                  {showFavorites ? 'Ver Todos os Produtos' : 'Limpar Busca'}
                </Button>
              </Paper>
            )}
          </Box>
        )}
      </Container>
      
      {/* Scroll to top button */}
      <Zoom in={showScrollTop}>
        <Fab 
          color="primary" 
          size="small" 
          aria-label="scroll back to top"
          onClick={scrollToTop}
          sx={{ 
            position: 'fixed', 
            bottom: 80, 
            right: 16,
            bgcolor: '#d76d77',
            '&:hover': { bgcolor: '#c25e68' },
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
            zIndex: 10
          }}
        >
          <KeyboardArrowUpIcon />
        </Fab>
      </Zoom>

      {/* Barra de ações inferior */}
      {sessionId && (
        <Paper 
          sx={{ 
            position: 'fixed', 
            bottom: 0, 
            left: 0, 
            right: 0, 
            zIndex: 2,
            borderTop: '1px solid rgba(0,0,0,0.05)',
            boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }} 
          elevation={0}
        >
          <BottomNavigation 
            showLabels 
            sx={{ 
              bgcolor: 'white',
              height: 65,
              '& .MuiBottomNavigationAction-root': {
                color: 'rgba(58, 28, 113, 0.7)',
                transition: 'all 0.3s ease',
                '&.Mui-selected': {
                  color: '#3a1c71'
                },
                '&:hover': {
                  bgcolor: 'rgba(58, 28, 113, 0.05)'
                }
              }
            }}
          >
            <BottomNavigationAction 
              label="Chamar Garçom" 
              icon={<NotificationsIcon />} 
              onClick={() => setOpenWaiterDialog(true)}
              sx={{
                '& .MuiSvgIcon-root': {
                  fontSize: 26,
                  mb: 0.5,
                  color: '#d76d77'
                }
              }}
            />
            <BottomNavigationAction 
              label="Carrinho" 
              icon={
                <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                  <ShoppingCartIcon sx={{ fontSize: 26, color: '#3a1c71' }} />
                  {cartItems.length > 0 && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -5,
                        right: -5,
                        bgcolor: '#d76d77',
                        color: 'white',
                        borderRadius: '50%',
                        width: 18,
                        height: 18,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 11,
                        fontWeight: 'bold',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                      }}
                    >
                      {cartItems.reduce((total, item) => total + item.quantity, 0)}
                    </Box>
                  )}
                </Box>
              } 
              onClick={() => setCartOpen(true)}
            />
            <BottomNavigationAction 
              label="Solicitar Conta" 
              icon={<ReceiptIcon />} 
              onClick={() => requestBillMutation.mutate(sessionId)}
              sx={{
                '& .MuiSvgIcon-root': {
                  fontSize: 26,
                  mb: 0.5,
                  color: '#ffaf7b'
                }
              }}
            />
          </BottomNavigation>
        </Paper>
      )}

      {/* Dialog for Call Waiter */}
      <Dialog 
        open={openWaiterDialog} 
        onClose={() => setOpenWaiterDialog(false)}
        TransitionComponent={Slide}
        TransitionProps={{ direction: 'up' }}
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxWidth: isMobile ? '90%' : '400px',
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(to right, #3a1c71, #d76d77, #ffaf7b)',
          color: 'white',
          py: 1.5
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <NotificationsIcon sx={{ mr: 1 }} />
            <Typography variant="h6">Chamar Garçom</Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 2, px: 3 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Mensagem (opcional)"
            type="text"
            fullWidth
            variant="outlined"
            value={waiterCallDescription}
            onChange={(e) => setWaiterCallDescription(e.target.value)}
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Um garçom será notificado e virá até sua mesa em instantes.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => setOpenWaiterDialog(false)} 
            color="inherit"
            sx={{ textTransform: 'none' }}
          >
            Cancelar
          </Button>
          <Button 
            variant="contained"
            onClick={() => callWaiterMutation.mutate({ sessionId, description: waiterCallDescription })}
            sx={{ 
              bgcolor: '#3a1c71', 
              '&:hover': { bgcolor: '#2a1555' },
              textTransform: 'none'
            }}
            startIcon={<NotificationsActiveIcon />}
          >
            Enviar Chamada
          </Button>
        </DialogActions>
      </Dialog>
      
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
            background: 'linear-gradient(to right, #3a1c71, #d76d77, #ffaf7b)',
            color: 'white',
            py: 2
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ShoppingCartIcon sx={{ mr: 1 }} />
              <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', flexGrow: 1 }}>
                Carrinho de Compras
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Chip 
                label={`${cartItems.length} ${cartItems.length === 1 ? 'item' : 'itens'}`} 
                size="small" 
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  color: 'white',
                  fontWeight: 'bold',
                  mr: 1,
                  display: cartItems.length > 0 ? 'flex' : 'none'
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
                      bgcolor: '#3a1c71', 
                      '&:hover': { bgcolor: '#2a1555' },
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
                          src={item.imageUrl || `https://source.unsplash.com/random/300x200?food&sig=${item.id}`} 
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
                          <Typography variant="body2" color="primary" sx={{ fontWeight: 'bold', mt: 0.5, color: '#d76d77' }}>
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
                            color: item.quantity <= 1 ? 'text.disabled' : '#d76d77',
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
                          sx={{ color: '#d76d77' }}
                        >
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      <IconButton 
                        edge="end" 
                        onClick={() => removeFromCart(item.id)}
                        sx={{ 
                          color: 'text.secondary',
                          '&:hover': { color: '#d76d77' }
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
                <Typography variant="h5" sx={{ color: '#d76d77', fontWeight: 'bold' }}>
                  R$ {cartItems.reduce((total, item) => total + (Number(item.price) * item.quantity), 0).toFixed(2)}
                </Typography>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ 
          px: 3, 
          py: 2,
          borderTop: '1px solid rgba(0,0,0,0.05)',
          bgcolor: '#f9f9f9'
        }}>
          <Button 
            onClick={() => setCartOpen(false)} 
            sx={{ 
              color: 'text.secondary',
              textTransform: 'none',
              fontWeight: 'medium'
            }}
          >
            Fechar
          </Button>
          {cartItems.length > 0 && (
            <Button 
              onClick={handlePlaceOrder} 
              variant="contained" 
              sx={{ 
                bgcolor: '#3a1c71', 
                '&:hover': { bgcolor: '#2a1555' },
                textTransform: 'none',
                px: 3,
                py: 1,
                borderRadius: 2,
                fontWeight: 'bold',
                boxShadow: '0 2px 8px rgba(58, 28, 113, 0.3)'
              }}
              disabled={sessionStatus !== 'active'}
              startIcon={<SendIcon />}
            >
              Finalizar Pedido
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PublicDineInMenu;