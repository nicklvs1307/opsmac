import { useQuery, useMutation, useQueryClient } from 'react-query';
import axiosInstance from '@/services/axiosInstance';
import toast from 'react-hot-toast';

const SUPPLIER_QUERY_KEYS = {
  suppliers: 'suppliers',
};

// API Functions
const fetchSuppliers = async (restaurantId) => {
  const { data } = await axiosInstance.get(`/api/suppliers?restaurant_id=${restaurantId}`);
  return data;
};

const createSupplier = (newSupplier) => {
  return axiosInstance.post('/api/suppliers', newSupplier);
};

const updateSupplier = ({ id, updatedSupplier }) => {
  return axiosInstance.put(`/suppliers/${id}`, updatedSupplier);
};

const deleteSupplier = (id) => {
  return axiosInstance.delete(`/suppliers/${id}`);
};

// React Query Hooks
export const useSuppliers = (restaurantId) => {
  return useQuery(SUPPLIER_QUERY_KEYS.suppliers, () => fetchSuppliers(restaurantId), {
    enabled: !!restaurantId,
  });
};

export const useCreateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation(createSupplier, {
    onSuccess: () => {
      queryClient.invalidateQueries(SUPPLIER_QUERY_KEYS.suppliers);
      toast.success('Fornecedor criado com sucesso!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.msg || 'Erro ao criar fornecedor.');
    },
  });
};

export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation(updateSupplier, {
    onSuccess: () => {
      queryClient.invalidateQueries(SUPPLIER_QUERY_KEYS.suppliers);
      toast.success('Fornecedor atualizado com sucesso!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.msg || 'Erro ao atualizar fornecedor.');
    },
  });
};

export const useDeleteSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteSupplier, {
    onSuccess: () => {
      queryClient.invalidateQueries(SUPPLIER_QUERY_KEYS.suppliers);
      toast.success('Fornecedor excluído com sucesso!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.msg || 'Erro ao excluir fornecedor.');
    },
  });
};
