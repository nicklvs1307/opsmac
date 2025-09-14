import { useQuery, useMutation, useQueryClient } from 'react-query';
import axiosInstance from '@/services/axiosInstance';
import toast from 'react-hot-toast';

const PRODUCTION_QUERY_KEYS = {
  stockableItems: 'stockableItems',
  productionRecords: 'productionRecords', // Assuming this key is used elsewhere for invalidation
};

// API Functions
const fetchStockableItems = async () => {
  const response = await axiosInstance.get('/labels/items');
  return response.data;
};

const fetchProductionRecords = async () => {
  const response = await axiosInstance.get('/labels/productions');
  return response.data;
};

const createProductionRecord = async (payload) => {
  const response = await axiosInstance.post('/labels/productions', payload);
  return response.data;
};

// React Query Hooks
export const useStockableItems = (options) => {
  return useQuery(PRODUCTION_QUERY_KEYS.stockableItems, fetchStockableItems, {
    ...options,
  });
};

export const useProductionRecords = (options) => {
  return useQuery(PRODUCTION_QUERY_KEYS.productionRecords, fetchProductionRecords, {
    ...options,
  });
};

export const useCreateProductionRecord = (options) => {
  const queryClient = useQueryClient();
  return useMutation(createProductionRecord, {
    onSuccess: (data, variables, context) => {
      toast.success('Registro de produção criado com sucesso!');
      queryClient.invalidateQueries(PRODUCTION_QUERY_KEYS.productionRecords);
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(error.response?.data?.message || 'Falha ao criar registro de produção.');
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
};
