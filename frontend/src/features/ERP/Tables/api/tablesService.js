import { useQuery, useMutation, useQueryClient } from 'react-query';
import axiosInstance from '@/services/axiosInstance';
import toast from 'react-hot-toast';
import { useAuth } from '@/app/providers/contexts/AuthContext';

const TABLES_QUERY_KEYS = {
  tables: 'tables',
};

// API Functions
const fetchTables = async (restaurantId) => {
  const { data } = await axiosInstance.get(`/tables?restaurant_id=${restaurantId}`);
  return data;
};

const createTable = (table) => {
  return axiosInstance.post('/tables', table);
};

const updateTable = ({ id, ...table }) => {
  return axiosInstance.put(`/tables/${id}`, table);
};

const deleteTable = (id) => {
  return axiosInstance.delete(`/tables/${id}`);
};

const generateQrCode = (id) => {
  return axiosInstance.post(`/tables/${id}/generate-qr`);
};

// React Query Hooks
export const useTables = (restaurantId, options) => {
  const { user } = useAuth();
  return useQuery(TABLES_QUERY_KEYS.tables, () => fetchTables(restaurantId), {
    enabled: !!restaurantId && !!user?.token,
    ...options,
  });
};

export const useCreateTable = (options) => {
  const queryClient = useQueryClient();
  return useMutation(createTable, {
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries(TABLES_QUERY_KEYS.tables);
      options?.onSuccess?.(data, variables, context);
      toast.success('Mesa criada com sucesso!');
    },
    onError: (error, variables, context) => {
      toast.error(error.response?.data?.msg || 'Erro ao criar mesa.');
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
};

export const useUpdateTable = (options) => {
  const queryClient = useQueryClient();
  return useMutation(updateTable, {
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries(TABLES_QUERY_KEYS.tables);
      options?.onSuccess?.(data, variables, context);
      toast.success('Mesa atualizada com sucesso!');
    },
    onError: (error, variables, context) => {
      toast.error(error.response?.data?.msg || 'Erro ao atualizar mesa.');
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
};

export const useDeleteTable = (options) => {
  const queryClient = useQueryClient();
  return useMutation(deleteTable, {
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries(TABLES_QUERY_KEYS.tables);
      options?.onSuccess?.(data, variables, context);
      toast.success('Mesa deletada com sucesso!');
    },
    onError: (error, variables, context) => {
      toast.error(error.response?.data?.msg || 'Erro ao deletar mesa.');
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
};

export const useGenerateQrCode = (options) => {
  const queryClient = useQueryClient();
  return useMutation(generateQrCode, {
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries(TABLES_QUERY_KEYS.tables);
      options?.onSuccess?.(data, variables, context);
      toast.success('QR Code gerado com sucesso!');
    },
    onError: (error, variables, context) => {
      toast.error(error.response?.data?.msg || 'Erro ao gerar QR Code.');
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
};
