import { useQuery, useMutation, useQueryClient } from 'react-query';
import axiosInstance from '@/services/axiosInstance';
import toast from 'react-hot-toast';

const PURCHASES_QUERY_KEYS = {
  products: 'purchasesProducts',
  suppliers: 'purchasesSuppliers',
};

// API Functions
const fetchProducts = async (restaurantId) => {
  const { data } = await axiosInstance.get(`/products?restaurant_id=${restaurantId}`);
  return data;
};

const fetchSuppliers = async (restaurantId) => {
  const { data } = await axiosInstance.get(`/suppliers?restaurant_id=${restaurantId}`);
  return data;
};

const createPurchase = ({ restaurantId, purchaseData }) => {
  return axiosInstance.post(`/stock/restaurant/${restaurantId}/move`, purchaseData);
};

// React Query Hooks
export const useProductsForPurchases = (restaurantId) => {
  return useQuery(PURCHASES_QUERY_KEYS.products, () => fetchProducts(restaurantId), {
    enabled: !!restaurantId,
  });
};

export const useSuppliersForPurchases = (restaurantId) => {
  return useQuery(PURCHASES_QUERY_KEYS.suppliers, () => fetchSuppliers(restaurantId), {
    enabled: !!restaurantId,
  });
};

export const useCreatePurchase = () => {
  const queryClient = useQueryClient();
  return useMutation(createPurchase, {
    onSuccess: () => {
      queryClient.invalidateQueries('stocks'); // Invalidate stocks to reflect new purchase
      toast.success('Compra registrada com sucesso!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.msg || 'Erro ao registrar compra.');
    },
  });
};
