import { useQuery, useMutation, useQueryClient } from 'react-query';
import axiosInstance from '@/services/axiosInstance';
import toast from 'react-hot-toast';
import { useAuth } from '@/app/providers/contexts/AuthContext';

const STOCK_QUERY_KEYS = {
  stocks: 'stocks',
  stockHistory: 'stockHistory',
};

// API Functions
const fetchStocks = async (restaurantId) => {
  const { data } = await axiosInstance.get(`/stock/restaurant/${restaurantId}`);
  return data;
};

const createStockMovement = ({ restaurantId, movement }) => {
  return axiosInstance.post(`/stock/restaurant/${restaurantId}/move`, movement);
};

const fetchStockHistory = async ({ restaurantId, productId }) => {
  const { data } = await axiosInstance.get(
    `/stock/restaurant/${restaurantId}/history/${productId}`
  );
  return data;
};

// React Query Hooks
export const useStocks = (restaurantId) => {
  const { user } = useAuth();
  return useQuery(STOCK_QUERY_KEYS.stocks, () => fetchStocks(restaurantId), {
    enabled: !!restaurantId && !!user?.token,
  });
};

export const useCreateStockMovement = () => {
  const queryClient = useQueryClient();
  return useMutation(createStockMovement, {
    onSuccess: () => {
      queryClient.invalidateQueries(STOCK_QUERY_KEYS.stocks);
      queryClient.invalidateQueries(STOCK_QUERY_KEYS.stockHistory);
      toast.success('Movimentação de estoque realizada com sucesso!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Erro ao realizar movimentação de estoque.');
    },
  });
};

export const useStockHistory = (restaurantId, productId) => {
  const { user } = useAuth();
  return useQuery(
    [STOCK_QUERY_KEYS.stockHistory, restaurantId, productId],
    () => fetchStockHistory({ restaurantId, productId }),
    {
      enabled: !!restaurantId && !!productId && !!user?.token,
    }
  );
};
