import { useQuery, useMutation } from 'react-query';
import axiosInstance from '@/services/axiosInstance';
import toast from 'react-hot-toast';

const PRINT_LABEL_QUERY_KEYS = {
  users: 'labelUsers',
  items: 'labelItems',
};

// API Functions
const fetchLabelUsers = async () => {
  const response = await axiosInstance.get('/labels/users');
  return response.data;
};

const fetchLabelItems = async () => {
  const response = await axiosInstance.get('/labels/items');
  return response.data;
};

const printLabel = async (payload) => {
  await axiosInstance.post('/labels/print', payload);
};

// React Query Hooks
export const useLabelUsers = (options) => {
  return useQuery(PRINT_LABEL_QUERY_KEYS.users, fetchLabelUsers, {
    ...options,
  });
};

export const useLabelItems = (options) => {
  return useQuery(PRINT_LABEL_QUERY_KEYS.items, fetchLabelItems, {
    ...options,
  });
};

export const usePrintLabel = (options) => {
  return useMutation(printLabel, {
    onSuccess: (data, variables, context) => {
      toast.success('Etiqueta impressa com sucesso!');
      // Invalidate relevant queries if needed
      // queryClient.invalidateQueries(PRINT_LABEL_QUERY_KEYS.someRelatedQuery);
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(error.response?.data?.message || 'Falha ao imprimir etiqueta.');
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
};
