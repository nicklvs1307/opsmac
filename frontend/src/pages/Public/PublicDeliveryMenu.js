import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, CircularProgress, Alert, Card, CardContent, CardMedia, Grid, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Tabs, Tab, AppBar, Toolbar, IconButton, Divider, Paper, Container, useTheme, alpha } from '@mui/material';
import { useQuery } from 'react-query';
import axiosInstance from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import { Restaurant as RestaurantIcon, ShoppingCart as ShoppingCartIcon, Search as SearchIcon, LocalDining as LocalDiningIcon, Phone as PhoneIcon, Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';

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
  const { restaurantSlug } = useParams();
  const theme = useTheme();
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [openProductModal, setOpenProductModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [notes, setNotes] = useState('');
  
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
    if (!customerName || !customerPhone || !deliveryAddress) {
      toast.error('Por favor, preencha seu nome, telefone e endereço de entrega.');
      return;
    }

    const totalAmount = cartItems.reduce((total, item) => total + (Number(item.price) * item.quantity), 0);

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
      await axiosInstance.post('/api/public/orders', orderData);
      toast.success('Pedido realizado com sucesso!');
      setCartItems([]);
      setCartOpen(false);
      setCustomerName('');
      setCustomerPhone('');
      setDeliveryAddress('');
      setPaymentMethod('');
      setNotes('');
    } catch (error) {
      console.error('Erro ao finalizar pedido:', error);
      toast.error(`Erro ao finalizar pedido: ${error.response?.data?.msg || error.message}`);
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

  const { data: restaurantDetails, isLoading: isLoadingRestaurant, isError: isErrorRestaurant } = useQuery(
    ['restaurantDetails', restaurantSlug],
    async () => {
      const { data } = await axiosInstance.get(`/api/public/restaurant/${restaurantSlug}`);
      return data;
    },
    {
      enabled: !!restaurantSlug,
      onError: (error) => {
        console.error('Erro ao carregar detalhes do restaurante:', error);
        toast.error(`Erro ao carregar detalhes do restaurante: ${error.response?.data?.msg || error.message}`);
      }
    }
  );

  if (isLoading || isLoadingRestaurant) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (isError || isErrorRestaurant) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Alert severity="error">Erro ao carregar o cardápio. Verifique o link ou tente novamente mais tarde.</Alert>
      </Box>
    );
  }

  if (!menuData || !menuData.products || menuData.products.length === 0 || !restaurantDetails) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography variant="h6">Nenhum item encontrado para este cardápio de delivery.</Typography>
      </Box>
    );
  }

  // Extrair categorias do menuData
  const categories = menuData ? Object.keys(menuData.categories) : [];
  
  // Filtrar produtos pelo termo de busca
  const filterProducts = (products) => {
    if (!searchTerm) return products;
    return products.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Header */}
      <AppBar position="fixed" sx={{ bgcolor: restaurantDetails.settings?.primary_color || '#8B0000' }}>
        <Toolbar>
          {restaurantDetails.logo && (
            <img src={restaurantDetails.logo} alt={restaurantDetails.name} style={{ height: 40, marginRight: 10 }} />
          )}
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {restaurantDetails.name}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 1, px: 1, mr: 2 }}>
            <SearchIcon sx={{ color: 'white', mr: 1 }} />
            <TextField
              placeholder="Buscar..."
              variant="standard"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                disableUnderline: true,
                style: { color: 'white' }
              }}
              sx={{ width: 120 }}
            />
          </Box>
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
        {/* Banner */}
        <Paper 
          sx={{ 
            p: 3, 
            mb: 3, 
            borderRadius: 2,
            backgroundImage: `linear-gradient(to right, ${restaurantDetails.settings?.primary_color || '#8B0000'}, ${restaurantDetails.settings?.secondary_color || '#D10000'})`,
            color: 'white',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Peça agora mesmo!
            </Typography>
            <Typography variant="body1">
              Entregamos em toda a cidade. Peça pelo WhatsApp.
            </Typography>
          </Box>
          <Button 
            variant="contained" 
            startIcon={<PhoneIcon />}
            sx={{ 
              mt: { xs: 2, sm: 0 },
              bgcolor: 'white', 
              color: '#8B0000',
              '&:hover': { bgcolor: '#f0f0f0' } 
            }}
            onClick={() => window.open('https://wa.me/5500000000000', '_blank')}
          >
            Pedir pelo WhatsApp
          </Button>
        </Paper>
        
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
                  {filterProducts(menuData.categories[category]).map((item) => (
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
              <Box sx={{ display: 'flex', justifyContent: 'space_between', mb: 2 }}>
                <Typography variant="h6">Total:</Typography>
                <Typography variant="h6" fontWeight="bold">
                  R$ {cartItems.reduce((total, item) => total + (Number(item.price) * item.quantity), 0).toFixed(2)}
                </Typography>
              </Box>
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>Detalhes para o Pedido</Typography>
                <TextField
                  label="Seu Nome Completo"
                  fullWidth
                  margin="normal"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />
                <TextField
                  label="Seu Telefone (com DDD)"
                  fullWidth
                  margin="normal"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  required
                />
                <TextField
                  label="Endereço de Entrega Completo"
                  fullWidth
                  margin="normal"
                  multiline
                  rows={3}
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  required
                />
                <TextField
                  label="Método de Pagamento (Ex: Dinheiro, Cartão, Pix)"
                  fullWidth
                  margin="normal"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <TextField
                  label="Observações (Ex: Sem cebola, Troco para R$50)"
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
            {t('common.close')}
          </Button>
          <Button
            variant="contained"
            sx={{ bgcolor: restaurantDetails.settings?.primary_color || '#8B0000', '&:hover': { bgcolor: alpha(restaurantDetails.settings?.primary_color || '#8B0000', 0.8) } }}
            onClick={() => {
              addToCart(selectedProduct);
              setOpenProductModal(false);
            }}
          >
            {t('common.add_to_cart')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PublicDeliveryMenu;