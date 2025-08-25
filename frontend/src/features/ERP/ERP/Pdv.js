import React, { useState, useMemo, useEffect } from 'react';

import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  Divider,
  Switch,
  FormControlLabel,
  Paper,
  TextField,
  List,
  ListItem,
  ListItemText,
  Drawer,
  Tabs,
  Tab,
  Badge,
  useMediaQuery,
  Chip,
  Avatar,
  Tooltip,
  Fade,
  ToggleButtonGroup,
  ToggleButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { TableRestaurant as TableRestaurantIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axiosInstance from '@/shared/lib/axiosInstance';
import toast from 'react-hot-toast';
import {
  Refresh as RefreshIcon,
  Store as StoreIcon,
  PointOfSale as PointOfSaleIcon,
  AddShoppingCart as AddShoppingCartIcon,
  RemoveShoppingCart as RemoveShoppingCartIcon,
  Delete as DeleteIcon,
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  ShoppingBasket as ShoppingBasketIcon,
  Inventory as InventoryIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Close as CloseIcon,
  Restaurant as RestaurantIcon,
  Assignment as AssignmentIcon,
  Book as BookIcon,
  People as PeopleIcon,
  PieChart as PieChartIcon,
  Settings as SettingsIcon,
  Visibility as EyeIcon,
  Edit as EditIcon,
  Print as PrintIcon,
  Filter as FilterIcon,
  Plus as PlusIcon,
  ShoppingCart as ShoppingCartIcon,
  ThumbsUp as ThumbsUpIcon,
  ThumbsUpDown as ThumbsUpDownIcon,
  ThumbDown as ThumbDownIcon,
  QuestionAnswer as QuestionAnswerIcon,
  PersonAdd as PersonAddIcon,
  CheckCircle as CheckCircleIcon,
  DeliveryDining as MotorcycleIcon,
  DoneAll as ClipboardCheckIcon,
  Inbox as InboxIcon,
  LocalFireDepartment as FireIcon,
  Payments as PaymentsIcon,
  Person as PersonIcon,
  Info as InfoIcon,
  List as ListIcon,
} from '@mui/icons-material';
import { useAuth } from '@/app/providers/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import CashRegisterModal from '@/shared/components/CashRegisterModal';
import CashRegisterOptionsModal from '@/shared/components/CashRegisterOptionsModal';
import WithdrawalModal from '@/shared/components/WithdrawalModal';
import ReinforcementModal from '@/shared/components/ReinforcementModal';
import PartialSummaryModal from '@/shared/components/PartialSummaryModal';
import CloseCashRegisterModal from '@/shared/components/CloseCashRegisterModal';

const fetchOrders = async ({ queryKey }) => {
  const [, filterStatus] = queryKey;
  const { data } = await axiosInstance.get(
    `/api/orders${filterStatus ? `?status=${filterStatus}` : ''}`
  );
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
  const { data } = await axiosInstance.put(`/api/restaurant/${restaurantId}/status/open`, {
    is_open,
  });
  return data;
};

const updateRestaurantPosStatus = async ({ restaurantId, pos_status }) => {
  const { data } = await axiosInstance.put(`/api/restaurant/${restaurantId}/pos-status`, {
    pos_status,
  });
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

  const {
    data: tables,
    isLoading: isLoadingTables,
    isError: isErrorTables,
  } = useQuery(['tables', restaurantId], () => fetchTables(restaurantId), {
    enabled: !!restaurantId && orderType === 'dine_in',
    onError: (error) => {
      toast.error(
        t('pdv.error_loading_tables', { message: error.response?.data?.msg || error.message })
      );
    },
  });

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
  const [showTableOptionsModal, setShowTableOptionsModal] = useState(false); // New state for table options modal
  const [tableToActOn, setTableToActOn] = useState(null); // New state to store table for actions

  // Fetch Customers
  const fetchCustomers = async ({ queryKey }) => {
    const [, restaurantId, searchTerm] = queryKey;
    console.log(
      'Fetching customers for restaurantId:',
      restaurantId,
      'with searchTerm:',
      searchTerm
    ); // ADD THIS LINE
    if (!searchTerm) return [];
    const { data } = await axiosInstance.get(
      `/api/customers?restaurant_id=${restaurantId}&search=${searchTerm}`
    );
    return data;
  };

  const { data: searchResults, isLoading: isLoadingSearchResults } = useQuery(
    ['customers', restaurantId, customerSearchTerm],
    fetchCustomers,
    {
      enabled: !!restaurantId && customerSearchTerm.length > 2, // Only search if restaurantId exists and search term is at least 3 characters
      onError: (error) => {
        toast.error(
          t('pdv.error_loading_customers', { message: error.response?.data?.msg || error.message })
        );
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

    if (table.status === 'occupied' && table.active_orders_count > 0) {
      setTableToActOn(table);
      setShowTableOptionsModal(true); // Open modal for options
    } else {
      setOrderType('dine_in'); // Set order type to dine_in for new orders on available/reserved tables
      setCurrentTab('pdv'); // Switch to PDV tab directly
    }
  };

  // Sample product data (from exemplo.html, will be replaced by API data)
  const sampleProducts = [
    { id: 1, name: 'Pizza Margherita', price: 42.9, category: 'Pratos Principais', image: '🍕' },
    {
      id: 2,
      name: 'Hambúrguer Artesanal',
      price: 28.9,
      category: 'Pratos Principais',
      image: '🍔',
    },
    { id: 3, name: 'Batata Frita Grande', price: 19.9, category: 'Entradas', image: '🍟' },
    { id: 4, name: 'Lasanha', price: 35.9, category: 'Pratos Principais', image: '🍝' },
    { id: 5, name: 'Frango Grelhado', price: 29.9, category: 'Pratos Principais', image: '🍗' },
    { id: 6, name: 'Coca-Cola 600ml', price: 7.9, category: 'Bebidas', image: '🥤' },
    { id: 7, name: 'Guaraná 600ml', price: 7.9, category: 'Bebidas', image: '🥤' },
    { id: 8, name: 'Água Mineral', price: 5.0, category: 'Bebidas', image: '💧' },
    { id: 9, name: 'Sorvete', price: 12.9, category: 'Sobremesas', image: '🍨' },
    { id: 10, name: 'Bolo de Chocolate', price: 15.9, category: 'Sobremesas', image: '🍰' },
    { id: 11, name: 'Salada Caesar', price: 22.9, category: 'Entradas', image: '🥗' },
    { id: 12, name: 'Cerveja Artesanal', price: 14.9, category: 'Bebidas', image: '🍺' },
  ];

  // Fetch Data
  const {
    data: orders,
    isLoading: isLoadingOrders,
    isError: isErrorOrders,
  } = useQuery(['orders', filterStatus], fetchOrders, {
    enabled: !!restaurantId,
    refetchInterval: 5000,
    onError: (error) => {
      toast.error(
        t('pdv.error_loading_orders', { message: error.response?.data?.msg || error.message })
      );
    },
  });

  const {
    data: restaurantStatus,
    isLoading: isLoadingRestaurantStatus,
    isError: isErrorRestaurantStatus,
  } = useQuery(['restaurantStatus', restaurantId], () => fetchRestaurantStatus(restaurantId), {
    enabled: !!restaurantId,
    refetchInterval: 300000,
    onError: (error) => {
      toast.error(
        t('pdv.error_loading_restaurant_status', {
          message: error.response?.data?.msg || error.message,
        })
      );
    },
  });

  const {
    data: products,
    isLoading: isLoadingProducts,
    isError: isErrorProducts,
  } = useQuery(
    ['products', restaurantId, selectedProductCategory, productSearchTerm],
    fetchProducts,
    {
      enabled: !!restaurantId,
      onError: (error) => {
        toast.error(
          t('pdv.error_loading_products', { message: error.response?.data?.msg || error.message })
        );
      },
    }
  );

  const {
    data: categories,
    isLoading: isLoadingCategories,
    isError: isErrorCategories,
  } = useQuery(['categories', restaurantId], () => fetchCategories(restaurantId), {
    enabled: !!restaurantId,
    onError: (error) => {
      toast.error(
        t('pdv.error_loading_categories', { message: error.response?.data?.msg || error.message })
      );
    },
  });

  const fetchCashRegisterSession = async ({ queryKey }) => {
    const [, restaurantId, userId] = queryKey;
    const { data } = await axiosInstance.get(
      `/api/cash-register/current-session?restaurant_id=${restaurantId}&user_id=${userId}`
    );
    return data;
  };

  const {
    data: currentCashRegisterSession,
    isLoading: isLoadingCashRegisterSession,
    isError: isErrorCashRegisterSession,
  } = useQuery(['cashRegisterSessions', restaurantId, user?.userId], fetchCashRegisterSession, {
    enabled: !!restaurantId && !!user?.userId,
    refetchInterval: 10000, // Refetch every 10 seconds to keep status updated
    onError: (error) => {
      // Only show toast if it's not a 404 (no open session)
      if (error.response?.status !== 404) {
        toast.error(
          t('pdv.error_loading_cash_register_session', {
            message: error.response?.data?.msg || error.message,
          })
        );
      }
    },
  });

  const fetchCashOrders = async ({ queryKey }) => {
    const [, sessionId] = queryKey;
    const { data } = await axiosInstance.get(
      `/api/cash-register/cash-orders?session_id=${sessionId}`
    );
    return data;
  };

  const {
    data: cashOrders,
    isLoading: isLoadingCashOrders,
    isError: isErrorCashOrders,
  } = useQuery(['cashOrders', currentCashRegisterSession?.id], fetchCashOrders, {
    enabled: !!currentCashRegisterSession?.id,
    refetchInterval: 10000, // Refetch every 10 seconds to keep status updated
    onError: (error) => {
      toast.error(
        t('pdv.error_loading_cash_orders', { message: error.response?.data?.msg || error.message })
      );
    },
  });

  // Mutations
  const updateOrderStatusMutation = useMutation(updateOrderStatus, {
    onSuccess: () => {
      toast.success(t('pdv.order_status_updated'));
      queryClient.invalidateQueries('orders');
    },
    onError: (error) => {
      toast.error(
        t('pdv.error_updating_order_status', {
          message: error.response?.data?.msg || error.message,
        })
      );
    },
  });

  const updateRestaurantOpenStatusMutation = useMutation(updateRestaurantOpenStatus, {
    onSuccess: () => {
      toast.success(t('pdv.store_status_updated'));
      queryClient.invalidateQueries(['restaurantStatus', restaurantId]);
    },
    onError: (error) => {
      toast.error(
        t('pdv.error_updating_store_status', {
          message: error.response?.data?.msg || error.message,
        })
      );
    },
  });

  const updateRestaurantPosStatusMutation = useMutation(updateRestaurantPosStatus, {
    onSuccess: () => {
      toast.success(t('pdv.pos_status_updated'));
      queryClient.invalidateQueries(['restaurantStatus', restaurantId]);
    },
    onError: (error) => {
      toast.error(
        t('pdv.error_updating_pos_status', { message: error.response?.data?.msg || error.message })
      );
    },
  });

  const createPublicOrderMutation = useMutation(createPublicOrder, {
    onSuccess: () => {
      toast.success(t('pdv.order_created_success'));
      resetOrderForm(); // Moved here
      queryClient.invalidateQueries('orders'); // Refresh order list
    },
    onError: (error) => {
      toast.error(
        t('pdv.error_creating_order', { message: error.response?.data?.msg || error.message })
      );
    },
  });

  const createTableOrderMutation = useMutation(
    ({ restaurantId, orderData }) => createTableOrder({ restaurantId, orderData }),
    {
      onSuccess: () => {
        toast.success(t('pdv.order_created_success'));
        resetOrderForm(); // Moved here
        queryClient.invalidateQueries('orders'); // Refresh order list
      },
      onError: (error) => {
        toast.error(
          t('pdv.error_creating_order', { message: error.response?.data?.msg || error.message })
        );
      },
    }
  );

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
      toast.error(
        t('pdv.error_opening_cash_register', {
          message: error.response?.data?.msg || error.message,
        })
      );
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
        toast.error(
          t('pdv.error_recording_withdrawal', {
            message: error.response?.data?.msg || error.message,
          })
        );
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
        toast.error(
          t('pdv.error_recording_reinforcement', {
            message: error.response?.data?.msg || error.message,
          })
        );
      },
    }
  );

  // Helper Functions
  const calculateTotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cartItems]);

  const calculateSubtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cartItems]);

  const calculateServiceTax = useMemo(() => {
    return calculateSubtotal * 0.1; // 10% service tax
  }, [calculateSubtotal]);

  const calculateFinalTotal = useMemo(() => {
    return calculateSubtotal + calculateServiceTax;
  }, [calculateSubtotal, calculateServiceTax]);

  const handleAddToCart = (product) => {
    console.log('Product object:', product);
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      if (existingItem) {
        return prevItems.map((item) =>
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
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  };

  const handleQuantityChange = (productId, change) => {
    setCartItems((prevItems) => {
      const item = prevItems.find((item) => item.id === productId);
      if (item) {
        const newQuantity = item.quantity + change;
        if (newQuantity <= 0) {
          return prevItems.filter((i) => i.id !== productId);
        } else {
          return prevItems.map((i) => (i.id === productId ? { ...i, quantity: newQuantity } : i));
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

    movements?.forEach((movement) => {
      if (movement.type === 'reinforcement') {
        totalCash += Number(movement.amount);
      } else if (movement.type === 'withdrawal') {
        totalCash -= Number(movement.amount);
      }
    });

    orders?.forEach((order) => {
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
      items: cartItems.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
        name: item.name,
        sku: item.sku,
      })),
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
    } else {
      // orderType === 'delivery'
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
    updateRestaurantPosStatusMutation.mutate({
      restaurantId,
      pos_status: event.target.checked ? 'open' : 'closed',
    });
  };

  const orderStatuses = useMemo(
    () => [
      { id: 'pending', label: t('pdv.status_pending'), color: 'var(--info)', icon: <InboxIcon /> },
      {
        id: 'preparing',
        label: t('pdv.status_preparing'),
        color: 'var(--warning)',
        icon: <FireIcon />,
      },
      {
        id: 'ready',
        label: t('pdv.status_ready'),
        color: 'var(--success)',
        icon: <CheckCircleIcon />,
      },
      {
        id: 'on_the_way',
        label: t('pdv.status_on_the_way'),
        color: 'var(--primary)',
        icon: <MotorcycleIcon />,
      },
      {
        id: 'delivered',
        label: t('pdv.status_delivered'),
        color: 'var(--gray)',
        icon: <ClipboardCheckIcon />,
      },
      {
        id: 'concluded',
        label: t('pdv.status_concluded'),
        color: 'var(--success)',
        icon: <CheckCircleIcon />,
      }, // Assuming concluded is similar to delivered
      {
        id: 'cancelled',
        label: t('pdv.status_cancelled'),
        color: 'var(--danger)',
        icon: <CloseIcon />,
      },
      {
        id: 'rejected',
        label: t('pdv.status_rejected'),
        color: 'var(--danger)',
        icon: <CloseIcon />,
      },
    ],
    [t]
  );

  const ordersByStatus = useMemo(() => {
    const grouped = {};
    orderStatuses.forEach((status) => {
      grouped[status.id] = orders?.filter((order) => order.status === status.id) || [];
    });
    return grouped;
  }, [orders, orderStatuses]);

  const ordersToday = useMemo(() => {
    if (!orders) return [];
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of today

    return orders.filter((order) => {
      const orderDate = new Date(order.order_date);
      orderDate.setHours(0, 0, 0, 0); // Set to start of order date
      return orderDate.getTime() === today.getTime();
    });
  }, [orders]);

  const ordersTodayCount = ordersToday.length;

  const completedOrdersCount = useMemo(() => {
    return ordersToday.filter((order) => ['delivered', 'concluded'].includes(order.status)).length;
  }, [ordersToday]);

  const inPreparationOrdersCount = useMemo(() => {
    return ordersToday.filter((order) => ['pending', 'preparing'].includes(order.status)).length;
  }, [ordersToday]);

  const revenueToday = useMemo(() => {
    return ordersToday
      .filter((order) => ['delivered', 'concluded'].includes(order.status))
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
    setShowOrderSectionMobile((prev) => !prev);
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
    <div className="flex flex-col h-screen">
      {/* Main Content */}
      <main className="flex-grow">
        {/* Tabs Container */}
        <div className="flex flex-col h-full">
          <div className="flex border-b border-gray-300 bg-white">
            <button
              className={
                currentTab === 'pdv'
                  ? 'px-4 py-2 cursor-pointer border-b-2 border-red-400 transition-all duration-300 font-medium text-red-400 bg-transparent border-none outline-none flex-grow min-w-[80px] flex items-center justify-center gap-1'
                  : 'px-4 py-2 cursor-pointer border-b-2 border-transparent transition-all duration-300 font-medium text-gray-600 bg-transparent border-none outline-none flex-grow min-w-[80px] flex items-center justify-center gap-1'
              }
              onClick={() => setCurrentTab('pdv')}
            >
              <PointOfSaleIcon /> {t('pdv.tab_pdv')}
            </button>
            <button
              className={
                currentTab === 'tables'
                  ? 'px-4 py-2 cursor-pointer border-b-2 border-red-400 transition-all duration-300 font-medium text-red-400 bg-transparent border-none outline-none flex-grow min-w-[80px] flex items-center justify-center gap-1'
                  : 'px-4 py-2 cursor-pointer border-b-2 border-transparent transition-all duration-300 font-medium text-gray-600 bg-transparent border-none outline-none flex-grow min-w-[80px] flex items-center justify-center gap-1'
              }
              onClick={() => setCurrentTab('tables')}
            >
              <RestaurantIcon /> {t('pdv.tab_tables')}
            </button>
            <button
              className={
                currentTab === 'orders'
                  ? 'px-4 py-2 cursor-pointer border-b-2 border-red-400 transition-all duration-300 font-medium text-red-400 bg-transparent border-none outline-none flex-grow min-w-[80px] flex items-center justify-center gap-1'
                  : 'px-4 py-2 cursor-pointer border-b-2 border-transparent transition-all duration-300 font-medium text-gray-600 bg-transparent border-none outline-none flex-grow min-w-[80px] flex items-center justify-center gap-1'
              }
              onClick={() => setCurrentTab('orders')}
            >
              <AssignmentIcon /> {t('pdv.tab_orders')}
            </button>
            <button
              className={
                currentTab === 'kanban'
                  ? 'px-4 py-2 cursor-pointer border-b-2 border-red-400 transition-all duration-300 font-medium text-red-400 bg-transparent border-none outline-none flex-grow min-w-[80px] flex items-center justify-center gap-1'
                  : 'px-4 py-2 cursor-pointer border-b-2 border-transparent transition-all duration-300 font-medium text-gray-600 bg-transparent border-none outline-none flex-grow min-w-[80px] flex items-center justify-center gap-1'
              }
              onClick={() => setCurrentTab('kanban')}
            >
              <AssignmentIcon /> {t('pdv.tab_kanban')}
            </button>
          </div>

          <div className="flex-grow overflow-hidden relative flex flex-col">
            {/* PDV Tab */}
            <div
              className={
                currentTab === 'pdv'
                  ? 'w-full h-full overflow-y-auto p-4 bg-gray-50 flex flex-col flex-grow'
                  : 'w-full h-full overflow-y-auto p-4 bg-gray-50 hidden'
              }
              id="pdv-tab"
            >
              <div className="grid grid-cols-1 md:grid-cols-[1fr_350px] h-[calc(100vh-60px)] overflow-hidden">
                {/* Products Section */}
                <div className="p-4 overflow-y-auto bg-gray-50">
                  <div className="flex mb-4 border-b border-gray-300">
                    <div
                      className="px-4 py-2 cursor-pointer border-b-2 border-red-400 transition-all duration-300 font-medium text-red-400"
                      onClick={() => setSelectedProductCategory('')}
                    >
                      {t('pdv.all_categories')}
                    </div>
                    {categories?.map((category) => (
                      <div
                        key={category.id}
                        className={
                          selectedProductCategory === category.id
                            ? 'px-4 py-2 cursor-pointer border-b-2 border-red-400 transition-all duration-300 font-medium text-red-400'
                            : 'px-4 py-2 cursor-pointer border-b-2 border-transparent transition-all duration-300 font-medium text-gray-600'
                        }
                        onClick={() => setSelectedProductCategory(category.id)}
                      >
                        {category.name}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-auto-fill-minmax-150 gap-4">
                    {products?.map((product) => (
                      <div
                        className="bg-white rounded-lg shadow-md p-4 cursor-pointer transition-all duration-300 text-center border border-gray-200 hover:-translate-y-0.5 hover:shadow-lg hover:border-red-400"
                        key={product.id}
                        onClick={() => handleAddToCart(product)}
                      >
                        <div className="w-full h-20 object-cover rounded-md mb-2 bg-gray-100 flex items-center justify-center text-gray-400 text-3xl">
                          {product.image && product.image.startsWith('http') ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover rounded-md"
                            />
                          ) : (
                            '🍔' // Placeholder emoji
                          )}
                        </div>
                        <div className="font-medium mb-1 text-sm">{product.name}</div>
                        <div className="text-red-400 font-semibold">
                          R$ {Number(product.price).toFixed(2).replace('.', ',')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Section */}
                <div
                  className={
                    isMobile && !showOrderSectionMobile
                      ? 'bg-white border-l border-gray-200 w-[350px] flex flex-col h-full'
                      : 'bg-white border-l border-gray-200 w-[350px] flex flex-col h-full visible'
                  }
                  id="orderSection"
                >
                  <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-lg font-semibold">
                      {selectedTable
                        ? `${t('pdv.command_table')} ${selectedTable.table_number}`
                        : t('pdv.current_order_title')}
                    </h3>
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
                      <button
                        className="px-4 py-2 border-none rounded-md cursor-pointer font-medium transition-all duration-300 inline-flex items-center justify-center bg-transparent border border-gray-300 text-gray-600 hover:bg-gray-50"
                        onClick={resetOrderForm}
                      >
                        {' '}
                        {/* Using resetOrderForm to clear customer details */}
                        <PointOfSaleIcon className="mr-1" /> {t('pdv.counter_sale')}
                      </button>
                      <button
                        className="bg-transparent border-none text-red-500 cursor-pointer text-sm flex items-center"
                        onClick={clearOrder}
                      >
                        <DeleteIcon className="mr-1" /> {t('pdv.clear_order')}
                      </button>
                    </div>
                  </div>

                  {orderType === 'dine_in' && (
                    <Box
                      sx={{
                        mb: 2,
                        p: 2,
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        backgroundColor: '#f9f9f9',
                      }}
                    >
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
                    <Box sx={{ mb: 2, position: 'relative' }}>
                      {' '}
                      {/* Added position: 'relative' here */}
                      <TextField
                        fullWidth
                        label={t('pdv.customer_search')}
                        value={customerSearchTerm}
                        onChange={(e) => setCustomerSearchTerm(e.target.value)}
                        sx={{ mb: 1 }}
                      />
                      {isLoadingSearchResults && <CircularProgress size={20} />}
                      {customerSearchTerm.length > 2 && searchResults?.length > 0 && (
                        <Paper
                          sx={{
                            maxHeight: 200,
                            overflow: 'auto',
                            position: 'absolute',
                            zIndex: 100,
                            width: '100%',
                            left: 0,
                            right: 0,
                          }}
                        >
                          {' '}
                          {/* Adjusted width and positioning */}
                          <List>
                            {searchResults.map((customer) => (
                              <ListItem
                                button
                                key={customer.id}
                                onClick={() => handleCustomerSelect(customer)}
                              >
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

                  <div className="flex-grow overflow-y-auto p-4" id="orderItems">
                    {cartItems.length === 0 ? (
                      <div className="text-center p-5 text-gray-400">{t('pdv.no_items_added')}</div>
                    ) : (
                      cartItems.map((item) => (
                        <div
                          className="flex justify-between items-center py-2 border-b border-gray-200"
                          key={item.id}
                        >
                          <div className="w-10 h-10 object-cover rounded-md mr-2 bg-gray-100 flex items-center justify-center text-2xl">
                            {item.image && item.image.startsWith('http') ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover rounded-md"
                              />
                            ) : (
                              item.image
                            )}
                          </div>
                          <div className="flex-grow">
                            <div className="font-medium mb-0.5">{item.name}</div>
                            <div className="text-red-400 font-medium">
                              R$ {Number(item.price).toFixed(2).replace('.', ',')}
                            </div>
                          </div>
                          <div className="flex items-center">
                            <button
                              className="w-6 h-6 rounded-full border border-gray-300 bg-transparent cursor-pointer flex items-center justify-center transition-all duration-300 hover:bg-gray-100"
                              onClick={() => handleQuantityChange(item.id, -1)}
                            >
                              -
                            </button>
                            <div className="mx-2 min-w-5 text-center">{item.quantity}</div>
                            <button
                              className="w-6 h-6 rounded-full border border-gray-300 bg-transparent cursor-pointer flex items-center justify-center transition-all duration-300 hover:bg-gray-100"
                              onClick={() => handleQuantityChange(item.id, 1)}
                            >
                              +
                            </button>
                            <button
                              className="bg-transparent border-none text-red-500 cursor-pointer text-base"
                              onClick={() => handleRemoveFromCart(item.id)}
                            >
                              <DeleteIcon />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="p-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">{t('pdv.subtotal_label')}</span>
                    <span className="font-medium" id="subtotal">
                      R$ {calculateSubtotal.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">{t('pdv.service_tax_label')}</span>
                    <span className="font-medium" id="serviceTax">
                      R$ {calculateServiceTax.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-gray-300 pt-2 mt-2 font-semibold text-lg">
                    <span className="text-gray-600">{t('pdv.total_label')}</span>
                    <span className="text-red-400" id="total">
                      R$ {calculateFinalTotal.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 p-4">
                  <button
                    className="p-3 rounded-md border-none cursor-pointer font-medium transition-all duration-300 inline-flex items-center justify-center bg-transparent border border-gray-300 text-gray-600 hover:bg-gray-50"
                    onClick={openPaymentModal}
                  >
                    <PaymentsIcon className="mr-1" /> {t('pdv.payment_button')}
                  </button>
                  <button
                    className="p-3 rounded-md border-none cursor-pointer font-medium transition-all duration-300 inline-flex items-center justify-center bg-emerald-400 text-white hover:bg-emerald-500"
                    onClick={handlePlaceOrder}
                    disabled={
                      createTableOrderMutation.isLoading ||
                      createPublicOrderMutation.isLoading ||
                      cartItems.length === 0 ||
                      !paymentMethod
                    }
                  >
                    <CheckCircleIcon className="mr-1" /> {t('pdv.finalize_button')}
                  </button>
                </div>
              </div>
            </div>

            {/* Tables Tab */}
            <div
              className={
                currentTab === 'tables'
                  ? 'w-full h-full overflow-y-auto p-4 bg-gray-50 flex flex-col flex-grow'
                  : 'w-full h-full overflow-y-auto p-4 bg-gray-50 hidden'
              }
              id="tables-tab"
            >
              <div className="p-4 overflow-y-auto">
                <div className="grid grid-cols-auto-fill-minmax-120 gap-4" id="tablesGrid">
                  {/* Tables will be dynamically generated */}
                  {isLoadingTables ? (
                    <CircularProgress />
                  ) : isErrorTables ? (
                    <Alert severity="error">{t('pdv.error_loading_tables')}</Alert>
                  ) : tables?.length === 0 ? (
                    <Typography
                      variant="h6"
                      color="textSecondary"
                      sx={{ textAlign: 'center', mt: 4 }}
                    >
                      {t('pdv.no_tables_found')}
                    </Typography>
                  ) : (
                    tables?.map((table) => {
                      let statusClass = '';
                      let statusText = '';

                      switch (table.status) {
                        case 'available':
                          statusClass = 'bg-emerald-100 text-emerald-700';
                          statusText = t('pdv.table_status_available');
                          break;
                        case 'occupied':
                          statusClass = 'bg-orange-100 text-orange-700';
                          statusText = t('pdv.table_status_occupied');
                          break;
                        case 'reserved':
                          statusClass = 'bg-blue-100 text-blue-700';
                          statusText = t('pdv.table_status_reserved');
                          break;
                        default:
                          statusClass = '';
                          statusText = table.status;
                      }

                      return (
                        <div
                          key={table.id}
                          className={`bg-white rounded-lg shadow-md p-4 cursor-pointer transition-all duration-300 text-center border border-gray-200 relative hover:-translate-y-0.5 hover:shadow-lg ${selectedTable?.id === table.id ? 'border-red-400' : ''}`}
                          onClick={() => handleSelectTableCard(table)}
                        >
                          <div className="text-2xl font-semibold text-gray-800 mb-1">
                            {table.table_number}
                          </div>
                          <div
                            className={`text-sm px-2 py-0.5 rounded-full inline-block ${statusClass}`}
                          >
                            {statusText}
                          </div>
                          <div className="mt-2 text-sm text-gray-600">
                            {t('pdv.table_capacity', { capacity: table.capacity })}
                          </div>
                          {table.active_orders_count > 0 ? (
                            <div className="absolute -top-1.5 -right-1.5 w-5.5 h-5.5 rounded-full bg-red-400 text-white flex items-center justify-center text-xs font-bold">
                              {table.active_orders_count}
                            </div>
                          ) : (
                            ''
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Orders Tab */}
            <div
              className={currentTab === 'orders' ? 'tab-pane active' : 'tab-pane'}
              id="orders-tab"
            >
              {/* Stats Cards */}
              <div className="grid grid-cols-auto-fill-minmax-200 gap-5 mb-8">
                <div className="bg-white rounded-lg p-5 shadow-md flex items-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mr-4 text-xl bg-red-100 text-red-400">
                    <ShoppingBasketIcon />
                  </div>
                  <div>
                    <div className="text-2xl font-semibold mb-1">{ordersTodayCount}</div>
                    <div className="text-sm text-gray-600">{t('pdv.orders_today')}</div>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-5 shadow-md flex items-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mr-4 text-xl bg-emerald-100 text-emerald-400">
                    <CheckCircleIcon />
                  </div>
                  <div>
                    <div className="text-2xl font-semibold mb-1">{completedOrdersCount}</div>
                    <div className="text-sm text-gray-600">{t('pdv.completed_orders')}</div>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-5 shadow-md flex items-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mr-4 text-xl bg-orange-100 text-orange-400">
                    <FireIcon />
                  </div>
                  <div>
                    <div className="text-2xl font-semibold mb-1">{inPreparationOrdersCount}</div>
                    <div className="text-sm text-gray-600">{t('pdv.in_preparation')}</div>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-5 shadow-md flex items-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mr-4 text-xl bg-blue-100 text-blue-600">
                    <PaymentsIcon />
                  </div>
                  <div>
                    <div className="text-2xl font-semibold mb-1">
                      R$ {revenueToday.toFixed(2).replace('.', ',')}
                    </div>
                    <div className="text-sm text-gray-600">{t('pdv.revenue_today')}</div>
                  </div>
                </div>
              </div>
              <div className="">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">{t('pdv.recent_orders_title')}</h2>
                  <div>
                    <button className="px-4 py-2 border-none rounded-md cursor-pointer font-medium transition-all duration-300 inline-flex items-center justify-center bg-transparent border border-gray-300 text-gray-600 hover:bg-gray-50 mr-2">
                      <FilterListIcon className="mr-1" /> {t('pdv.filter_button')}
                    </button>
                    <button className="px-4 py-2 border-none rounded-md cursor-pointer font-medium transition-all duration-300 inline-flex items-center justify-center bg-red-400 text-white hover:bg-red-500">
                      <AddIcon className="mr-1" /> {t('pdv.new_order_button')}
                    </button>
                  </div>
                </div>

                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-3 text-left border-b border-gray-200 font-semibold text-gray-800 text-sm">
                        {t('pdv.table_header_id')}
                      </th>
                      <th className="p-3 text-left border-b border-gray-200 font-semibold text-gray-800 text-sm">
                        {t('pdv.table_header_customer')}
                      </th>
                      <th className="p-3 text-left border-b border-gray-200 font-semibold text-gray-800 text-sm">
                        {t('pdv.table_header_datetime')}
                      </th>
                      <th className="p-3 text-left border-b border-gray-200 font-semibold text-gray-800 text-sm">
                        {t('pdv.table_header_items')}
                      </th>
                      <th className="p-3 text-left border-b border-gray-200 font-semibold text-gray-800 text-sm">
                        {t('pdv.table_header_total')}
                      </th>
                      <th className="p-3 text-left border-b border-gray-200 font-semibold text-gray-800 text-sm">
                        {t('pdv.table_header_status')}
                      </th>
                      <th className="p-3 text-left border-b border-gray-200 font-semibold text-gray-800 text-sm">
                        {t('pdv.table_header_actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders?.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="p-3 text-left border-b border-gray-200 text-red-400 font-bold">
                          #{order.external_order_id || order.id.substring(0, 8)}
                        </td>
                        <td className="p-3 text-left border-b border-gray-200">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2 font-bold text-sm">
                              {order.customer_details.name
                                ? order.customer_details.name.substring(0, 2).toUpperCase()
                                : '--'}
                            </div>
                            <span className="font-medium text-sm">
                              {order.customer_details.name}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 text-left border-b border-gray-200">
                          {new Date(order.order_date).toLocaleString()}
                        </td>
                        <td className="p-3 text-left border-b border-gray-200">
                          {order.items.length}
                        </td>
                        <td className="p-3 text-left border-b border-gray-200">
                          R$ {Number(order.total_amount).toFixed(2).replace('.', ',')}
                        </td>
                        <td className="p-3 text-left border-b border-gray-200">
                          <span
                            className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${orderStatuses.find((s) => s.id === order.status)?.color === '#2E86DE' ? 'bg-blue-100 text-blue-700' : orderStatuses.find((s) => s.id === order.status)?.color === '#FF9F43' ? 'bg-orange-100 text-orange-700' : orderStatuses.find((s) => s.id === order.status)?.color === '#1DD1A1' ? 'bg-emerald-100 text-emerald-700' : orderStatuses.find((s) => s.id === order.status)?.color === '#FF6B6B' ? 'bg-red-100 text-red-700' : orderStatuses.find((s) => s.id === order.status)?.color === '#95A5A6' ? 'bg-gray-100 text-gray-700' : orderStatuses.find((s) => s.id === order.status)?.color === '#FF4757' ? 'bg-rose-100 text-rose-700' : ''}`}
                          >
                            {orderStatuses.find((s) => s.id === order.status)?.label ||
                              order.status}
                          </span>
                        </td>
                        <td className="p-3 text-left border-b border-gray-200">
                          <button
                            className="w-6 h-6 rounded-full border-none bg-gray-100 text-gray-800 cursor-pointer transition-all duration-200 flex items-center justify-center text-xs hover:bg-red-400 hover:text-white"
                            title="Detalhes"
                            onClick={() => openOrderDetailsModal(order)}
                          >
                            <EyeIcon />
                          </button>
                          <button
                            className="w-6 h-6 rounded-full border-none bg-gray-100 text-gray-800 cursor-pointer transition-all duration-200 flex items-center justify-center text-xs hover:bg-red-400 hover:text-white"
                            title="Imprimir"
                          >
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
            <div
              className={
                currentTab === 'kanban'
                  ? 'w-full h-full overflow-y-auto p-4 bg-gray-50 flex flex-col flex-grow'
                  : 'w-full h-full overflow-y-auto p-4 bg-gray-50 hidden'
              }
              id="kanban-tab"
            >
              <div className="">
                {/* New button for "Abrir Caixa" / "Caixa Aberto" */}
                <div className="mb-5 text-right">
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      alignItems: 'center',
                      gap: 2,
                      mb: 2,
                    }}
                  >
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
                      {t('pdv.cash_register_open')} (
                      {formatTimeElapsed(currentCashRegisterSession.opening_time)}) - R${' '}
                      {calculateCurrentCash(currentCashRegisterSession, null, cashOrders)
                        .toFixed(2)
                        .replace('.', ',')}
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
                <div
                  className="flex flex-grow p-4 overflow-x-auto gap-4 items-start"
                  id="kanbanBoard"
                >
                  {orderStatuses
                    .filter((s) =>
                      ['pending', 'preparing', 'ready', 'on_the_way', 'delivered'].includes(s.id)
                    )
                    .map((statusCol) => (
                      <div
                        className={`w-[320px] bg-gray-100 rounded-lg p-3 flex-shrink-0 h-full flex flex-col ${statusCol.id === 'pending' ? 'border-t-4 border-blue-600' : statusCol.id === 'preparing' ? 'border-t-4 border-orange-400' : statusCol.id === 'ready' ? 'border-t-4 border-emerald-400' : statusCol.id === 'on_the_way' ? 'border-t-4 border-red-400' : statusCol.id === 'delivered' ? 'border-t-4 border-gray-500' : ''}`}
                        data-status={statusCol.id}
                        key={statusCol.id}
                        onDragOver={handleDragOver}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, statusCol.id)}
                      >
                        <div className="flex justify-between items-center mb-3 p-2 rounded-md bg-white shadow-sm">
                          <div className="font-semibold text-base flex items-center">
                            {statusCol.icon}
                            <span>{statusCol.label}</span>
                          </div>
                          <div className="bg-gray-200 text-gray-800 rounded-full px-2 py-0.5 text-xs font-bold">
                            {ordersByStatus[statusCol.id]?.length || 0}
                          </div>
                        </div>
                        <div
                          className="flex-grow overflow-y-auto p-1 flex flex-col gap-2"
                          data-column={statusCol.id}
                        >
                          {ordersByStatus[statusCol.id]?.map((order) => (
                            <div
                              className="bg-white rounded-lg shadow-md p-3 cursor-grab transition-all duration-200 border-l-4 border-red-400"
                              draggable="true"
                              onDragStart={(e) => handleDragStart(e, order.id)}
                              onDragEnd={handleDragEnd}
                              key={order.id}
                              data-order-id={order.id}
                            >
                              <div className="flex justify-between mb-2">
                                <div className="font-bold text-sm text-red-400">
                                  #{order.external_order_id || order.id.substring(0, 8)}
                                </div>
                                <div className="text-xs text-gray-600 bg-gray-50 px-1.5 py-0.5 rounded-md">
                                  {new Date(order.order_date).toLocaleTimeString()}
                                </div>
                              </div>
                              <div className="flex items-center mb-2">
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2 font-bold text-sm">
                                  {order.customer_details.name
                                    ? order.customer_details.name.substring(0, 2).toUpperCase()
                                    : '--'}
                                </div>
                                <div>
                                  <div className="font-medium text-sm">
                                    {order.customer_details.name}
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    {order.customer_details.phone}
                                  </div>
                                </div>
                              </div>
                              <div className="text-sm mb-2 text-gray-700 max-h-72 overflow-y-auto pr-1">
                                {/* Items will be listed here */}
                              </div>
                              <div className="flex justify-between items-center pt-2 border-t border-gray-200 mt-2">
                                <div className="font-bold text-base">
                                  R$ {Number(order.total_amount).toFixed(2).replace('.', ',')}
                                </div>
                                <div className="text-xs text-gray-600 bg-gray-50 px-1.5 py-0.5 rounded-md">
                                  {order.payment_method}
                                </div>
                                <div className="flex gap-1">
                                  <button
                                    className="w-6 h-6 rounded-full border-none bg-gray-100 text-gray-800 cursor-pointer transition-all duration-200 flex items-center justify-center text-xs hover:bg-red-400 hover:text-white"
                                    title="Detalhes"
                                    onClick={() => openOrderDetailsModal(order)}
                                  >
                                    <EyeIcon />
                                  </button>
                                  <button
                                    className="w-6 h-6 rounded-full border-none bg-gray-100 text-gray-800 cursor-pointer transition-all duration-200 flex items-center justify-center text-xs hover:bg-red-400 hover:text-white"
                                    title="Imprimir"
                                  >
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
      <div
        className="hidden fixed inset-0 w-full h-full bg-black bg-opacity-50 z-50 justify-center items-center"
        style={{ display: paymentModalOpen ? 'flex' : 'none' }}
      >
        <div className="bg-white rounded-lg w-11/12 max-w-md max-h-[90vh] overflow-y-auto shadow-xl animate-fade-in">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-xl text-gray-800">{t('pdv.payment_modal_title')}</h3>
            <button
              className="bg-transparent border-none text-2xl cursor-pointer text-gray-600"
              onClick={closePaymentModal}
            >
              &times;
            </button>
          </div>
          <div className="p-4">
            <div className="mb-4">
              <label className="block mb-1 text-sm text-gray-700">
                {t('pdv.total_value_label')}
              </label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md text-base"
                value={`R$ ${calculateFinalTotal.toFixed(2).replace('.', ',')}`}
                readOnly
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 text-sm text-gray-700">
                {t('pdv.payment_method_label')}
              </label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md text-base"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="">{t('pdv.select_option')}</option>
                <option value="cash">{t('pdv.payment_cash')}</option>
                <option value="credit">{t('pdv.payment_credit')}</option>
                <option value="debit">{t('pdv.payment_debit')}</option>
                <option value="pix">{t('pdv.payment_pix')}</option>
                <option value="meal">{t('pdv.payment_meal_voucher')}</option>
              </select>
            </div>
            {paymentMethod === 'cash' && (
              <div className="mb-4">
                <label className="block mb-1 text-sm text-gray-700">
                  {t('pdv.amount_received_label')}
                </label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-md text-base"
                  placeholder="R$ 0,00"
                />
              </div>
            )}
            {paymentMethod === 'cash' && (
              <div className="mb-4">
                <label className="block mb-1 text-sm text-gray-700">{t('pdv.change_label')}</label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-md text-base"
                  value="R$ 0,00"
                  readOnly
                />
              </div>
            )}
          </div>
          <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
            <button
              className="p-3 rounded-md border-none cursor-pointer font-medium transition-all duration-300 inline-flex items-center justify-center bg-transparent border border-gray-300 text-gray-600 hover:bg-gray-50"
              onClick={closePaymentModal}
            >
              <CloseIcon className="mr-1" /> {t('pdv.cancel_button')}
            </button>
            <button
              className="p-3 rounded-md border-none cursor-pointer font-medium transition-all duration-300 inline-flex items-center justify-center bg-red-400 text-white hover:bg-red-500"
              onClick={processPayment}
            >
              <CheckCircleIcon className="mr-1" /> {t('pdv.confirm_button')}
            </button>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      <div
        className="hidden fixed inset-0 w-full h-full bg-black bg-opacity-50 z-50 justify-center items-center"
        style={{ display: orderDetailsModalOpen ? 'flex' : 'none' }}
      >
        {selectedOrder && (
          <div className="bg-white rounded-lg w-11/12 max-w-md max-h-[90vh] overflow-y-auto shadow-xl animate-fade-in">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl text-gray-800">
                {t('pdv.order_details_modal_title')} #
                {selectedOrder.external_order_id || selectedOrder.id?.substring(0, 8)}
              </h3>
              <button
                className="bg-transparent border-none text-2xl cursor-pointer text-gray-600"
                onClick={closeOrderDetailsModal}
              >
                &times;
              </button>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-gray-50 rounded-lg p-4 mb-5">
                  <h4 className="text-base text-gray-700 mb-4 flex items-center">
                    <PersonIcon className="mr-2 text-red-400" /> {t('pdv.customer_info_title')}
                  </h4>
                  <div className="mb-2 flex justify-between">
                    <span className="text-sm text-gray-600">{t('pdv.name_label')}</span>
                    <span className="font-medium">{selectedOrder.customer_details.name}</span>
                  </div>
                  <div className="mb-2 flex justify-between">
                    <span className="text-sm text-gray-600">{t('pdv.phone_label')}</span>
                    <span className="font-medium">{selectedOrder.customer_details.phone}</span>
                  </div>
                  {/* Add email and address if available in selectedOrder.customer_details */}
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-5">
                  <h4 className="text-base text-gray-700 mb-4 flex items-center">
                    <InfoIcon className="mr-2 text-red-400" /> {t('pdv.order_info_title')}
                  </h4>
                  <div className="mb-2 flex justify-between">
                    <span className="text-sm text-gray-600">{t('pdv.table_header_datetime')}</span>
                    <span className="font-medium">
                      {new Date(selectedOrder.order_date).toLocaleString()}
                    </span>
                  </div>
                  <div className="mb-2 flex justify-between">
                    <span className="text-sm text-gray-600">{t('pdv.order_number_label')}</span>
                    <span className="font-medium">
                      #{selectedOrder.external_order_id || selectedOrder.id?.substring(0, 8)}
                    </span>
                  </div>
                  <div className="mb-2 flex justify-between">
                    <span className="text-sm text-gray-600">
                      {t('pdv.payment_method_label_details')}
                    </span>
                    <span className="font-medium">{selectedOrder.payment_method}</span>
                  </div>
                  <div className="mb-2 flex justify-between">
                    <span className="text-sm text-gray-600">{t('pdv.table_header_status')}</span>
                    <span className="font-medium">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${orderStatuses.find((s) => s.id === selectedOrder.status)?.color === '#2E86DE' ? 'bg-blue-100 text-blue-700' : orderStatuses.find((s) => s.id === selectedOrder.status)?.color === '#FF9F43' ? 'bg-orange-100 text-orange-700' : orderStatuses.find((s) => s.id === selectedOrder.status)?.color === '#1DD1A1' ? 'bg-emerald-100 text-emerald-700' : orderStatuses.find((s) => s.id === selectedOrder.status)?.color === '#FF6B6B' ? 'bg-red-100 text-red-700' : orderStatuses.find((s) => s.id === selectedOrder.status)?.color === '#95A5A6' ? 'bg-gray-100 text-gray-700' : orderStatuses.find((s) => s.id === selectedOrder.status)?.color === '#FF4757' ? 'bg-rose-100 text-rose-700' : ''}`}
                      >
                        {orderStatuses.find((s) => s.id === selectedOrder.status)?.label ||
                          selectedOrder.status}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              <h4 className="mt-5 mb-4 text-gray-800">
                <ListIcon className="mr-2" /> {t('pdv.order_items_title')}
              </h4>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-2 text-gray-700 font-medium">
                      {t('pdv.item_table_header_item')}
                    </th>
                    <th className="text-center p-2 text-gray-700 font-medium">
                      {t('pdv.item_table_header_qty')}
                    </th>
                    <th className="text-right p-2 text-gray-700 font-medium">
                      {t('pdv.item_table_header_unit_price')}
                    </th>
                    <th className="text-right p-2 text-gray-700 font-medium">
                      {t('pdv.item_table_header_subtotal')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="p-2 border-b border-gray-200">{item.name}</td>
                      <td className="text-center p-2 border-b border-gray-200">{item.quantity}</td>
                      <td className="text-right p-2 border-b border-gray-200">
                        R$ {Number(item.price).toFixed(2).replace('.', ',')}
                      </td>
                      <td className="text-right p-2 border-b border-gray-200">
                        R$ {(Number(item.price) * item.quantity).toFixed(2).replace('.', ',')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-end mt-5 pt-5 border-t border-gray-200">
                <span className="font-medium mr-5">{t('pdv.total_label')}</span>
                <span className="font-semibold text-xl text-red-400">
                  R$ {Number(selectedOrder.total_amount).toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
              <button
                className="p-3 rounded-md border-none cursor-pointer font-medium transition-all duration-300 inline-flex items-center justify-center bg-transparent border border-gray-300 text-gray-600 hover:bg-gray-50"
                onClick={closeOrderDetailsModal}
              >
                <CloseIcon className="mr-1" /> {t('pdv.close_button')}
              </button>
              <button className="p-3 rounded-md border-none cursor-pointer font-medium transition-all duration-300 inline-flex items-center justify-center bg-red-400 text-white hover:bg-red-500">
                <PrintIcon className="mr-1" /> {t('pdv.print_action')}
              </button>
              <button className="p-3 rounded-md border-none cursor-pointer font-medium transition-all duration-300 inline-flex items-center justify-center bg-red-400 text-white hover:bg-red-500">
                <CheckCircleIcon className="mr-1" /> {t('pdv.mark_as_delivered_button')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Toggle Order Button */}
      {isMobile && (
        <button
          className="fixed bottom-5 right-5 w-12 h-12 rounded-full bg-red-400 text-white flex items-center justify-center shadow-lg"
          id="toggleOrder"
          onClick={toggleOrderSectionMobile}
          style={{ display: isMobile ? 'flex' : 'none' }}
        >
          <ShoppingCartIcon />
        </button>
      )}

      {/* Table Options Modal */}
      <Dialog open={showTableOptionsModal} onClose={() => setShowTableOptionsModal(false)}>
        <DialogTitle>
          {t('pdv.table_options_title', { tableNumber: tableToActOn?.table_number })}
        </DialogTitle>
        <DialogContent>
          <Typography>{t('pdv.table_options_description')}</Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setShowTableOptionsModal(false);
              setCurrentTab('pdv'); // Switch to PDV to add items
            }}
          >
            {t('pdv.add_items_button')}
          </Button>
          <Button
            onClick={() => {
              setShowTableOptionsModal(false);
              // Logic to close account for tableToActOn
              // This would involve fetching the active order for tableToActOn
              // and then opening the payment modal with that order's details.
              // For now, let's just log it or open the payment modal with a dummy order.
              toast.info(t('pdv.close_account_toast', { tableNumber: tableToActOn?.table_number }));
            }}
            color="primary"
          >
            {t('pdv.close_account_button')}
          </Button>
        </DialogActions>
      </Dialog>

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
