import React, { useState, useMemo, useEffect } from 'react';
import './Pdv.css'; // Import the new CSS
import { Box, Typography, CircularProgress, Alert, Card, CardContent, Grid, Button, MenuItem, Select, FormControl, InputLabel, IconButton, Divider, Switch, FormControlLabel, Paper, TextField, List, ListItem, ListItemText, Drawer, Tabs, Tab, Badge, useMediaQuery, Chip, Avatar, Tooltip, Fade, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { TableRestaurant as TableRestaurantIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axiosInstance from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import { Refresh as RefreshIcon, Store as StoreIcon, PointOfSale as PointOfSaleIcon, AddShoppingCart as AddShoppingCartIcon, RemoveShoppingCart as RemoveShoppingCartIcon, Delete as DeleteIcon, Menu as MenuIcon, Dashboard as DashboardIcon, ShoppingBasket as ShoppingBasketIcon, Inventory as InventoryIcon, Add as AddIcon, Remove as RemoveIcon, Search as SearchIcon, FilterList as FilterListIcon, Close as CloseIcon, Restaurant as RestaurantIcon, Assignment as AssignmentIcon, Book as BookIcon, People as PeopleIcon, PieChart as PieChartIcon, Settings as SettingsIcon, Visibility as EyeIcon, Edit as EditIcon, Print as PrintIcon, Filter as FilterIcon, Plus as PlusIcon, ShoppingCart as ShoppingCartIcon, ThumbsUp as ThumbsUpIcon, ThumbsUpDown as ThumbsUpDownIcon, ThumbDown as ThumbDownIcon, QuestionAnswer as QuestionAnswerIcon, PersonAdd as PersonAddIcon, CheckCircle as CheckCircleIcon, DeliveryDining as MotorcycleIcon, DoneAll as ClipboardCheckIcon, Inbox as InboxIcon, LocalFireDepartment as FireIcon, Payments as PaymentsIcon, Person as PersonIcon, Info as InfoIcon, List as ListIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import CashRegisterModal from '../../components/CashRegisterModal';
import CashRegisterOptionsModal from '../../components/CashRegisterOptionsModal';
import WithdrawalModal from '../../components/WithdrawalModal';
import ReinforcementModal from '../../components/ReinforcementModal';
import PartialSummaryModal from '../../components/PartialSummaryModal';
import CloseCashRegisterModal from '../../components/CloseCashRegisterModal';

const fetchOrders = async ({ queryKey }) => {
  const [, filterStatus] = queryKey;
  const { data } = await axiosInstance.get(`/api/orders${filterStatus ? `?status=${filterStatus}` : ''}`);
  return data;
};

const fetchRestaurantStatus = async (restaurantId) => {
  const { data } = await axiosInstance.get(`/api/restaurant/${restaurantId}`);
  return data;
};

const fetchProducts = async ({ queryKey }) => {
  const [, restaurantId, categoryId, searchTerm] = queryKey;
  let url = `/api/products?restaurant_id=${restaurantId}`;
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
  const { data } = await axiosInstance.get(`/api/categories?restaurant_id=${restaurantId}`);
  return data;
};

const updateOrderStatus = async ({ orderId, status }) => {
  const { data } = await axiosInstance.put(`/api/orders/${orderId}/status`, { status });
  return data;
};

const updateRestaurantOpenStatus = async ({ restaurantId, is_open }) => {
  const { data } = await axiosInstance.put(`/api/restaurant/${restaurantId}/status/open`, { is_open });
  return data;
};

const updateRestaurantPosStatus = async ({ restaurantId, pos_status }) => {
  const { data } = await axiosInstance.put(`/api/restaurant/${restaurantId}/pos-status`, { pos_status });
  return data;
};

const createPublicOrder = async (orderData) => {
  const { data } = await axiosInstance.post('/api/public/orders', orderData);
  return data;
};

const createTableOrder = async ({ restaurantId, orderData }) => {
  const { data } = await axiosInstance.post(`/api/restaurant/${restaurantId}/orders`, orderData);
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
  const [orderType, setOrderType] = useState('dine_in'); // 'dine_in' for table orders, 'delivery' for delivery orders
  const [tableId, setTableId] = useState('');
  const [selectedTable, setSelectedTable] = useState(null);

  // Fetch Tables for dine_in orders
  const fetchTables = async (restaurantId) => {
    const { data } = await axiosInstance.get(`/api/restaurant/${restaurantId}/tables`);
    return data;
  };

  const { data: tables, isLoading: isLoadingTables, isError: isErrorTables } = useQuery(
    ['tables', restaurantId],
    () => fetchTables(restaurantId),
    {
      enabled: !!restaurantId && orderType === 'dine_in',
      onError: (error) => {
        toast.error(t('pdv.error_loading_tables', { message: error.response?.data?.msg || error.message }));
      },
    }
  );

  useEffect(() => {
    if (orderType === 'dine_in' && tables?.length > 0) {
      setTableId(tables[0].id); // Set first table as default
      setSelectedTable(tables[0]);
    }
  }, [orderType, tables]);

  const handleTableSelect = (table) => {
    setTableId(table.id);
    setSelectedTable(table);
    setOrderType('dine_in');
    setCurrentTab('pdv');
  };

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedProductCategory, setSelectedProductCategory] = useState('');
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [customerSearchTerm, setCustomerSearchTerm] = useState(''); // New state for customer search
  const [selectedCustomer, setSelectedCustomer] = useState(null); // New state for selected customer
  const [currentTab, setCurrentTab] = useState('pdv'); // State for active tab
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [orderDetailsModalOpen, setOrderDetailsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cashRegisterModalOpen, setCashRegisterModalOpen] = useState(false);
  const [cashRegisterOptionsModalOpen, setCashRegisterOptionsModalOpen] = useState(false);
  const [withdrawalModalOpen, setWithdrawalModalOpen] = useState(false);
  const [reinforcementModalOpen, setReinforcementModalOpen] = useState(false);
  const [partialSummaryModalOpen, setPartialSummaryModalOpen] = useState(false);
  const [closeCashRegisterModalOpen, setCloseCashRegisterModalOpen] = useState(false);

  // Fetch Customers
  const fetchCustomers = async ({ queryKey }) => {
    const [, restaurantId, searchTerm] = queryKey;
    console.log('Fetching customers for restaurantId:', restaurantId, 'with searchTerm:', searchTerm); // ADD THIS LINE
    if (!searchTerm) return [];
    const { data } = await axiosInstance.get(`/api/customers?restaurant_id=${restaurantId}&search=${searchTerm}`);
    return data;
  };

  const { data: searchResults, isLoading: isLoadingSearchResults } = useQuery(
    ['customers', restaurantId, customerSearchTerm],
    fetchCustomers,
    {
      enabled: !!restaurantId && customerSearchTerm.length > 2, // Only search if restaurantId exists and search term is at least 3 characters
      onError: (error) => {
        toast.error(t('pdv.error_loading_customers', { message: error.response?.data?.msg || error.message }));
      },
    }
  );

  // Function to handle customer selection from search results
  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    setCustomerName(customer.name);
    setCustomerPhone(customer.phone);
    setCustomerSearchTerm(''); // Clear search term after selection
    // Optionally, if customer has an address, you might want to store it too
    // setCustomerAddress(customer.address);
  };

  const handleSelectTableCard = (table) => {
    setSelectedTable(table);
    setTableId(table.id); // Also update tableId for the existing PDV logic
    setCurrentTab('pdv'); // Switch to PDV tab after selecting a table
  };

  // Sample product data (from exemplo.html, will be replaced by API data)
  const sampleProducts = [
    { id: 1, name: "Pizza Margherita", price: 42.90, category: "Pratos Principais", image: "🍕" },
    { id: 2, name: "Hambúrguer Artesanal", price: 28.90, category: "Pratos Principais", image: "🍔" },
    { id: 3, name: "Batata Frita Grande", price: 19.90, category: "Entradas", image: "🍟" },
    { id: 4, name: "Lasanha", price: 35.90, category: "Pratos Principais", image: "🍝" },
    { id: 5, name: "Frango Grelhado", price: 29.90, category: "Pratos Principais", image: "🍗" },
    { id: 6, name: "Coca-Cola 600ml", price: 7.90, category: "Bebidas", image: "🥤" },
    { id: 7, name: "Guaraná 600ml", price: 7.90, category: "Bebidas", image: "🥤" },
    { id: 8, name: "Água Mineral", price: 5.00, category: "Bebidas", image: "💧" },
    { id: 9, name: "Sorvete", price: 12.90, category: "Sobremesas", image: "🍨" },
    { id: 10, name: "Bolo de Chocolate", price: 15.90, category: "Sobremesas", image: "🍰" },
    { id: 11, name: "Salada Caesar", price: 22.90, category: "Entradas", image: "🥗" },
    { id: 12, name: "Cerveja Artesanal", price: 14.90, category: "Bebidas", image: "🍺" }
  ];

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
      refetchInterval: 300000,
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

  const fetchCashRegisterSession = async ({ queryKey }) => {
    const [, restaurantId, userId] = queryKey;
    const { data } = await axiosInstance.get(`/api/cash-register/current-session?restaurant_id=${restaurantId}&user_id=${userId}`);
    return data;
  };

  const { data: currentCashRegisterSession, isLoading: isLoadingCashRegisterSession, isError: isErrorCashRegisterSession } = useQuery(
    ['cashRegisterSessions', restaurantId, user?.userId],
    fetchCashRegisterSession,
    {
      enabled: !!restaurantId && !!user?.userId,
      refetchInterval: 10000, // Refetch every 10 seconds to keep status updated
      onError: (error) => {
        // Only show toast if it's not a 404 (no open session)
        if (error.response?.status !== 404) {
          toast.error(t('pdv.error_loading_cash_register_session', { message: error.response?.data?.msg || error.message }));
        }
      },
    }
  );

  const fetchCashOrders = async ({ queryKey }) => {
    const [, sessionId] = queryKey;
    const { data } = await axiosInstance.get(`/api/cash-register/cash-orders?session_id=${sessionId}`);
    return data;
  };

  const { data: cashOrders, isLoading: isLoadingCashOrders, isError: isErrorCashOrders } = useQuery(
    ['cashOrders', currentCashRegisterSession?.id],
    fetchCashOrders,
    {
      enabled: !!currentCashRegisterSession?.id,
      refetchInterval: 10000, // Refetch every 10 seconds to keep status updated
      onError: (error) => {
        toast.error(t('pdv.error_loading_cash_orders', { message: error.response?.data?.msg || error.message }));
      },
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

  const createPublicOrderMutation = useMutation(createPublicOrder, {
    onSuccess: () => {
      toast.success(t('pdv.order_created_success'));
      resetOrderForm(); // Moved here
      queryClient.invalidateQueries('orders'); // Refresh order list
    },
    onError: (error) => {
      toast.error(t('pdv.error_creating_order', { message: error.response?.data?.msg || error.message }));
    }
  });

  const createTableOrderMutation = useMutation(({ restaurantId, orderData }) => createTableOrder({ restaurantId, orderData }), {
    onSuccess: () => {
      toast.success(t('pdv.order_created_success'));
      resetOrderForm(); // Moved here
      queryClient.invalidateQueries('orders'); // Refresh order list
    },
    onError: (error) => {
      toast.error(t('pdv.error_creating_order', { message: error.response?.data?.msg || error.message }));
    }
  });

  const createCashRegisterSession = async (sessionData) => {
    const { data } = await axiosInstance.post('/api/cash-register/open', sessionData);
    return data;
  };

  const createCashRegisterSessionMutation = useMutation(createCashRegisterSession, {
    onSuccess: () => {
      toast.success(t('pdv.cash_register_opened_success')); // Assuming translation key
      queryClient.invalidateQueries('cashRegisterSessions'); // Invalidate to refetch if needed
    },
    onError: (error) => {
      toast.error(t('pdv.error_opening_cash_register', { message: error.response?.data?.msg || error.message }));
    },
  });

  const createWithdrawalMutation = useMutation(
    async (data) => {
      const { data: response } = await axiosInstance.post('/api/cash-register/withdrawal', data);
      return response;
    },
    {
      onSuccess: () => {
        toast.success(t('pdv.withdrawal_recorded_success'));
        queryClient.invalidateQueries('cashRegisterSessions'); // Invalidate to update balance
      },
      onError: (error) => {
        toast.error(t('pdv.error_recording_withdrawal', { message: error.response?.data?.msg || error.message }));
      },
    }
  );

  const createReinforcementMutation = useMutation(
    async (data) => {
      const { data: response } = await axiosInstance.post('/api/cash-register/reinforcement', data);
      return response;
    },
    {
      onSuccess: () => {
        toast.success(t('pdv.reinforcement_recorded_success'));
        queryClient.invalidateQueries('cashRegisterSessions'); // Invalidate to update balance
      },
      onError: (error) => {
        toast.error(t('pdv.error_recording_reinforcement', { message: error.response?.data?.msg || error.message }));
      },
    }
  );

  // Helper Functions
  const calculateTotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [cartItems]);

  const calculateSubtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [cartItems]);

  const calculateServiceTax = useMemo(() => {
    return calculateSubtotal * 0.1; // 10% service tax
  }, [calculateSubtotal]);

  const calculateFinalTotal = useMemo(() => {
    return calculateSubtotal + calculateServiceTax;
  }, [calculateSubtotal, calculateServiceTax]);

  const handleAddToCart = (product) => {
    console.log('Product object:', product);
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [
          ...prevItems,
          {
            id: product.id,
            name: product.name,
            price: parseFloat(product.price),
            quantity: 1,
            image: product.image || '❓', // Use a default emoji if image is undefined
          },
        ];
      }
    });
  };

  const handleRemoveFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  const handleQuantityChange = (productId, change) => {
    setCartItems(prevItems => {
      const item = prevItems.find(item => item.id === productId);
      if (item) {
        const newQuantity = item.quantity + change;
        if (newQuantity <= 0) {
          return prevItems.filter(i => i.id !== productId);
        } else {
          return prevItems.map(i =>
            i.id === productId ? { ...i, quantity: newQuantity } : i
          );
        }
      }
      return prevItems;
    });
  };

  const clearOrder = () => {
    if (cartItems.length === 0 || window.confirm(t('pdv.confirm_clear_order'))) {
      setCartItems([]);
      setCustomerName('');
      setCustomerPhone('');
      setPaymentMethod('');
      setNotes('');
      setSelectedCustomer(null); // Clear selected customer
    }
  };

  const resetOrderForm = () => {
    setCartItems([]);
    setCustomerName('');
    setCustomerPhone('');
    setPaymentMethod('');
    setNotes('');
    setSelectedCustomer(null); // Clear selected customer
  };

  const formatTimeElapsed = (startTime) => {
    const now = new Date();
    const start = new Date(startTime);
    const diffMs = now - start;

    const diffSeconds = Math.floor(diffMs / 1000);
    const hours = Math.floor(diffSeconds / 3600);
    const minutes = Math.floor((diffSeconds % 3600) / 60);
    const seconds = diffSeconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const calculateCurrentCash = (session, movements, orders) => {
    if (!session) return 0;

    let totalCash = Number(session.opening_cash);

    movements?.forEach(movement => {
      if (movement.type === 'reinforcement') {
        totalCash += Number(movement.amount);
      } else if (movement.type === 'withdrawal') {
        totalCash -= Number(movement.amount);
      }
    });

    orders?.forEach(order => {
      totalCash += Number(order.total_amount);
    });

    return totalCash;
  };

  const handlePlaceOrder = () => {
    console.log('handlePlaceOrder called');
    if (cartItems.length === 0) {
      toast.error(t('pdv.cart_empty_error'));
      console.log('Cart is empty, showing error');
      return;
    }
    if (!paymentMethod) {
      toast.error(t('pdv.payment_method_required'));
      console.log('Payment method not selected, showing error');
      return;
    }

    let orderData = {
      restaurant_id: restaurantId,
      total_amount: calculateFinalTotal,
      items: cartItems.map(item => ({ product_id: item.id, quantity: item.quantity, price: item.price, name: item.name, sku: item.sku })),
      payment_method: paymentMethod,
      notes: notes,
      platform: 'other', // Consistent platform for PDV orders
    };

    if (orderType === 'dine_in') {
      if (!selectedTable) {
        toast.error(t('pdv.please_select_table_first')); // New translation key
        setCurrentTab('tables'); // Switch to tables tab
        return;
      }
      orderData = {
        ...orderData,
        delivery_type: 'dine_in',
        table_id: selectedTable.id,
      };
      createTableOrderMutation.mutate({ restaurantId, orderData });
    } else { // orderType === 'delivery'
      if (!customerName || !customerPhone) {
        toast.error(t('pdv.customer_details_required'));
        return;
      }
      orderData = {
        ...orderData,
        delivery_type: 'delivery',
        customer_details: {
          name: selectedCustomer?.name || customerName,
          phone: selectedCustomer?.phone || customerPhone,
          ...(selectedCustomer && { customer_id: selectedCustomer.id }),
        },
        // delivery_address: {}, // Add if delivery address is captured
      };
      createPublicOrderMutation.mutate(orderData);
    }
    console.log('Order data prepared and mutation called:', orderData);
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
    { id: 'pending', label: t('pdv.status_pending'), color: 'var(--info)', icon: <InboxIcon /> },
    { id: 'preparing', label: t('pdv.status_preparing'), color: 'var(--warning)', icon: <FireIcon /> },
    { id: 'ready', label: t('pdv.status_ready'), color: 'var(--success)', icon: <CheckCircleIcon /> },
    { id: 'on_the_way', label: t('pdv.status_on_the_way'), color: 'var(--primary)', icon: <MotorcycleIcon /> },
    { id: 'delivered', label: t('pdv.status_delivered'), color: 'var(--gray)', icon: <ClipboardCheckIcon /> },
    { id: 'concluded', label: t('pdv.status_concluded'), color: 'var(--success)', icon: <CheckCircleIcon /> }, // Assuming concluded is similar to delivered
    { id: 'cancelled', label: t('pdv.status_cancelled'), color: 'var(--danger)', icon: <CloseIcon /> },
    { id: 'rejected', label: t('pdv.status_rejected'), color: 'var(--danger)', icon: <CloseIcon /> },
  ], [t]);

  const ordersByStatus = useMemo(() => {
    const grouped = {};
    orderStatuses.forEach(status => {
      grouped[status.id] = orders?.filter(order => order.status === status.id) || [];
    });
    return grouped;
  }, [orders, orderStatuses]);

  const ordersToday = useMemo(() => {
    if (!orders) return [];
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of today

    return orders.filter(order => {
      const orderDate = new Date(order.order_date);
      orderDate.setHours(0, 0, 0, 0); // Set to start of order date
      return orderDate.getTime() === today.getTime();
    });
  }, [orders]);

  const ordersTodayCount = ordersToday.length;

  const completedOrdersCount = useMemo(() => {
    return ordersToday.filter(order => ['delivered', 'concluded'].includes(order.status)).length;
  }, [ordersToday]);

  const inPreparationOrdersCount = useMemo(() => {
    return ordersToday.filter(order => ['pending', 'preparing'].includes(order.status)).length;
  }, [ordersToday]);

  const revenueToday = useMemo(() => {
    return ordersToday
      .filter(order => ['delivered', 'concluded'].includes(order.status))
      .reduce((sum, order) => sum + Number(order.total_amount), 0);
  }, [ordersToday]);

  // Kanban Drag and Drop Logic
  const handleDragStart = (e, orderId) => {
    e.dataTransfer.setData('orderId', orderId);
    e.currentTarget.classList.add('dragging');
  };

  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove('dragging');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('dropzone');
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('dropzone');
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    e.currentTarget.classList.remove('dropzone');
    const orderId = e.dataTransfer.getData('orderId');
    handleStatusChange(orderId, newStatus);
  };

  // Modals
  const openPaymentModal = () => {
    if (cartItems.length === 0) {
      toast.error(t('pdv.cart_empty_for_payment'));
      return;
    }
    setPaymentModalOpen(true);
  };

  const closePaymentModal = () => {
    setPaymentModalOpen(false);
    // Reset payment related states if needed
  };

  const processPayment = () => {
    // This would typically involve sending payment details to backend
    toast.success(t('pdv.payment_processed', { total: calculateFinalTotal.toFixed(2) }));
    closePaymentModal();
    // clearOrder(); // Removed: clearOrder() is now called on mutation success
  };

  const openOrderDetailsModal = (order) => {
    setSelectedOrder(order);
    setOrderDetailsModalOpen(true);
  };

  const closeOrderDetailsModal = () => {
    setOrderDetailsModalOpen(false);
    setSelectedOrder(null);
  };

  const handleOpenCashRegisterModal = () => {
    setCashRegisterModalOpen(true);
  };

  const handleOpenCashRegisterOptionsModal = () => {
    setCashRegisterOptionsModalOpen(true);
  };

  const handleSaveCashRegister = (initialCash, observations) => {
    createCashRegisterSessionMutation.mutate({
      opening_cash: parseFloat(initialCash),
      opening_observations: observations,
    });
    setCashRegisterModalOpen(false);
  };

  const handleSaveWithdrawal = (data) => {
    createWithdrawalMutation.mutate(data);
    setWithdrawalModalOpen(false);
  };

  const handleSaveReinforcement = (data) => {
    createReinforcementMutation.mutate(data);
    setReinforcementModalOpen(false);
  };

  const handleOpenPartialSummaryModal = () => {
    setPartialSummaryModalOpen(true);
  };

  // Responsive behavior
  const isMobile = useMediaQuery('(max-width:992px)');
  const [showOrderSectionMobile, setShowOrderSectionMobile] = useState(false);

  useEffect(() => {
    if (!isMobile) {
      setShowOrderSectionMobile(true); // Always show on desktop
    }
  }, [isMobile]);

  const toggleOrderSectionMobile = () => {
    setShowOrderSectionMobile(prev => !prev);
  };

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
    <div className="app-container">

      {/* Main Content */}
      <main className="main-content">

        {/* Tabs Container */}
        <div className="tabs-container">
          <div className="tabs-header">
            <button className={currentTab === 'pdv' ? 'tab-btn active' : 'tab-btn'} onClick={() => setCurrentTab('pdv')}>
              <PointOfSaleIcon /> {t('pdv.tab_pdv')}
            </button>
            <button className={currentTab === 'tables' ? 'tab-btn active' : 'tab-btn'} onClick={() => setCurrentTab('tables')}>
              <RestaurantIcon /> {t('pdv.tab_tables')}
            </button>
            <button className={currentTab === 'orders' ? 'tab-btn active' : 'tab-btn'} onClick={() => setCurrentTab('orders')}>
              <AssignmentIcon /> {t('pdv.tab_orders')}
            </button>
            <button className={currentTab === 'kanban' ? 'tab-btn active' : 'tab-btn'} onClick={() => setCurrentTab('kanban')}>
              <AssignmentIcon /> {t('pdv.tab_kanban')}
            </button>
          </div>

          <div className="tabs-content">
            {/* PDV Tab */}
            <div className={currentTab === 'pdv' ? 'tab-pane active' : 'tab-pane'} id="pdv-tab">
              <div className="pdv-container">
                {/* Products Section */}
                <div className="products-section">
                  <div className="categories-tabs">
                    <div className="category-tab active" onClick={() => setSelectedProductCategory('')}>{t('pdv.all_categories')}</div>
                    {categories?.map(category => (
                      <div
                        key={category.id}
                        className={selectedProductCategory === category.id ? 'category-tab active' : 'category-tab'}
                        onClick={() => setSelectedProductCategory(category.id)}
                      >
                        {category.name}
                      </div>
                    ))}
                  </div>

                  <div className="products-grid">
                    {products?.map(product => (
                      <div className="product-card" key={product.id} onClick={() => handleAddToCart(product)}>
                        <div className="product-image">{product.image || '🍔'}</div> {/* Placeholder emoji */}
                        <div className="product-name">{product.name}</div>
                        <div className="product-price">R$ {Number(product.price).toFixed(2).replace('.', ',')}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Section */}
                <div className={isMobile && !showOrderSectionMobile ? 'order-section' : 'order-section visible'} id="orderSection">
                  <div className="order-header">
                    <h3 className="order-title">{t('pdv.current_order_title')}</h3>
                    <ToggleButtonGroup
                      value={orderType}
                      exclusive
                      onChange={(event, newType) => {
                        if (newType !== null) {
                          setOrderType(newType);
                          // Clear customer details if switching to dine_in
                          if (newType === 'dine_in') {
                            setCustomerName('');
                            setCustomerPhone('');
                            setSelectedCustomer(null);
                            setCustomerSearchTerm('');
                          }
                        }
                      }}
                      aria-label="order type"
                      sx={{ mb: 2 }}
                    >
                      <ToggleButton value="dine_in" aria-label="dine in">
                        <RestaurantIcon /> {t('pdv.order_type_dine_in')}
                      </ToggleButton>
                      <ToggleButton value="delivery" aria-label="delivery">
                        <MotorcycleIcon /> {t('pdv.order_type_delivery')}
                      </ToggleButton>
                    </ToggleButtonGroup>
                    <div>
                      <button className="btn btn-outline" onClick={resetOrderForm}> {/* Using resetOrderForm to clear customer details */}
                        <PointOfSaleIcon /> {t('pdv.counter_sale')}
                      </button>
                      <button className="order-clear" onClick={clearOrder}>
                        <DeleteIcon /> {t('pdv.clear_order')}
                      </button>
                    </div>
                  </div>

                  {orderType === 'dine_in' && (
                    <Box sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                      {selectedTable ? (
                        <Typography variant="h6" color="primary">
                          {t('pdv.selected_table')}: {selectedTable.table_number}
                        </Typography>
                      ) : (
                        <Typography variant="body1" color="error">
                          {t('pdv.please_select_table')}
                        </Typography>
                      )}
                    </Box>
                  )}

                  {orderType === 'delivery' && (
                    <Box sx={{ mb: 2 }}>
                      <TextField
                        fullWidth
                        label={t('pdv.customer_search')}
                        value={customerSearchTerm}
                        onChange={(e) => setCustomerSearchTerm(e.target.value)}
                        sx={{ mb: 1 }}
                      />
                      {isLoadingSearchResults && <CircularProgress size={20} />}
                      {customerSearchTerm.length > 2 && searchResults?.length > 0 && (
                        <Paper sx={{ maxHeight: 200, overflow: 'auto', position: 'absolute', zIndex: 100, width: 'calc(100% - 40px)' }}>
                          <List>
                            {searchResults.map((customer) => (
                              <ListItem button key={customer.id} onClick={() => handleCustomerSelect(customer)}>
                                <ListItemText primary={customer.name} secondary={customer.phone} />
                              </ListItem>
                            ))}
                          </List>
                        </Paper>
                      )}
                      {selectedCustomer && (
                        <Chip
                          label={`${selectedCustomer.name} (${selectedCustomer.phone})`}
                          onDelete={() => setSelectedCustomer(null)}
                          sx={{ mt: 1 }}
                        />
                      )}
                      {!selectedCustomer && (
                        <>
                          <TextField
                            fullWidth
                            label={t('pdv.customer_name')}
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            sx={{ mb: 1 }}
                          />
                          <TextField
                            fullWidth
                            label={t('pdv.customer_phone')}
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            sx={{ mb: 1 }}
                          />
                        </>
                      )}
                    </Box>
                  )}

                  <div className="order-items" id="orderItems">
                    {cartItems.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>{t('pdv.no_items_added')}</div>
                    ) : (
                      cartItems.map(item => (
                        <div className="order-item" key={item.id}>
                          <div className="item-image">{item.image && item.image.startsWith('http') ? <img src={item.image} alt={item.name} /> : item.image}</div>
                          <div className="item-info">
                            <div className="item-name">{item.name}</div>
                            <div className="item-price">R$ {Number(item.price).toFixed(2).replace('.', ',')}</div>
                          </div>
                          <div className="item-actions">
                            <button className="quantity-btn" onClick={() => handleQuantityChange(item.id, -1)}>-</button>
                            <div className="quantity-value">{item.quantity}</div>
                            <button className="quantity-btn" onClick={() => handleQuantityChange(item.id, 1)}>+</button>
                            <button className="remove-item" onClick={() => handleRemoveFromCart(item.id)}>
                              <DeleteIcon />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="order-summary">
                  <div className="summary-row">
                    <span className="summary-label">{t('pdv.subtotal_label')}</span>
                    <span className="summary-value" id="subtotal">R$ {calculateSubtotal.toFixed(2).replace('.', ',')}</span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">{t('pdv.service_tax_label')}</span>
                    <span className="summary-value" id="serviceTax">R$ {calculateServiceTax.toFixed(2).replace('.', ',')}</span>
                  </div>
                  <div className="summary-row total-row">
                    <span className="summary-label">{t('pdv.total_label')}</span>
                    <span className="summary-value total-value" id="total">R$ {calculateFinalTotal.toFixed(2).replace('.', ',')}</span>
                  </div>
                </div>
                <div className="order-actions">
                  <button className="btn btn-outline" onClick={openPaymentModal}>
                    <PaymentsIcon /> {t('pdv.payment_button')}
                  </button>
                  <button className="btn btn-success" onClick={handlePlaceOrder} disabled={(createTableOrderMutation.isLoading || createPublicOrderMutation.isLoading) || cartItems.length === 0 || !paymentMethod}>
                    <CheckCircleIcon /> {t('pdv.finalize_button')}
                  </button>
                </div>
              </div>
            </div>

            {/* Tables Tab */}
            <div className={currentTab === 'tables' ? 'tab-pane active' : 'tab-pane'} id="tables-tab">
              <div className="tables-section">
                <div className="tables-grid" id="tablesGrid">
                  {isLoadingTables ? (
                    <CircularProgress />
                  ) : isErrorTables ? (
                    <Alert severity="error">{t('pdv.error_loading_tables')}</Alert>
                  ) : tables?.length === 0 ? (
                    <Typography variant="h6" color="textSecondary" sx={{ textAlign: 'center', mt: 4 }}>
                      {t('pdv.no_tables_found')}
                    </Typography>
                  ) : (
                    tables?.map(table => {
                      let statusClass = '';
                      let statusText = '';

                      switch(table.status) {
                          case 'available':
                              statusClass = 'status-available';
                              statusText = t('pdv.table_status_available');
                              break;
                          case 'occupied':
                              statusClass = 'status-occupied';
                              statusText = t('pdv.table_status_occupied');
                              break;
                          case 'reserved':
                              statusClass = 'status-reserved';
                              statusText = t('pdv.table_status_reserved');
                              break;
                          default:
                              statusClass = '';
                              statusText = table.status;
                      }

                      return (
                        <div
                          key={table.id}
                          className={`table-card ${selectedTable?.id === table.id ? 'active' : ''}`}
                          onClick={() => handleSelectTableCard(table)}
                        >
                          <div className="table-number">{table.table_number}</div>
                          <div className={`table-status ${statusClass}`}>{statusText}</div>
                          <div className="table-capacity">{t('pdv.table_capacity', { capacity: table.capacity })}</div>
                          {table.active_orders_count > 0 && (
                            <div className="table-badge">{table.active_orders_count}</div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Orders Tab */}
            <div className={currentTab === 'orders' ? 'tab-pane active' : 'tab-pane'} id="orders-tab">
              <div className="pdv-container">
                {/* Products Section */}
                <div className="products-section">
                  <div className="categories-tabs">
                    <div className="category-tab active" onClick={() => setSelectedProductCategory('')}>{t('pdv.all_categories')}</div>
                    {categories?.map(category => (
                      <div
                        key={category.id}
                        className={selectedProductCategory === category.id ? 'category-tab active' : 'category-tab'}
                        onClick={() => setSelectedProductCategory(category.id)}
                      >
                        {category.name}
                      </div>
                    ))}
                  </div>

                  <div className="products-grid">
                    {products?.map(product => (
                      <div className="product-card" key={product.id} onClick={() => handleAddToCart(product)}>
                        <div className="product-image">{product.image || '🍔'}</div> {/* Placeholder emoji */}
                        <div className="product-name">{product.name}</div>
                        <div className="product-price">R$ {Number(product.price).toFixed(2).replace('.', ',')}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Section */}
                <div className={isMobile && !showOrderSectionMobile ? 'order-section' : 'order-section visible'} id="orderSection">
                  <div className="order-header">
                    <h3 className="order-title">{t('pdv.current_order_title')}</h3>
                    <ToggleButtonGroup
                      value={orderType}
                      exclusive
                      onChange={(event, newType) => {
                        if (newType !== null) {
                          setOrderType(newType);
                          // Clear customer details if switching to dine_in
                          if (newType === 'dine_in') {
                            setCustomerName('');
                            setCustomerPhone('');
                            setSelectedCustomer(null);
                            setCustomerSearchTerm('');
                          }
                        }
                      }}
                      aria-label="order type"
                      sx={{ mb: 2 }}
                    >
                      <ToggleButton value="dine_in" aria-label="dine in">
                        <RestaurantIcon /> {t('pdv.order_type_dine_in')}
                      </ToggleButton>
                      <ToggleButton value="delivery" aria-label="delivery">
                        <MotorcycleIcon /> {t('pdv.order_type_delivery')}
                      </ToggleButton>
                    </ToggleButtonGroup>
                    <div>
                      <button className="btn btn-outline" onClick={resetOrderForm}> {/* Using resetOrderForm to clear customer details */}
                        <PointOfSaleIcon /> {t('pdv.counter_sale')}
                      </button>
                      <button className="order-clear" onClick={clearOrder}>
                        <DeleteIcon /> {t('pdv.clear_order')}
                      </button>
                    </div>
                  </div>

                  {orderType === 'dine_in' && (
                    <Box sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                      {selectedTable ? (
                        <Typography variant="h6" color="primary">
                          {t('pdv.selected_table')}: {selectedTable.table_number}
                        </Typography>
                      ) : (
                        <Typography variant="body1" color="error">
                          {t('pdv.please_select_table')}
                        </Typography>
                      )}
                    </Box>
                  )}

                  {orderType === 'delivery' && (
                    <Box sx={{ mb: 2 }}>
                      <TextField
                        fullWidth
                        label={t('pdv.customer_search')}
                        value={customerSearchTerm}
                        onChange={(e) => setCustomerSearchTerm(e.target.value)}
                        sx={{ mb: 1 }}
                      />
                      {isLoadingSearchResults && <CircularProgress size={20} />}
                      {customerSearchTerm.length > 2 && searchResults?.length > 0 && (
                        <Paper sx={{ maxHeight: 200, overflow: 'auto', position: 'absolute', zIndex: 100, width: 'calc(100% - 40px)' }}>
                          <List>
                            {searchResults.map((customer) => (
                              <ListItem button key={customer.id} onClick={() => handleCustomerSelect(customer)}>
                                <ListItemText primary={customer.name} secondary={customer.phone} />
                              </ListItem>
                            ))}
                          </List>
                        </Paper>
                      )}
                      {selectedCustomer && (
                        <Chip
                          label={`${selectedCustomer.name} (${selectedCustomer.phone})`}
                          onDelete={() => setSelectedCustomer(null)}
                          sx={{ mt: 1 }}
                        />
                      )}
                      {!selectedCustomer && (
                        <>
                          <TextField
                            fullWidth
                            label={t('pdv.customer_name')}
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            sx={{ mb: 1 }}
                          />
                          <TextField
                            fullWidth
                            label={t('pdv.customer_phone')}
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            sx={{ mb: 1 }}
                          />
                        </>
                      )}
                    </Box>
                  )}

                  <div className="order-items" id="orderItems">
                    {cartItems.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>{t('pdv.no_items_added')}</div>
                    ) : (
                      cartItems.map(item => (
                        <div className="order-item" key={item.id}>
                          <div className="item-image">{item.image && item.image.startsWith('http') ? <img src={item.image} alt={item.name} /> : item.image}</div>
                          <div className="item-info">
                            <div className="item-name">{item.name}</div>
                            <div className="item-price">R$ {Number(item.price).toFixed(2).replace('.', ',')}</div>
                          </div>
                          <div className="item-actions">
                            <button className="quantity-btn" onClick={() => handleQuantityChange(item.id, -1)}>-</button>
                            <div className="quantity-value">{item.quantity}</div>
                            <button className="quantity-btn" onClick={() => handleQuantityChange(item.id, 1)}>+</button>
                            <button className="remove-item" onClick={() => handleRemoveFromCart(item.id)}>
                              <DeleteIcon />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="order-summary">
                  <div className="summary-row">
                    <span className="summary-label">{t('pdv.subtotal_label')}</span>
                    <span className="summary-value" id="subtotal">R$ {calculateSubtotal.toFixed(2).replace('.', ',')}</span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">{t('pdv.service_tax_label')}</span>
                    <span className="summary-value" id="serviceTax">R$ {calculateServiceTax.toFixed(2).replace('.', ',')}</span>
                  </div>
                  <div className="summary-row total-row">
                    <span className="summary-label">{t('pdv.total_label')}</span>
                    <span className="summary-value total-value" id="total">R$ {calculateFinalTotal.toFixed(2).replace('.', ',')}</span>
                  </div>
                </div>
                <div className="order-actions">
                  <button className="btn btn-outline" onClick={openPaymentModal}>
                    <PaymentsIcon /> {t('pdv.payment_button')}
                  </button>
                  <button className="btn btn-success" onClick={handlePlaceOrder} disabled={(createTableOrderMutation.isLoading || createPublicOrderMutation.isLoading) || cartItems.length === 0 || !paymentMethod}>
                    <CheckCircleIcon /> {t('pdv.finalize_button')}
                  </button>
                </div>
              </div>
            </div>

            {/* Orders Tab */}
            <div className={currentTab === 'orders' ? 'tab-pane active' : 'tab-pane'} id="orders-tab">
              {/* Stats Cards */}
              <div className="stats-cards">
                  <div className="stat-card">
                      <div className="stat-icon primary">
                          <ShoppingBasketIcon />
                      </div>
                      <div>
                          <div className="stat-value">{ordersTodayCount}</div>
                          <div className="stat-label">{t('pdv.orders_today')}</div>
                      </div>
                  </div>
                  <div className="stat-card">
                      <div className="stat-icon success">
                          <CheckCircleIcon />
                      </div>
                      <div>
                          <div className="stat-value">{completedOrdersCount}</div>
                          <div className="stat-label">{t('pdv.completed_orders')}</div>
                      </div>
                  </div>
                  <div className="stat-card">
                      <div className="stat-icon warning">
                          <FireIcon />
                      </div>
                      <div>
                          <div className="stat-value">{inPreparationOrdersCount}</div>
                          <div className="stat-label">{t('pdv.in_preparation')}</div>
                      </div>
                  </div>
                  <div className="stat-card">
                      <div className="stat-icon info">
                          <PaymentsIcon />
                      </div>
                      <div>
                          <div className="stat-value">R$ {revenueToday.toFixed(2).replace('.', ',')}</div>
                          <div className="stat-label">{t('pdv.revenue_today')}</div>
                      </div>
                  </div>
              </div>
              <div className="orders-section">
                <div className="section-header">
                  <h2 className="section-title">{t('pdv.recent_orders_title')}</h2>
                  <div>
                    <button className="btn btn-outline">
                      <FilterListIcon /> {t('pdv.filter_button')}
                    </button>
                    <button className="btn btn-primary">
                      <AddIcon /> {t('pdv.new_order_button')}
                    </button>
                  </div>
                </div>

                <table className="orders-table">
                  <thead>
                    <tr>
                      <th>{t('pdv.table_header_id')}</th>
                      <th>{t('pdv.table_header_customer')}</th>
                      <th>{t('pdv.table_header_datetime')}</th>
                      <th>{t('pdv.table_header_items')}</th>
                      <th>{t('pdv.table_header_total')}</th>
                      <th>{t('pdv.table_header_status')}</th>
                      <th>{t('pdv.table_header_actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders?.map(order => (
                      <tr key={order.id}>
                        <td className="order-id">#{order.external_order_id || order.id.substring(0, 8)}</td>
                        <td>
                          <div className="customer-info">
                            <div className="customer-avatar">{order.customer_details.name ? order.customer_details.name.substring(0, 2).toUpperCase() : '--'}</div>
                            <span>{order.customer_details.name}</span>
                          </div>
                        </td>
                        <td>{new Date(order.order_date).toLocaleString()}</td>
                        <td>{order.items.length}</td>
                        <td>R$ {Number(order.total_amount).toFixed(2).replace('.', ',')}</td>
                        <td><span className={`status-badge ${order.status}`}>{orderStatuses.find(s => s.id === order.status)?.label || order.status}</span></td>
                        <td>
                          <button className="action-btn" title={t('pdv.view_action')} onClick={() => openOrderDetailsModal(order)}>
                            <EyeIcon />
                          </button>
                          <button className="action-btn" title={t('pdv.edit_action')}>
                            <EditIcon />
                          </button>
                          <button className="action-btn" title={t('pdv.print_action')}>
                            <PrintIcon />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Kanban Tab */}
            <div className={currentTab === 'kanban' ? 'tab-pane active' : 'tab-pane'} id="kanban-tab">
              <div className="main-container">
                {/* New button for "Abrir Caixa" / "Caixa Aberto" */}
                <div style={{ marginBottom: '20px', textAlign: 'right' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2, mb: 2 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={restaurantStatus?.is_open || false}
                          onChange={handleRestaurantOpenToggle}
                          name="storeOpenStatus"
                          color="primary"
                        />
                      }
                      label={t('pdv.store_open_status')}
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={restaurantStatus?.pos_status === 'open' || false}
                          onChange={handlePosStatusToggle}
                          name="posOpenStatus"
                          color="primary"
                        />
                      }
                      label={t('pdv.pos_open_status')}
                    />
                  </Box>
                  {isLoadingCashRegisterSession ? (
                    <CircularProgress size={24} />
                  ) : currentCashRegisterSession ? (
                    <Button
                      variant="contained"
                      color="success" // Green for open
                      startIcon={<PointOfSaleIcon />}
                      onClick={handleOpenCashRegisterOptionsModal} // Will be implemented next
                    >
                      {t('pdv.cash_register_open')} ({formatTimeElapsed(currentCashRegisterSession.opening_time)}) - R$ {calculateCurrentCash(currentCashRegisterSession, null, cashOrders).toFixed(2).replace('.', ',')}
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<PointOfSaleIcon />}
                      onClick={handleOpenCashRegisterModal}
                    >
                      {t('pdv.open_cash_register')} {/* Assuming translation key */}
                    </Button>
                  )}
                </div>
                <div className="kanban-board" id="kanbanBoard">
                  {orderStatuses.filter(s => ['pending', 'preparing', 'ready', 'on_the_way', 'delivered'].includes(s.id)).map(statusCol => (
                    <div
                      className={`kanban-column column-${statusCol.id}`}
                      data-status={statusCol.id}
                      key={statusCol.id}
                      onDragOver={handleDragOver}
                      onDragEnter={handleDragEnter}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, statusCol.id)}
                    >
                      <div className="column-header">
                        <div className="column-title">
                          {statusCol.icon}
                          <span>{statusCol.label}</span>
                        </div>
                        <div className="column-count">{ordersByStatus[statusCol.id]?.length || 0}</div>
                      </div>
                      <div className="column-content" data-column={statusCol.id}>
                        {ordersByStatus[statusCol.id]?.map(order => (
                          <div
                            className="order-card"
                            draggable="true"
                            onDragStart={(e) => handleDragStart(e, order.id)}
                            onDragEnd={handleDragEnd}
                            key={order.id}
                            data-order-id={order.id}
                          >
                            <div className="order-header">
                              <div className="order-id">#{order.external_order_id || order.id.substring(0, 8)}</div>
                              <div className="order-time">{new Date(order.order_date).toLocaleTimeString()}</div>
                            </div>
                            <div className="customer-info">
                              <div className="customer-avatar">{order.customer_details.name ? order.customer_details.name.substring(0, 2).toUpperCase() : '--'}</div>
                              <div>
                                <div className="customer-name">{order.customer_details.name}</div>
                                <div className="customer-phone">{order.customer_details.phone}</div>
                              </div>
                            </div>
                            <div className="order-items">
                              {/* Items will be listed here */}
                            </div>
                            <div className="order-footer">
                              <div className="order-total">R$ {Number(order.total_amount).toFixed(2).replace('.', ',')}</div>
                              <div className="order-payment">{order.payment_method}</div>
                              <div className="order-actions">
                                <button className="action-btn" title="Detalhes" onClick={() => openOrderDetailsModal(order)}>
                                  <EyeIcon />
                                </button>
                                <button className="action-btn" title="Imprimir">
                                  <PrintIcon />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Payment Modal */}
      <div className="modal" style={{ display: paymentModalOpen ? 'flex' : 'none' }}>
        <div className="modal-content">
          <div className="modal-header">
            <h3 className="modal-title">{t('pdv.payment_modal_title')}</h3>
            <button className="close-modal" onClick={closePaymentModal}>&times;</button>
          </div>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">{t('pdv.total_value_label')}</label>
              <input type="text" className="form-control" value={`R$ ${calculateFinalTotal.toFixed(2).replace('.', ',')}`} readOnly />
            </div>
            <div className="form-group">
              <label className="form-label">{t('pdv.payment_method_label')}</label>
              <select className="form-control" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                <option value="">{t('pdv.select_option')}</option>
                <option value="cash">{t('pdv.payment_cash')}</option>
                <option value="credit">{t('pdv.payment_credit')}</option>
                <option value="debit">{t('pdv.payment_debit')}</option>
                <option value="pix">{t('pdv.payment_pix')}</option>
                <option value="meal">{t('pdv.payment_meal_voucher')}</option>
              </select>
            </div>
            {paymentMethod === 'cash' && (
              <div className="form-group">
                <label className="form-label">{t('pdv.amount_received_label')}</label>
                <input type="text" className="form-control" placeholder="R$ 0,00" />
              </div>
            )}
            {paymentMethod === 'cash' && (
              <div className="form-group">
                <label className="form-label">{t('pdv.change_label')}</label>
                <input type="text" className="form-control" value="R$ 0,00" readOnly />
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button className="btn btn-outline" onClick={closePaymentModal}>
              <CloseIcon /> {t('pdv.cancel_button')}
            </button>
            <button className="btn btn-primary" onClick={processPayment}>
              <CheckCircleIcon /> {t('pdv.confirm_button')}
            </button>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      <div className="modal" style={{ display: orderDetailsModalOpen ? 'flex' : 'none' }}>
        {selectedOrder && (
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">{t('pdv.order_details_modal_title')} #{selectedOrder.external_order_id || selectedOrder.id?.substring(0, 8)}</h3>
              <button className="close-modal" onClick={closeOrderDetailsModal}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="order-details-grid">
                <div className="order-info-card">
                  <h4 className="info-card-title"><PersonIcon /> {t('pdv.customer_info_title')}</h4>
                  <div className="info-item">
                    <span className="info-label">{t('pdv.name_label')}</span>
                    <span className="info-value">{selectedOrder.customer_details.name}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">{t('pdv.phone_label')}</span>
                    <span className="info-value">{selectedOrder.customer_details.phone}</span>
                  </div>
                  {/* Add email and address if available in selectedOrder.customer_details */}
                </div>

                <div className="order-info-card">
                  <h4 className="info-card-title"><InfoIcon /> {t('pdv.order_info_title')}</h4>
                  <div className="info-item">
                    <span className="info-label">{t('pdv.table_header_datetime')}</span>
                    <span className="info-value">{new Date(selectedOrder.order_date).toLocaleString()}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">{t('pdv.order_number_label')}</span>
                    <span className="info-value">#{selectedOrder.external_order_id || selectedOrder.id?.substring(0, 8)}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">{t('pdv.payment_method_label_details')}</span>
                    <span className="info-value">{selectedOrder.payment_method}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">{t('pdv.table_header_status')}</span>
                    <span className="info-value"><span className={`status-badge ${selectedOrder.status}`}>{orderStatuses.find(s => s.id === selectedOrder.status)?.label || selectedOrder.status}</span></span>
                  </div>
                </div>
              </div>

              <h4 style={{ margin: '20px 0 15px', color: 'var(--dark)'}}><ListIcon /> {t('pdv.order_items_title')}</h4>
              <table className="items-list">
                <thead>
                  <tr>
                    <th>{t('pdv.item_table_header_item')}</th>
                    <th className="item-quantity">{t('pdv.item_table_header_qty')}</th>
                    <th className="item-price">{t('pdv.item_table_header_unit_price')}</th>
                    <th className="item-price">{t('pdv.item_table_header_subtotal')}</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.name}</td>
                      <td className="item-quantity">{item.quantity}</td>
                      <td className="item-price">R$ {Number(item.price).toFixed(2).replace('.', ',')}</td>
                      <td className="item-price">R$ {(Number(item.price) * item.quantity).toFixed(2).replace('.', ',')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="order-total">
                <span className="total-label">{t('pdv.total_label')}</span>
                <span className="total-value">R$ {Number(selectedOrder.total_amount).toFixed(2).replace('.', ',')}</span>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={closeOrderDetailsModal}>
                <CloseIcon /> {t('pdv.close_button')}
              </button>
              <button className="btn btn-primary">
                <PrintIcon /> {t('pdv.print_action')}
              </button>
              <button className="btn btn-primary">
                <CheckCircleIcon /> {t('pdv.mark_as_delivered_button')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Toggle Order Button */}
      {isMobile && (
        <button className="toggle-order" id="toggleOrder" onClick={toggleOrderSectionMobile} style={{ display: isMobile ? 'flex' : 'none' }}>
          <ShoppingCartIcon />
        </button>
      )}

      {/* Cash Register Modal */}
      <CashRegisterModal
        open={cashRegisterModalOpen}
        handleClose={() => setCashRegisterModalOpen(false)}
        handleSave={handleSaveCashRegister}
      />

      {/* Cash Register Options Modal */}
      <CashRegisterOptionsModal
        open={cashRegisterOptionsModalOpen}
        handleClose={() => setCashRegisterOptionsModalOpen(false)}
        currentSession={currentCashRegisterSession}
        setWithdrawalModalOpen={setWithdrawalModalOpen}
        setReinforcementModalOpen={setReinforcementModalOpen}
        setPartialSummaryModalOpen={setPartialSummaryModalOpen}
        setCloseCashRegisterModalOpen={setCloseCashRegisterModalOpen}
      />

      {/* Withdrawal Modal */}
      <WithdrawalModal
        open={withdrawalModalOpen}
        handleClose={() => setWithdrawalModalOpen(false)}
        handleSave={handleSaveWithdrawal}
      />

      {/* Reinforcement Modal */}
      <ReinforcementModal
        open={reinforcementModalOpen}
        handleClose={() => setReinforcementModalOpen(false)}
        handleSave={handleSaveReinforcement}
      />

      {/* Partial Summary Modal */}
      <PartialSummaryModal
        open={partialSummaryModalOpen}
        handleClose={() => setPartialSummaryModalOpen(false)}
        currentSession={currentCashRegisterSession}
        cashOrders={cashOrders}
      />
    </div>
  );
};

export default Pdv;