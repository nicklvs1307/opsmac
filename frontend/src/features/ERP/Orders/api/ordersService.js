import { useQuery, useMutation, useQueryClient } from 'react-query';
import axiosInstance from '@/services/axiosInstance';
import toast from 'react-hot-toast';

const ORDERS_QUERY_KEYS = {
  orders: 'orders',
};

// API Functions
const fetchOrders = async ({ restaurantId, filterStatus }) => {
  const { data } = await axiosInstance.get(`/api/orders/restaurant/${restaurantId}`, {
    params: { status: filterStatus },
  });
  return data;
};

const updateOrderStatus = async ({ restaurantId, orderId, status }) => {
  const { data } = await axiosInstance.put(
    `/api/orders/restaurant/${restaurantId}/${orderId}/status`,
    { status }
  );
  return data;
};

// React Query Hooks
export const useOrders = (restaurantId, filterStatus) => {
  return useQuery(
    [ORDERS_QUERY_KEYS.orders, restaurantId, filterStatus],
    () => fetchOrders({ restaurantId, filterStatus }),
    {
      enabled: !!restaurantId,
      refetchInterval: 10000, // Poll every 10 seconds for new orders
    }
  );
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation(updateOrderStatus, {
    onSuccess: () => {
      queryClient.invalidateQueries(ORDERS_QUERY_KEYS.orders);
      toast.success('Status do pedido atualizado!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.msg || 'Erro ao atualizar status.');
    },
  });
};
