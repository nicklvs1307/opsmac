import { useQuery, useMutation } from 'react-query';
import axiosInstance from '@/services/axiosInstance';
import toast from 'react-hot-toast';

const WAITER_ORDER_QUERY_KEYS = {
  products: 'waiterProducts',
};

// API Functions
const fetchWaiterProducts = async (restaurantId) => {
  // This endpoint might need to be created on the backend if it doesn't exist
  const response = await axiosInstance.get(`/restaurant/${restaurantId}/products`);
  return response.data;
};

const createWaiterOrder = async ({ restaurantId, orderData }) => {
  const response = await axiosInstance.post(`/restaurant/${restaurantId}/orders`, orderData);
  return response.data;
};

// React Query Hooks
export const useWaiterProducts = (restaurantId, options) => {
  return useQuery(
    [WAITER_ORDER_QUERY_KEYS.products, restaurantId],
    () => fetchWaiterProducts(restaurantId),
    {
      enabled: !!restaurantId,
      ...options,
    }
  );
};

export const useCreateWaiterOrder = (options) => {
  return useMutation(createWaiterOrder, {
    onSuccess: (data, variables, context) => {
      toast.success('Pedido criado com sucesso!');
      // Invalidate relevant queries if needed, e.g., orders list
      // queryClient.invalidateQueries(WAITER_ORDER_QUERY_KEYS.orders);
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(error.response?.data?.message || 'Erro ao criar pedido.');
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
};
