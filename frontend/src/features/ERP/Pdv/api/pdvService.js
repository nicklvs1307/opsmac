import { useQuery, useMutation, useQueryClient } from 'react-query';
import axiosInstance from '@/services/axiosInstance';
import toast from 'react-hot-toast';

const PDV_QUERY_KEYS = {
  orders: 'pdvOrders',
  restaurantStatus: 'pdvRestaurantStatus',
  products: 'pdvProducts',
  categories: 'pdvCategories',
  tables: 'pdvTables',
  cashRegisterSession: 'pdvCashRegisterSession',
  cashOrders: 'pdvCashOrders',
  customers: 'pdvCustomers',
};

// API Functions
const fetchOrders = async ({ restaurantId, filterStatus }) => {
  const { data } = await axiosInstance.get(`/api/orders/restaurant/${restaurantId}`, {
    params: { status: filterStatus },
  });
  return data;
};

const fetchRestaurantStatus = async (restaurantId) => {
  const { data } = await axiosInstance.get(`/api/restaurant/${restaurantId}`);
  return data;
};

const fetchProducts = async ({ restaurantId, categoryId, searchTerm }) => {
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

const fetchTables = async (restaurantId) => {
  const { data } = await axiosInstance.get(`/api/restaurant/${restaurantId}/tables`);
  return data;
};

const fetchCashRegisterSession = async ({ restaurantId, userId }) => {
  const { data } = await axiosInstance.get(
    `/api/cash-register/current-session?restaurant_id=${restaurantId}&user_id=${userId}`
  );
  return data;
};

const fetchCashOrders = async (sessionId) => {
  const { data } = await axiosInstance.get(
    `/api/cash-register/cash-orders?session_id=${sessionId}`
  );
  return data;
};

const fetchCustomers = async ({ restaurantId, searchTerm }) => {
  const { data } = await axiosInstance.get(
    `/api/customers/restaurant/${restaurantId}?search=${searchTerm}`
  );
  return data;
};

const updateOrderStatus = async ({ restaurantId, orderId, status }) => {
  const { data } = await axiosInstance.put(
    `/api/orders/restaurant/${restaurantId}/${orderId}/status`,
    { status }
  );
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

const createCashRegisterSession = async (sessionData) => {
  const { data } = await axiosInstance.post('/cash-register/open', sessionData);
  return data;
};

const createWithdrawal = async (withdrawalData) => {
  const { data } = await axiosInstance.post('/cash-register/withdrawal', withdrawalData);
  return data;
};

const createReinforcement = async (reinforcementData) => {
  const { data } = await axiosInstance.post('/cash-register/reinforcement', reinforcementData);
  return data;
};

// React Query Hooks
export const usePdvOrders = (restaurantId, filterStatus, options) => {
  return useQuery(
    [PDV_QUERY_KEYS.orders, restaurantId, filterStatus],
    () => fetchOrders({ restaurantId, filterStatus }),
    {
      enabled: !!restaurantId,
      refetchInterval: 10000,
      ...options,
    }
  );
};

export const usePdvRestaurantStatus = (restaurantId, options) => {
  return useQuery(
    [PDV_QUERY_KEYS.restaurantStatus, restaurantId],
    () => fetchRestaurantStatus(restaurantId),
    {
      enabled: !!restaurantId,
      refetchInterval: 300000,
      ...options,
    }
  );
};

export const usePdvProducts = (restaurantId, categoryId, searchTerm, options) => {
  return useQuery(
    [PDV_QUERY_KEYS.products, restaurantId, categoryId, searchTerm],
    () => fetchProducts({ restaurantId, categoryId, searchTerm }),
    {
      enabled: !!restaurantId,
      ...options,
    }
  );
};

export const usePdvCategories = (restaurantId, options) => {
  return useQuery([PDV_QUERY_KEYS.categories, restaurantId], () => fetchCategories(restaurantId), {
    enabled: !!restaurantId,
    ...options,
  });
};

export const usePdvTables = (restaurantId, orderType, options) => {
  return useQuery([PDV_QUERY_KEYS.tables, restaurantId], () => fetchTables(restaurantId), {
    enabled: !!restaurantId && orderType === 'dine_in',
    ...options,
  });
};

export const usePdvCashRegisterSession = (restaurantId, userId, options) => {
  return useQuery(
    [PDV_QUERY_KEYS.cashRegisterSession, restaurantId, userId],
    () => fetchCashRegisterSession({ restaurantId, userId }),
    {
      enabled: !!restaurantId && !!userId,
      refetchInterval: 10000,
      ...options,
    }
  );
};

export const usePdvCashOrders = (sessionId, options) => {
  return useQuery([PDV_QUERY_KEYS.cashOrders, sessionId], () => fetchCashOrders(sessionId), {
    enabled: !!sessionId,
    refetchInterval: 10000,
    ...options,
  });
};

export const usePdvCustomers = (restaurantId, searchTerm, options) => {
  return useQuery(
    [PDV_QUERY_KEYS.customers, restaurantId, searchTerm],
    () => fetchCustomers({ restaurantId, searchTerm }),
    {
      enabled: !!restaurantId && searchTerm.length > 2,
      ...options,
    }
  );
};

export const useUpdatePdvOrderStatus = (options) => {
  const queryClient = useQueryClient();
  return useMutation(updateOrderStatus, {
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries(PDV_QUERY_KEYS.orders);
      toast.success('Status do pedido atualizado!');
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(error.response?.data?.message || 'Erro ao atualizar status.');
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
};

export const useUpdatePdvRestaurantOpenStatus = (options) => {
  const queryClient = useQueryClient();
  return useMutation(updateRestaurantOpenStatus, {
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries(PDV_QUERY_KEYS.restaurantStatus);
      toast.success('Status da loja atualizado!');
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(error.response?.data?.message || 'Erro ao atualizar status da loja.');
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
};

export const useUpdatePdvRestaurantPosStatus = (options) => {
  const queryClient = useQueryClient();
  return useMutation(updateRestaurantPosStatus, {
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries(PDV_QUERY_KEYS.restaurantStatus);
      toast.success('Status do PDV atualizado!');
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(error.response?.data?.message || 'Erro ao atualizar status do PDV.');
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
};

export const useCreatePdvPublicOrder = (options) => {
  const queryClient = useQueryClient();
  return useMutation(createPublicOrder, {
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries(PDV_QUERY_KEYS.orders);
      toast.success('Pedido criado com sucesso!');
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(error.response?.data?.message || 'Erro ao criar pedido.');
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
};

export const useCreatePdvTableOrder = (options) => {
  const queryClient = useQueryClient();
  return useMutation(createTableOrder, {
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries(PDV_QUERY_KEYS.orders);
      queryClient.invalidateQueries(PDV_QUERY_KEYS.tables); // Invalidate tables to update status
      toast.success('Pedido de mesa criado com sucesso!');
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(error.response?.data?.message || 'Erro ao criar pedido de mesa.');
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
};

export const useCreatePdvCashRegisterSession = (options) => {
  const queryClient = useQueryClient();
  return useMutation(createCashRegisterSession, {
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries(PDV_QUERY_KEYS.cashRegisterSession);
      toast.success('Sessão de caixa aberta com sucesso!');
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(error.response?.data?.message || 'Erro ao abrir sessão de caixa.');
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
};

export const useCreatePdvWithdrawal = (options) => {
  const queryClient = useQueryClient();
  return useMutation(createWithdrawal, {
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries(PDV_QUERY_KEYS.cashRegisterSession);
      queryClient.invalidateQueries(PDV_QUERY_KEYS.cashOrders); // Invalidate cash orders to update balance
      toast.success('Retirada registrada com sucesso!');
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(error.response?.data?.message || 'Erro ao registrar retirada.');
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
};

export const useCreatePdvReinforcement = (options) => {
  const queryClient = useQueryClient();
  return useMutation(createReinforcement, {
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries(PDV_QUERY_KEYS.cashRegisterSession);
      queryClient.invalidateQueries(PDV_QUERY_KEYS.cashOrders); // Invalidate cash orders to update balance
      toast.success('Reforço registrado com sucesso!');
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(error.response?.data?.message || 'Erro ao registrar reforço.');
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
};
