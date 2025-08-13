import React, { useState, useMemo } from 'react';
import { Box, Typography, CircularProgress, Alert, Card, CardContent, Grid, Button, MenuItem, Select, FormControl, InputLabel, IconButton, Divider, Switch, FormControlLabel, Paper, TextField, List, ListItem, ListItemText } from '@mui/material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axiosInstance from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import { Refresh as RefreshIcon, Store as StoreIcon, PointOfSale as PointOfSaleIcon, AddShoppingCart as AddShoppingCartIcon, RemoveShoppingCart as RemoveShoppingCartIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const fetchOrders = async ({ queryKey }) => {
  const [, filterStatus] = queryKey;
  const { data } = await axiosInstance.get(`/orders${filterStatus ? `?status=${filterStatus}` : ''}`);
  return data;
};

const fetchRestaurantStatus = async (restaurantId) => {
  const { data } = await axiosInstance.get(`/restaurant/${restaurantId}`);
  return data;
};

const fetchProducts = async ({ queryKey }) => {
  const [, restaurantId, categoryId, searchTerm] = queryKey;
  let url = `/products?restaurant_id=${restaurantId}`;
  if (categoryId) {
    url += `&category_id=${categoryId}`;
  }
  if (searchTerm) {
    url += `&search=${searchTerm}`;
  }
  const { data } = await axiosInstance.get(url);
  return data;
};

const fetchCategories = async (restaurantId) => {
  const { data } = await axiosInstance.get(`/categories?restaurant_id=${restaurantId}`);
  return data;
};

const updateOrderStatus = async ({ orderId, status }) => {
  const { data } = await axiosInstance.put(`/orders/${orderId}/status`, { status });
  return data;
};

const updateRestaurantOpenStatus = async ({ restaurantId, is_open }) => {
  const { data } = await axiosInstance.put(`/restaurant/${restaurantId}/status/open`, { is_open });
  return data;
};

const updateRestaurantPosStatus = async ({ restaurantId, pos_status }) => {
  const { data } = await axiosInstance.put(`/restaurant/${restaurantId}/pos-status`, { pos_status });
  return data;
};

const createOrder = async (orderData) => {
  const { data } = await axiosInstance.post('/public/orders', orderData);
  return data;
};

