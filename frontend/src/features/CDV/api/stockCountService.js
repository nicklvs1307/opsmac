import { useQuery, useMutation, useQueryClient } from 'react-query';
import axiosInstance from '@/services/axiosInstance';
import toast from 'react-hot-toast';

const STOCK_COUNT_QUERY_KEYS = {
  stockCountDetails: 'stockCountDetails',
  stockCounts: 'stockCounts', // For invalidation after completion
};

// API Functions
const fetchStockCountDetails = async (id) => {
  const response = await axiosInstance.get(`/labels/stock-counts/${id}`);
  return response.data;
};

const fetchStockCounts = async () => {
  const response = await axiosInstance.get('/labels/stock-counts');
  return response.data;
};

const saveStockCountChanges = async ({ id, items }) => {
  const response = await axiosInstance.put(`/labels/stock-counts/${id}`, { items });
  return response.data;
};

const completeStockCount = async (id) => {
  const response = await axiosInstance.post(`/labels/stock-counts/${id}/complete`);
  return response.data;
};

const startNewStockCount = async () => {
  const response = await axiosInstance.post('/labels/stock-counts');
  return response.data;
};

// React Query Hooks
export const useStockCountDetails = (id, options) => {
  return useQuery(
    [STOCK_COUNT_QUERY_KEYS.stockCountDetails, id],
    () => fetchStockCountDetails(id),
    {
      enabled: !!id,
      ...options,
    }
  );
};

export const useStockCounts = (options) => {
  return useQuery(STOCK_COUNT_QUERY_KEYS.stockCounts, fetchStockCounts, {
    ...options,
  });
};

export const useSaveStockCountChanges = (options) => {
  const queryClient = useQueryClient();
  return useMutation(saveStockCountChanges, {
    onSuccess: (data, variables, context) => {
      toast.success('Alterações salvas!');
      queryClient.invalidateQueries([STOCK_COUNT_QUERY_KEYS.stockCountDetails, variables.id]);
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(error.response?.data?.message || 'Falha ao salvar alterações.');
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
};

export const useCompleteStockCount = (options) => {
  const queryClient = useQueryClient();
  return useMutation(completeStockCount, {
    onSuccess: (data, variables, context) => {
      toast.success('Contagem de estoque concluída e ajustada!');
      queryClient.invalidateQueries(STOCK_COUNT_QUERY_KEYS.stockCounts);
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(error.response?.data?.message || 'Falha ao concluir contagem.');
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
};

export const useStartNewStockCount = (options) => {
  const queryClient = useQueryClient();
  return useMutation(startNewStockCount, {
    onSuccess: (data, variables, context) => {
      toast.success('Nova contagem de estoque iniciada com sucesso!');
      queryClient.invalidateQueries(STOCK_COUNT_QUERY_KEYS.stockCounts);
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(error.response?.data?.message || 'Falha ao iniciar nova contagem.');
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
};
