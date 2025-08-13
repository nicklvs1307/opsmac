import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, CircularProgress, Alert, Card, CardContent, CardMedia, Grid, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Tabs, Tab, AppBar, Toolbar, IconButton, Divider, Paper, Container, useTheme, alpha } from '@mui/material';
import { useQuery, useMutation } from 'react-query';
import axiosInstance from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import { Restaurant as RestaurantIcon, ShoppingCart as ShoppingCartIcon, LocalDining as LocalDiningIcon, Call as CallIcon, Receipt as ReceiptIcon, Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';

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
  const { tableId } = useParams();
  const theme = useTheme();
  const [sessionId, setSessionId] = useState(localStorage.getItem(`tableSession_${tableId}`));
  const [openWaiterDialog, setOpenWaiterDialog] = useState(false);
  const [waiterCallDescription, setWaiterCallDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [openProductModal, setOpenProductModal] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [notes, setNotes] = useState('');

  // Query for menu items
  const { data: menuData, isLoading: isLoadingMenu, isError: isErrorMenu } = useQuery(
    ['dineInMenu', tableId],
    () => fetchDineInMenu(tableId),
    {
      enabled: !!tableId,
    }
  );

  const { data: restaurantDetails, isLoading: isLoadingRestaurant, isError: isErrorRestaurant } = useQuery(
    ['restaurantDetails', menuData?.products?.[0]?.restaurant_id],
    async () => {
      const { data } = await axiosInstance.get(`/api/public/restaurant/${menuData.products[0].restaurant_id}`);
      return data;
    },
    {
      enabled: !!menuData?.products?.[0]?.restaurant_id,
      onError: (error) => {
        console.error('Erro ao carregar detalhes do restaurante:', error);
        toast.error(`Erro ao carregar detalhes do restaurante: ${error.response?.data?.msg || error.message}`);
      }
    }
  );
  
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
    if (cartItems.length === 0) {
      toast.error('Seu carrinho está vazio.');
      return;
    }

    const totalAmount = cartItems.reduce((total, item) => total + (Number(item.price) * item.quantity), 0);

    const orderData = {
      restaurant_id: menuData.products[0].restaurant_id, // Assuming all products belong to the same restaurant
      delivery_type: 'dine_in', // This component is for dine-in menu
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
      payment_method: paymentMethod,
      notes: notes,
      table_id: tableId, // Include table ID for dine-in orders
    };

    try {
      await axiosInstance.post('/api/public/orders', orderData);
      toast.success('Pedido realizado com sucesso!');
      setCartItems([]);
      setCartOpen(false);
      setCustomerName('');
      setCustomerPhone('');
      setPaymentMethod('');
      setNotes('');
    } catch (error) {
      console.error('Erro ao finalizar pedido:', error);
      toast.error(`Erro ao finalizar pedido: ${error.response?.data?.msg || error.message}`);
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

  if (isLoadingMenu || isLoadingRestaurant) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (isErrorMenu || isErrorRestaurant) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Alert severity="error">Erro ao carregar o cardápio. Verifique o link ou tente novamente mais tarde.</Alert>
      </Box>
    );
  }

  if (!menuData || !menuData.products || menuData.products.length === 0 || !restaurantDetails) {
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
      <AppBar position="fixed" sx={{ bgcolor: restaurantDetails.settings?.primary_color || '#8B0000' }}>
        <Toolbar>
          {restaurantDetails.logo && (
            <img src={restaurantDetails.logo} alt={restaurantDetails.name} style={{ height: 40, marginRight: 10 }} />
          )}
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {restaurantDetails.name} - MESA {tableId}
          </Typography>
          <IconButton 
            color="inherit" 
            onClick={() => setCartOpen(!cartOpen)}
            sx={{ position: 'relative' }}
          >
            <ShoppingCartIcon />
            {cartItems.length > 0 && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  bgcolor: 'white',
                  color: '#8B0000',
                  borderRadius: '50%',
                  width: 18,
                  height: 18,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 'bold'
                }}
              >
                {cartItems.reduce((total, item) => total + item.quantity, 0)}
              </Box>
            )}
          </IconButton>
        </Toolbar>
      </AppBar>
      
      {/* Espaço para compensar a AppBar fixa */}
      <Toolbar />
      
      {/* Conteúdo principal */}
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
        
        {/* Tabs de categorias */}
        <Paper sx={{ mb: 2, borderRadius: 2, overflow: 'hidden' }}>
          <Tabs 
            value={selectedCategory} 
            onChange={handleCategoryChange} 
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              bgcolor: restaurantDetails.settings?.primary_color || '#8B0000',
              '& .MuiTab-root': { color: 'white' },
              '& .Mui-selected': { color: 'white', fontWeight: 'bold' },
              '& .MuiTabs-indicator': { backgroundColor: restaurantDetails.settings?.secondary_color || 'white' }
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
            {categories.map((category, index) => (
              <Box key={category} sx={{ display: selectedCategory === index ? 'block' : 'none' }}>
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: '#8B0000' }}>
                  {category}
                </Typography>
                <Grid container spacing={2}>
                  {menuData.categories[category].map((item) => (
                    <Grid item xs={12} sm={6} md={4} key={item.id}>
                      <Card sx={{ 
                        display: 'flex', 
                        height: '100%', 
                        borderRadius: 2,
                        overflow: 'hidden',
                        boxShadow: 3
                      }} onClick={() => { setSelectedProduct(item); setOpenProductModal(true); }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                          <CardMedia
                            component="img"
                            sx={{ height: 180, objectFit: 'cover' }}
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
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <IconButton
                                  size="small"
                                  onClick={() => removeFromCart(item.id)}
                                  disabled={!cartItems.find(cartItem => cartItem.id === item.id)}
                                >
                                  <RemoveIcon />
                                </IconButton>
                                <Typography variant="body1">
                                  {cartItems.find(cartItem => cartItem.id === item.id)?.quantity || 0}
                                </Typography>
                                <IconButton
                                  size="small"
                                  onClick={() => addToCart(item)}
                                >
                                  <AddIcon />
                                </IconButton>
                              </Box>
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
      
      {/* Barra de ações inferior */}
      {sessionId && (
        <Paper 
          elevation={3} 
          sx={{ 
            position: 'fixed', 
            bottom: 0, 
            left: 0, 
            right: 0, 
            p: 2,
            display: 'flex',
            justifyContent: 'space-around',
            zIndex: 1100
          }}
        >
          <Button 
            variant="contained" 
            startIcon={<CallIcon />}
            onClick={() => setOpenWaiterDialog(true)}
            sx={{ bgcolor: restaurantDetails.settings?.primary_color || '#8B0000', '&:hover': { bgcolor: alpha(restaurantDetails.settings?.primary_color || '#8B0000', 0.8) } }}
          >
            Chamar Garçom
          </Button>
          <Button 
            variant="contained" 
            startIcon={<ReceiptIcon />}
            onClick={() => requestBillMutation.mutate(sessionId)}
            sx={{ bgcolor: restaurantDetails.settings?.primary_color || '#8B0000', '&:hover': { bgcolor: alpha(restaurantDetails.settings?.primary_color || '#8B0000', 0.8) } }}
          >
            Solicitar Conta
          </Button>
        </Paper>
      )}

      {/* Dialog for Call Waiter */}
      <Dialog open={openWaiterDialog} onClose={() => setOpenWaiterDialog(false)}>
        <DialogTitle sx={{ bgcolor: restaurantDetails.settings?.primary_color || '#8B0000', color: 'white' }}>Chamar Garçom</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
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
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenWaiterDialog(false)}>Cancelar</Button>
          <Button 
            variant="contained"
            onClick={() => callWaiterMutation.mutate({ sessionId, description: waiterCallDescription })}
            sx={{ bgcolor: restaurantDetails.settings?.primary_color || '#8B0000', '&:hover': { bgcolor: alpha(restaurantDetails.settings?.primary_color || '#8B0000', 0.8) } }}
          >
            Enviar Chamada
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Carrinho de compras */}
      <Dialog 
        open={cartOpen} 
        onClose={() => setCartOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ bgcolor: restaurantDetails.settings?.primary_color || '#8B0000', color: 'white' }}>
          Carrinho de Compras
        </DialogTitle>
        <DialogContent>
          {cartItems.length === 0 ? (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography variant="body1">Seu carrinho está vazio</Typography>
            </Box>
          ) : (
            <Box sx={{ mt: 2 }}>
              {cartItems.map(item => (
                <Paper key={item.id} sx={{ mb: 2, p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">{item.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        R$ {Number(item.price).toFixed(2)} x {item.quantity}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Button 
                        size="small" 
                        variant="outlined" 
                        onClick={() => removeFromCart(item.id)}
                        sx={{ minWidth: '30px', p: 0 }}
                      >
                        -
                      </Button>
                      <Typography>{item.quantity}</Typography>
                      <Button 
                        size="small" 
                        variant="outlined" 
                        onClick={() => addToCart(item)}
                        sx={{ minWidth: '30px', p: 0 }}
                      >
                        +
                      </Button>
                    </Box>
                  </Box>
                </Paper>
              ))}
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Total:</Typography>
                <Typography variant="h6" fontWeight="bold">
                  R$ {cartItems.reduce((total, item) => total + (Number(item.price) * item.quantity), 0).toFixed(2)}
                </Typography>
              </Box>
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>Detalhes para o Pedido</Typography>
                <TextField
                  label="Seu Nome (opcional)"
                  fullWidth
                  margin="normal"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
                <TextField
                  label="Seu Telefone (opcional)"
                  fullWidth
                  margin="normal"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
                <TextField
                  label="Método de Pagamento (Ex: Dinheiro, Cartão, Pix)"
                  fullWidth
                  margin="normal"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <TextField
                  label="Observações (Ex: Sem cebola)"
                  fullWidth
                  margin="normal"
                  multiline
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCartOpen(false)}>Fechar</Button>
          {cartItems.length > 0 && (
            <Button 
              variant="contained" 
              sx={{ bgcolor: restaurantDetails.settings?.primary_color || '#8B0000', '&:hover': { bgcolor: alpha(restaurantDetails.settings?.primary_color || '#8B0000', 0.8) } }}
              onClick={handleCheckout}
            >
              Finalizar Pedido
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Product Details Dialog */}
      <Dialog
        open={openProductModal}
        onClose={() => setOpenProductModal(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ bgcolor: theme.palette.primary.main, color: 'white' }}>
          {selectedProduct?.name}
        </DialogTitle>
        <DialogContent dividers>
          {selectedProduct?.imageUrl && (
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
              <img
                src={selectedProduct.imageUrl}
                alt={selectedProduct.name}
                style={{ maxWidth: '100%', maxHeight: 300, objectFit: 'contain' }}
              />
            </Box>
          )}
          <Typography variant="h6" gutterBottom>
            {selectedProduct?.name}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            {selectedProduct?.description}
          </Typography>
          <Typography variant="h5" color="primary" fontWeight="bold">
            R$ {Number(selectedProduct?.price).toFixed(2)}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
            <IconButton
              onClick={() => removeFromCart(selectedProduct?.id)}
              disabled={!cartItems.find(item => item.id === selectedProduct?.id)}
            >
              <RemoveIcon />
            </IconButton>
            <Typography variant="h6" sx={{ mx: 1 }}>
              {cartItems.find(item => item.id === selectedProduct?.id)?.quantity || 0}
            </Typography>
            <IconButton onClick={() => addToCart(selectedProduct)}>
              <AddIcon />
            </IconButton>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenProductModal(false)}>
            Fechar
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              addToCart(selectedProduct);
              setOpenProductModal(false);
            }}
          >
            Adicionar ao Carrinho
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PublicDineInMenu;