const Pdv = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const restaurantId = user?.restaurants?.[0]?.id;

  // Order Management State
  const [filterStatus, setFilterStatus] = useState('');

  // POS State
  const [cartItems, setCartItems] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedProductCategory, setSelectedProductCategory] = useState('');
  const [productSearchTerm, setProductSearchTerm] = useState('');

  // Fetch Data
  const { data: orders, isLoading: isLoadingOrders, isError: isErrorOrders } = useQuery(
    ['orders', filterStatus],
    fetchOrders,
    {
      enabled: !!restaurantId,
      refetchInterval: 5000,
      onError: (error) => {
        toast.error(t('pdv.error_loading_orders', { message: error.response?.data?.msg || error.message }));
      }
    }
  );

  const { data: restaurantStatus, isLoading: isLoadingRestaurantStatus, isError: isErrorRestaurantStatus } = useQuery(
    ['restaurantStatus', restaurantId],
    () => fetchRestaurantStatus(restaurantId),
    {
      enabled: !!restaurantId,
      refetchInterval: 15000,
      onError: (error) => {
        toast.error(t('pdv.error_loading_restaurant_status', { message: error.response?.data?.msg || error.message }));
      }
    }
  );

  const { data: products, isLoading: isLoadingProducts, isError: isErrorProducts } = useQuery(
    ['products', restaurantId, selectedProductCategory, productSearchTerm],
    fetchProducts,
    {
      enabled: !!restaurantId,
      onError: (error) => {
        toast.error(t('pdv.error_loading_products', { message: error.response?.data?.msg || error.message }));
      }
    }
  );

  const { data: categories, isLoading: isLoadingCategories, isError: isErrorCategories } = useQuery(
    ['categories', restaurantId],
    () => fetchCategories(restaurantId),
    {
      enabled: !!restaurantId,
      onError: (error) => {
        toast.error(t('pdv.error_loading_categories', { message: error.response?.data?.msg || error.message }));
      }
    }
  );

  // Mutations
  const updateOrderStatusMutation = useMutation(updateOrderStatus, {
    onSuccess: () => {
      toast.success(t('pdv.order_status_updated'));
      queryClient.invalidateQueries('orders');
    },
    onError: (error) => {
      toast.error(t('pdv.error_updating_order_status', { message: error.response?.data?.msg || error.message }));
    }
  });

  const updateRestaurantOpenStatusMutation = useMutation(updateRestaurantOpenStatus, {
    onSuccess: () => {
      toast.success(t('pdv.store_status_updated'));
      queryClient.invalidateQueries(['restaurantStatus', restaurantId]);
    },
    onError: (error) => {
      toast.error(t('pdv.error_updating_store_status', { message: error.response?.data?.msg || error.message }));
    }
  });

  const updateRestaurantPosStatusMutation = useMutation(updateRestaurantPosStatus, {
    onSuccess: () => {
      toast.success(t('pdv.pos_status_updated'));
      queryClient.invalidateQueries(['restaurantStatus', restaurantId]);
    },
    onError: (error) => {
      toast.error(t('pdv.error_updating_pos_status', { message: error.response?.data?.msg || error.message }));
    }
  });

  const createOrderMutation = useMutation(createOrder, {
    onSuccess: () => {
      toast.success(t('pdv.order_created_success'));
      resetOrderForm();
      queryClient.invalidateQueries('orders'); // Refresh order list
    },
    onError: (error) => {
      toast.error(t('pdv.error_creating_order', { message: error.response?.data?.msg || error.message }));
    }
  });

  // Helper Functions
  const calculateTotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [cartItems]);

  const handleAddToCart = (product) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.product_id === product.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.product_id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [
          ...prevItems,
          {
            product_id: product.id,
            name: product.name,
            price: parseFloat(product.price),
            quantity: 1,
            sku: product.sku,
          },
        ];
      }
    });
  };

  const handleRemoveFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.product_id !== productId));
  };

  const handleQuantityChange = (productId, newQuantity) => {
    setCartItems(prevItems => {
      return prevItems.map(item =>
        item.product_id === productId ? { ...item, quantity: Math.max(1, newQuantity) } : item
      );
    });
  };

  const resetOrderForm = () => {
    setCartItems([]);
    setCustomerName('');
    setCustomerPhone('');
    setPaymentMethod('');
    setNotes('');
  };

  const handlePlaceOrder = () => {
    if (cartItems.length === 0) {
      toast.error(t('pdv.cart_empty_error'));
      return;
    }
    if (!paymentMethod) {
      toast.error(t('pdv.payment_method_required'));
      return;
    }

    const orderData = {
      restaurant_id: restaurantId,
      delivery_type: 'dine_in', // Assuming dine_in for POS orders, can be changed
      total_amount: calculateTotal,
      items: cartItems,
      customer_details: {
        name: customerName || t('pdv.anonymous_customer'),
        phone: customerPhone || 'N/A',
      },
      payment_method: paymentMethod,
      notes: notes,
      platform: 'pos', // Indicate order came from POS
    };

    createOrderMutation.mutate(orderData);
  };

  // Handlers for existing order management
  const handleStatusChange = (orderId, newStatus) => {
    updateOrderStatusMutation.mutate({ orderId, status: newStatus });
  };

  const handleRestaurantOpenToggle = (event) => {
    updateRestaurantOpenStatusMutation.mutate({ restaurantId, is_open: event.target.checked });
  };

  const handlePosStatusToggle = (event) => {
    updateRestaurantPosStatusMutation.mutate({ restaurantId, pos_status: event.target.checked ? 'open' : 'closed' });
  };

  const orderStatuses = useMemo(() => [
    { id: 'pending', label: t('pdv.status_pending'), color: 'orange' },
    { id: 'accepted', label: t('pdv.status_accepted'), color: 'blue' },
    { id: 'preparing', label: t('pdv.status_preparing'), color: 'purple' },
    { id: 'on_the_way', label: t('pdv.status_on_the_way'), color: 'teal' },
    { id: 'delivered', label: t('pdv.status_delivered'), color: 'green' },
    { id: 'concluded', label: t('pdv.status_concluded'), color: 'green' },
    { id: 'cancelled', label: t('pdv.status_cancelled'), color: 'red' },
    { id: 'rejected', label: t('pdv.status_rejected'), color: 'red' },
  ], [t]);

  const ordersByStatus = useMemo(() => {
    const grouped = {};
    orderStatuses.forEach(status => {
      grouped[status.id] = orders?.filter(order => order.status === status.id) || [];
    });
    return grouped;
  }, [orders, orderStatuses]);

  if (isLoadingOrders || isLoadingRestaurantStatus || isLoadingProducts || isLoadingCategories) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (isErrorOrders || isErrorRestaurantStatus || isErrorProducts || isErrorCategories) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Alert severity="error">{t('pdv.error_loading_data')}</Alert>
      </Box>
    );
  }

  if (!restaurantId) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Alert severity="warning">{t('pdv.no_restaurant_associated')}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>{t('pdv.title')}</Typography>

      <Paper elevation={2} sx={{ p: 2, mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
        <FormControlLabel
          control={
            <Switch
              checked={restaurantStatus?.is_open || false}
              onChange={handleRestaurantOpenToggle}
              name="is_open"
              color="primary"
            />
          }
          label={
            <Box display="flex" alignItems="center">
              <StoreIcon sx={{ mr: 1 }} />
              <Typography>{restaurantStatus?.is_open ? t('pdv.store_open') : t('pdv.store_closed')}</Typography>
            </Box>
          }
        />
        <FormControlLabel
          control={
            <Switch
              checked={restaurantStatus?.pos_status === 'open' || false}
              onChange={handlePosStatusToggle}
              name="pos_status"
              color="secondary"
            />
          }
          label={
            <Box display="flex" alignItems="center">
              <PointOfSaleIcon sx={{ mr: 1 }} />
              <Typography>{restaurantStatus?.pos_status === 'open' ? t('pdv.pos_open') : t('pdv.pos_closed')}</Typography>
            </Box>
          }
        />
        <IconButton onClick={() => queryClient.invalidateQueries(['orders', 'restaurantStatus'])}>
          <RefreshIcon />
        </IconButton>
      </Paper>

      <Grid container spacing={3}>
        {/* Left Panel: Product Selection */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h5" gutterBottom>{t('pdv.product_selection')}</Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>{t('pdv.filter_by_category')}</InputLabel>
                <Select
                  value={selectedProductCategory}
                  label={t('pdv.filter_by_category')}
                  onChange={(e) => setSelectedProductCategory(e.target.value)}
                >
                  <MenuItem value="">{t('pdv.all_categories')}</MenuItem>
                  {categories?.map(category => (
                    <MenuItem key={category.id} value={category.id}>{category.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label={t('pdv.search_products')}
                variant="outlined"
                size="small"
                value={productSearchTerm}
                onChange={(e) => setProductSearchTerm(e.target.value)}
                fullWidth
              />
            </Box>
            <Box sx={{ flexGrow: 1, overflowY: 'auto', maxHeight: 'calc(100vh - 350px)' }}>
              <Grid container spacing={2}>
                {products?.map(product => (
                  <Grid item xs={12} sm={6} md={4} key={product.id}>
                    <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography variant="h6">{product.name}</Typography>
                        <Typography variant="body2" color="text.secondary">{product.description}</Typography>
                        <Typography variant="subtitle1" color="primary" sx={{ mt: 1 }}>R$ {Number(product.price).toFixed(2)}</Typography>
                        {product.image_url && (
                          <Box sx={{ mt: 1, width: '100%', height: 100, overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <img src={product.image_url} alt={product.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                          </Box>
                        )}
                      </CardContent>
                      <Box sx={{ p: 1, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<AddShoppingCartIcon />}
                          onClick={() => handleAddToCart(product)}
                        >
                          {t('pdv.add_to_cart')}
                        </Button>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Paper>
        </Grid>

        {/* Right Panel: Current Order */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h5" gutterBottom>{t('pdv.current_order')}</Typography>
            <Box sx={{ flexGrow: 1, overflowY: 'auto', maxHeight: 'calc(100vh - 350px)', mb: 2 }}>
              {cartItems.length === 0 ? (
                <Typography color="text.secondary">{t('pdv.cart_empty')}</Typography>
              ) : (
                <List>
                  {cartItems.map(item => (
                    <ListItem key={item.product_id} secondaryAction={
                      <Box>
                        <IconButton size="small" onClick={() => handleQuantityChange(item.product_id, item.quantity - 1)} disabled={item.quantity <= 1}>-</IconButton>
                        <Typography component="span" sx={{ mx: 1 }}>{item.quantity}</Typography>
                        <IconButton size="small" onClick={() => handleQuantityChange(item.product_id, item.quantity + 1)}>+</IconButton>
                        <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveFromCart(item.product_id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    }>
                      <ListItemText
                        primary={item.name}
                        secondary={`R$ ${Number(item.price).toFixed(2)}`}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>{t('pdv.total')}: R$ {calculateTotal.toFixed(2)}</Typography>

            <TextField
              label={t('pdv.customer_name')}
              fullWidth
              margin="normal"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
            <TextField
              label={t('pdv.customer_phone')}
              fullWidth
              margin="normal"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>{t('pdv.payment_method')}</InputLabel>
              <Select
                value={paymentMethod}
                label={t('pdv.payment_method')}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <MenuItem value="">{t('pdv.select_payment_method')}</MenuItem>
                <MenuItem value="cash">{t('pdv.payment_cash')}</MenuItem>
                <MenuItem value="card">{t('pdv.payment_card')}</MenuItem>
                <MenuItem value="pix">{t('pdv.payment_pix')}</MenuItem>
                <MenuItem value="other">{t('pdv.payment_other')}</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label={t('pdv.notes')}
              fullWidth
              margin="normal"
              multiline
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            <Button
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2 }}
              onClick={handlePlaceOrder}
              disabled={createOrderMutation.isLoading || cartItems.length === 0 || !paymentMethod}
            >
              {t('pdv.place_order')}
            </Button>
          </Paper>
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />

      {/* Existing Order Management Dashboard */}
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>{t('pdv.order_management_dashboard')}</Typography>
      <Grid container spacing={2} wrap="nowrap" sx={{ overflowX: 'auto', pb: 2 }}>
        {orderStatuses.map((statusCol) => (
          <Grid item key={statusCol.id} sx={{ minWidth: 300, maxWidth: 350 }}>
            <Paper elevation={3} sx={{ p: 2, bgcolor: '#f0f0f0', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" gutterBottom sx={{ color: statusCol.color, fontWeight: 'bold' }}>
                {statusCol.label} ({ordersByStatus[statusCol.id]?.length || 0})
              </Typography>
              <Box sx={{ flexGrow: 1, overflowY: 'auto', maxHeight: 'calc(100vh - 250px)' }}>
                {ordersByStatus[statusCol.id]?.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">{t('pdv.no_orders_in_status')}</Typography>
                ) : (
                  ordersByStatus[statusCol.id]?.map((order) => (
                    <Card key={order.id} variant="outlined" sx={{ mb: 2, bgcolor: 'white' }}>
                      <CardContent>
                        <Typography variant="subtitle1" fontWeight="bold">{t('pdv.order')} #{order.external_order_id || order.id.substring(0, 8)}</Typography>
                        <Typography variant="body2" color="text.secondary">{t('pdv.customer')}: {order.customer_details.name} ({order.customer_details.phone})</Typography>
                        <Typography variant="body2" color="text.secondary">{t('pdv.type')}: {order.delivery_type} | {t('pdv.platform')}: {order.platform}</Typography>
                        <Typography variant="body2" color="text.secondary">{t('pdv.date')}: {new Date(order.order_date).toLocaleString()}</Typography>
                        <Divider sx={{ my: 1 }} />
                        <Typography variant="subtitle2">{t('pdv.items')}:</Typography>
                        {order.items.map((item, idx) => (
                          <Typography key={idx} variant="body2" sx={{ ml: 1 }}>
                            - {item.quantity}x {item.name} (R$ {Number(item.price).toFixed(2)})
                          </Typography>
                        ))}
                        <Typography variant="h6" align="right" sx={{ mt: 1 }}>{t('pdv.total')}: R$ {Number(order.total_amount).toFixed(2)}</Typography>
                        
                        <FormControl fullWidth size="small" sx={{ mt: 2 }}>
                          <InputLabel>{t('pdv.change_status')}</InputLabel>
                          <Select
                            value={order.status}
                            label={t('pdv.change_status')}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          >
                            {orderStatuses.map((statusOption) => (
                              <MenuItem key={statusOption.id} value={statusOption.id}>
                                {statusOption.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </CardContent>
                    </Card>
                  ))
                )}
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Pdv;