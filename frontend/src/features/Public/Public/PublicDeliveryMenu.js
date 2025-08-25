import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tabs,
  Tab,
  AppBar,
  Toolbar,
  IconButton,
  Divider,
  Paper,
  Container,
  useTheme,
  useMediaQuery,
  Chip,
  InputAdornment,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  Restaurant as RestaurantIcon,
  ShoppingCart as ShoppingCartIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  Payment as PaymentIcon,
  Notes as NotesIcon,
} from '@mui/icons-material';
import toast from 'react-hot-toast';
import {
  useGetPublicMenu,
  useGetPublicRestaurant,
  useCreateDeliveryOrder,
} from '../api/publicService';

const PublicDeliveryMenu = () => {
  const { t } = useTranslation();
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

  const { data: products, isLoading, isError } = useGetPublicMenu(restaurantSlug);
  const { data: restaurantData } = useGetPublicRestaurant(restaurantSlug);
  const orderMutation = useCreateDeliveryOrder();

  const handleCheckout = () => {
    if (!customerName || !customerPhone || !deliveryAddress) {
      toast.error(t('public_delivery_menu.fill_required_fields_toast'));
      return;
    }
    const orderData = {
      restaurant_id: restaurantData.id,
      delivery_type: 'delivery',
      total_amount: cartTotal,
      items: cartItems.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
        name: item.name,
      })),
      customer_details: { name: customerName, phone: customerPhone },
      delivery_address: { address: deliveryAddress },
      payment_method: paymentMethod,
      notes: notes,
    };
    orderMutation.mutate(orderData, {
      onSuccess: () => {
        setCartItems([]);
        setCartOpen(false);
      },
    });
  };

  const addToCart = (item) => {
    setCartItems((prev) => {
      const exist = prev.find((x) => x.id === item.id);
      if (exist) {
        return prev.map((x) => (x.id === item.id ? { ...exist, quantity: exist.quantity + 1 } : x));
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

  const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const totalItemsInCart = cartItems.reduce((total, item) => total + item.quantity, 0);

  if (isLoading)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  if (isError)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Alert severity="error">{t('public_delivery_menu.error_loading_menu')}</Alert>
      </Box>
    );

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Group products by category
  const productsByCategory = products.reduce((acc, product) => {
    const category = product.category || t('public_delivery_menu.uncategorized');
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(product);
    return acc;
  }, {});

  return (
    <Box sx={{ maxWidth: '500px', margin: '0 auto', backgroundColor: '#f9f9f9' }}>
      <AppBar position="sticky" className="bg-red-600 text-white p-4 top-0 z-50 shadow-md">
        <Toolbar className="max-w-6xl mx-auto flex justify-between items-center">
          <Box className="text-2xl font-bold flex items-center">
            <RestaurantIcon sx={{ marginRight: '10px' }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white' }}>
              {t('public_delivery_menu.my_menu_title')}
            </Typography>
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
              {totalItemsInCart > 0 && (
                <Chip
                  label={totalItemsInCart}
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    backgroundColor: '#50a773',
                    color: 'white',
                  }}
                />
              )}
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Box className="bg-white p-5 mb-5">
        <Box className="max-w-6xl mx-auto flex items-center">
          <img
            src={
              restaurantData?.logo
                ? `${API_URL}${restaurantData.logo}`
                : 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cmVzdGF1cmFudHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60'
            }
            alt="Restaurante"
            className="w-24 h-24 rounded-lg object-cover mr-5 shadow-md"
          />
          <Box className="restaurant-details">
            <Typography variant="h6" component="h2" sx={{ fontSize: '22px', marginBottom: '5px' }}>
              {restaurantData?.name || t('public_delivery_menu.restaurant_placeholder_name')}
            </Typography>
            <Box className="flex mb-2 text-gray-600 text-sm">
              <Typography component="span" className="mr-4 flex items-center">
                <i className="fas fa-star mr-1 text-red-600"></i> 4.8 (250+)
              </Typography>
              <Typography component="span" className="mr-4 flex items-center">
                <i className="fas fa-clock mr-1 text-red-600"></i> 30-45 min
              </Typography>
              <Typography component="span" className="mr-4 flex items-center">
                <i className="fas fa-tag mr-1 text-red-600"></i> $ - Média
              </Typography>
              <Typography component="span" className="mr-4 flex items-center">
                <i className="fas fa-map-marker-alt mr-1 text-red-600"></i> 1.2 km
              </Typography>
            </Box>
            <Typography variant="body2">
              {t('public_delivery_menu.cuisine_description_placeholder')}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ p: 2, backgroundColor: '#f9f9f9' }}>
        <TextField
          fullWidth
          placeholder={t('public_delivery_menu.search_placeholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            sx: { borderRadius: '12px', backgroundColor: 'white' },
          }}
        />
      </Box>

      <Box className="max-w-6xl mx-auto px-5 flex overflow-x-auto pb-2 mb-5">
        <Box sx={{ display: 'flex', overflowX: 'auto', gap: 1, pb: 1 }}>
          <Chip
            label={t('public_delivery_menu.all_categories_chip')}
            onClick={() => setSelectedCategory('all')}
            className={
              selectedCategory === 'all'
                ? 'px-4 py-2 mr-2 bg-red-600 text-white rounded-full text-sm whitespace-nowrap cursor-pointer border border-gray-200 transition-all duration-300'
                : 'px-4 py-2 mr-2 bg-white rounded-full text-sm whitespace-nowrap cursor-pointer border border-gray-200 transition-all duration-300'
            }
          />
          {productsByCategory &&
            Object.keys(productsByCategory).map((cat) => (
              <Chip
                key={cat}
                label={cat}
                onClick={() => setSelectedCategory(cat)}
                className={
                  selectedCategory === cat
                    ? 'px-4 py-2 mr-2 bg-red-600 text-white rounded-full text-sm whitespace-nowrap cursor-pointer border border-gray-200 transition-all duration-300'
                    : 'px-4 py-2 mr-2 bg-white rounded-full text-sm whitespace-nowrap cursor-pointer border border-gray-200 transition-all duration-300'
                }
              />
            ))}
        </Box>
      </Box>

      <main className="max-w-6xl mx-auto px-5 grid grid-cols-1 gap-5">
        {productsByCategory &&
          Object.keys(productsByCategory).map((categoryName) => (
            <section className="bg-white rounded-lg p-4 shadow-sm" key={categoryName}>
              <h3 className="text-lg mb-4 pb-2 border-b border-gray-200 text-red-600">
                {categoryName}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {productsByCategory[categoryName]
                  .filter(
                    (item) =>
                      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      (item.description &&
                        item.description.toLowerCase().includes(searchTerm.toLowerCase()))
                  )
                  .map((item) => {
                    const currentItemInCart = cartItems.find((cartItem) => cartItem.id === item.id);
                    const quantityInCart = currentItemInCart ? currentItemInCart.quantity : 0;

                    return (
                      <div
                        className="flex justify-between p-3 rounded-lg transition-all duration-300 border border-transparent hover:border-gray-200 hover:shadow-sm"
                        key={item.id}
                      >
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">{item.name}</h4>
                          <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                          <p className="font-bold text-gray-800">
                            R$ {Number(item.price).toFixed(2)}
                          </p>
                          <div className="flex items-center mt-2">
                            <div className="flex items-center mr-4 border border-gray-300 rounded-full p-0.5 px-2">
                              <button
                                className="bg-transparent border-none text-base cursor-pointer text-red-600"
                                onClick={() => removeFromCart(item)}
                              >
                                -
                              </button>
                              <span className="mx-2">{quantityInCart}</span>
                              <button
                                className="bg-transparent border-none text-base cursor-pointer text-red-600"
                                onClick={() => addToCart(item)}
                              >
                                +
                              </button>
                            </div>
                            <button
                              className="bg-red-600 text-white border-none px-4 py-2 rounded-md cursor-pointer font-semibold transition-all duration-300 hover:bg-red-700"
                              onClick={() => addToCart(item)}
                            >
                              {t('public_delivery_menu.add_button')}
                            </button>
                          </div>
                        </div>
                        <img
                          src={
                            item.image_url ||
                            `https://source.unsplash.com/random/300x200?food&sig=${item.id}`
                          }
                          alt={item.name}
                          className="w-20 h-20 rounded-lg object-cover ml-4"
                        />
                      </div>
                    );
                  })}
              </div>
            </section>
          ))}
      </main>

      {totalItemsInCart > 0 && !cartOpen && (
        <div
          className="fixed bottom-5 right-5 bg-red-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-lg cursor-pointer z-40"
          onClick={() => setCartOpen(true)}
        >
          <ShoppingCartIcon />
          <span className="absolute -top-1.5 -right-1.5 bg-green-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
            {totalItemsInCart}
          </span>
        </div>
      )}

      <Dialog
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        fullScreen={isMobile}
        PaperProps={{ sx: { borderRadius: { sm: '24px' } } }}
      >
        <DialogTitle
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          {t('public_delivery_menu.your_order_title')}
          <IconButton onClick={() => setCartOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {cartItems.map((item) => (
            <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
              <Avatar
                src={item.image_url ? item.image_url : ''}
                sx={{ width: 80, height: 80, borderRadius: '10px' }}
              />
              <Box sx={{ flexGrow: 1 }}>
                <Typography sx={{ fontWeight: 700 }}>{item.name}</Typography>
                <Typography color="primary" sx={{ fontWeight: 700 }}>
                  R$ {(item.price * item.quantity).toFixed(2)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton size="small" onClick={() => removeFromCart(item)}>
                  <RemoveIcon />
                </IconButton>
                <Typography>{item.quantity}</Typography>
                <IconButton size="small" onClick={() => addToCart(item)}>
                  <AddIcon />
                </IconButton>
              </Box>
            </Box>
          ))}
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            {t('public_delivery_menu.delivery_info_title')}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('public_delivery_menu.full_name_label')}
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('public_delivery_menu.phone_whatsapp_label')}
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('public_delivery_menu.full_address_label')}
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                multiline
                rows={3}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <HomeIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('public_delivery_menu.payment_method_label')}
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PaymentIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('public_delivery_menu.notes_optional_label')}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <NotesIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ flexDirection: 'column', p: 2 }}>
          <Box sx={{ width: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography>{t('public_delivery_menu.subtotal_label')}</Typography>
              <Typography>R$ {cartTotal.toFixed(2)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography>{t('public_delivery_menu.delivery_fee_label')}</Typography>
              <Typography>R$ 5.00</Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {t('public_delivery_menu.total_label')}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                R$ {(cartTotal + 5).toFixed(2)}
              </Typography>
            </Box>
          </Box>
          <Button
            onClick={handleCheckout}
            fullWidth
            variant="contained"
            sx={{ mt: 2, py: 1.5, borderRadius: '12px', fontWeight: 700 }}
            disabled={orderMutation.isLoading}
          >
            {orderMutation.isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              t('public_delivery_menu.finish_order_button')
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PublicDeliveryMenu;
