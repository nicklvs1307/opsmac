import React, { useState, useMemo, useEffect } from 'react';
import { useQueryClient } from 'react-query';
import toast from 'react-hot-toast';

import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  Paper,
  TextField,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  useMediaQuery,
} from '@mui/material';
import {
  PointOfSale as PointOfSaleIcon,
  Delete as DeleteIcon,
  Restaurant as RestaurantIcon,
  Assignment as AssignmentIcon,
  Add as AddIcon,
  FilterList as FilterListIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  DeliveryDining as MotorcycleIcon,
  DoneAll as ClipboardCheckIcon,
  Inbox as InboxIcon,
  LocalFireDepartment as FireIcon,
  Payments as PaymentsIcon,
  Person as PersonIcon,
  Info as InfoIcon,
  List as ListIcon,
  ShoppingCart as ShoppingCartIcon,
  ShoppingBasket as ShoppingBasketIcon,
  Visibility as EyeIcon,
  Print as PrintIcon,
} from '@mui/icons-material';
import { useAuth } from '@/app/providers/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import CashRegisterModal from '@/components/UI/CashRegisterModal';
import CashRegisterOptionsModal from '@/components/UI/CashRegisterOptionsModal';
import WithdrawalModal from '@/components/UI/WithdrawalModal';
import ReinforcementModal from '@/components/UI/ReinforcementModal';
import PartialSummaryModal from '@/components/UI/PartialSummaryModal';
// import StatCard from './components/StatCard'; // Componente não encontrado, importação comentada

import {
  usePdvOrders,
  usePdvRestaurantStatus,
  usePdvProducts,
  usePdvCategories,
  usePdvTables,
  usePdvCashRegisterSession,
  usePdvCashOrders,
  usePdvCustomers,
  useUpdatePdvOrderStatus,
  useUpdatePdvRestaurantOpenStatus,
  useUpdatePdvRestaurantPosStatus,
  useCreatePdvPublicOrder,
  useCreatePdvTableOrder,
  useCreatePdvCashRegisterSession,
  useCreatePdvWithdrawal,
  useCreatePdvReinforcement,
} from '../api/pdvQueries';
import { PDV_QUERY_KEYS } from '../api/pdvQueries';

const Pdv = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const restaurantId = user?.restaurants?.[0]?.id;

  const queryClient = useQueryClient();

  // Order Management State
  const [filterStatus] = useState('');

  // POS State
  const [cartItems, setCartItems] = useState([]);
  const [orderType, setOrderType] = useState('dine_in'); // 'dine_in' for table orders, 'delivery' for delivery orders
  const [selectedTable, setSelectedTable] = useState(null);

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedProductCategory, setSelectedProductCategory] = useState('');
  const [productSearchTerm] = useState('');
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
  const [, setCloseCashRegisterModalOpen] = useState(false);
  const [showTableOptionsModal, setShowTableOptionsModal] = useState(false); // New state for table options modal
  const [tableToActOn, setTableToActOn] = useState(null); // New state to store table for actions

  const resetOrderForm = () => {
    setCartItems([]);
    setSelectedTable(null);
    setCustomerName('');
    setCustomerPhone('');
    setPaymentMethod('');
    setNotes('');
    setSelectedCustomer(null);
  };

  // Fetch Data using react-query hooks
  const {
    data: orders,
    isLoading: isLoadingOrders,
    isError: isErrorOrders,
  } = usePdvOrders(restaurantId, filterStatus, {
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
  } = usePdvRestaurantStatus(restaurantId, {
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
  } = usePdvProducts(restaurantId, selectedProductCategory, productSearchTerm, {
    onError: (error) => {
      toast.error(
        t('pdv.error_loading_products', { message: error.response?.data?.msg || error.message })
      );
    },
  });

  const {
    data: categories,
    isLoading: isLoadingCategories,
    isError: isErrorCategories,
  } = usePdvCategories(restaurantId, {
    onError: (error) => {
      toast.error(
        t('pdv.error_loading_categories', { message: error.response?.data?.msg || error.message })
      );
    },
  });

  const {
    data: tables,
    isLoading: isLoadingTables,
    isError: isErrorTables,
  } = usePdvTables(restaurantId, orderType, {
    onError: (error) => {
      toast.error(
        t('pdv.error_loading_tables', { message: error.response?.data?.msg || error.message })
      );
    },
  });

  const {
    data: currentCashRegisterSession,
    isLoading: isLoadingCashRegisterSession,
    isError: isErrorCashRegisterSession,
  } = usePdvCashRegisterSession(restaurantId, user?.userId, {
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

  const {
    data: cashOrders,
    isLoading: isLoadingCashOrders,
    isError: isErrorCashOrders,
  } = usePdvCashOrders(currentCashRegisterSession?.id, {
    onError: (error) => {
      toast.error(
        t('pdv.error_loading_cash_orders', { message: error.response?.data?.msg || error.message })
      );
    },
  });

  const { data: searchResults, isLoading: isLoadingSearchResults } = usePdvCustomers(
    restaurantId,
    customerSearchTerm,
    {
      onError: (error) => {
        toast.error(
          t('pdv.error_loading_customers', { message: error.response?.data?.msg || error.message })
        );
      },
    }
  );

  // Mutations using react-query hooks
  const updateOrderStatusMutation = useUpdatePdvOrderStatus({
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

  const updateRestaurantOpenStatusMutation = useUpdatePdvRestaurantOpenStatus({
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

  const updateRestaurantPosStatusMutation = useUpdatePdvRestaurantPosStatus({
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

  const createPublicOrderMutation = useCreatePdvPublicOrder({
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

  const createTableOrderMutation = useCreatePdvTableOrder({
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

  const createCashRegisterSessionMutation = useCreatePdvCashRegisterSession({
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

  const createWithdrawalMutation = useCreatePdvWithdrawal({
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
  });

  const createReinforcementMutation = useCreatePdvReinforcement({
    onSuccess: () => {
      queryClient.invalidateQueries(PDV_QUERY_KEYS.cashRegisterSession);
      queryClient.invalidateQueries(PDV_QUERY_KEYS.cashOrders); // Invalidate cash orders to update balance
      toast.success('Reforço registrado com sucesso!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Erro ao registrar reforço.');
    },
  });
};
