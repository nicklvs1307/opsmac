import { useQuery, useMutation, useQueryClient } from 'react-query';
import axiosInstance from '@/services/axiosInstance';
import toast from 'react-hot-toast';

const PAYMENT_METHODS_QUERY_KEYS = {
  paymentMethods: 'paymentMethods',
};

// API Functions
const fetchPaymentMethods = async ({ queryKey }) => {
  const [, restaurantId] = queryKey;
  const { data } = await axiosInstance.get(
    `/api/financial/payment-methods?restaurant_id=${restaurantId}`
  );
  return data;
};

const createPaymentMethod = async (newMethod) => {
  const { data } = await axiosInstance.post('/api/financial/payment-methods', newMethod);
  return data;
};

const updatePaymentMethod = async (updatedMethod) => {
  const { id, ...fields } = updatedMethod;
  const { data } = await axiosInstance.put(`/api/financial/payment-methods/${id}`, fields);
  return data;
};

const deletePaymentMethod = async (id) => {
  await axiosInstance.delete(`/financial/payment-methods/${id}`);
};

// React Query Hooks
export const usePaymentMethods = (restaurantId, options) => {
  return useQuery([PAYMENT_METHODS_QUERY_KEYS.paymentMethods, restaurantId], fetchPaymentMethods, {
    enabled: !!restaurantId,
    ...options,
  });
};

export const useCreatePaymentMethod = (options) => {
  const queryClient = useQueryClient();
  return useMutation(createPaymentMethod, {
    onSuccess: (data, variables, context) => {
      toast.success('Método de pagamento adicionado com sucesso!');
      queryClient.invalidateQueries(PAYMENT_METHODS_QUERY_KEYS.paymentMethods);
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(error.response?.data?.msg || 'Erro ao adicionar método de pagamento.');
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
};

export const useUpdatePaymentMethod = (options) => {
  const queryClient = useQueryClient();
  return useMutation(updatePaymentMethod, {
    onSuccess: (data, variables, context) => {
      toast.success('Método de pagamento atualizado com sucesso!');
      queryClient.invalidateQueries(PAYMENT_METHODS_QUERY_KEYS.paymentMethods);
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(error.response?.data?.msg || 'Erro ao atualizar método de pagamento.');
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
};

export const useDeletePaymentMethod = (options) => {
  const queryClient = useQueryClient();
  return useMutation(deletePaymentMethod, {
    onSuccess: (data, variables, context) => {
      toast.success('Método de pagamento excluído com sucesso!');
      queryClient.invalidateQueries(PAYMENT_METHODS_QUERY_KEYS.paymentMethods);
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(error.response?.data?.msg || 'Erro ao excluir método de pagamento.');
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
};
