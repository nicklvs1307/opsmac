import { useQuery, useMutation, useQueryClient } from 'react-query';
import axiosInstance from '@/services/axiosInstance';
import { useAuth } from '@/app/providers/contexts/AuthContext';

const FINANCIAL_QUERY_KEYS = {
  categories: 'financialCategories',
  transactions: 'financialTransactions',
};

// API Functions - Financial Categories
const fetchFinancialCategories = async (restaurantId) => {
  const response = await axiosInstance.get(`/financial/categories?restaurant_id=${restaurantId}`);
  return response.data;
};
const createFinancialCategory = async (newCategory) => {
  const response = await axiosInstance.post('/financial/categories', newCategory);
  return response.data;
};
const updateFinancialCategory = async ({ id, fields }) => {
  const response = await axiosInstance.put(`/financial/categories/${id}`, fields);
  return response.data;
};
const deleteFinancialCategory = async (categoryId) => {
  const response = await axiosInstance.delete(`/financial/categories/${categoryId}`);
  return response.data;
};

// API Functions - Financial Transactions
const fetchFinancialTransactions = async (filters) => {
  const response = await axiosInstance.get(
    `/financial/transactions?restaurant_id=${filters.restaurantId}`
  );
  return response.data;
};
const createFinancialTransaction = async (newTransaction) => {
  const response = await axiosInstance.post('/financial/transactions', newTransaction);
  return response.data;
};
const updateFinancialTransaction = async ({ id, fields }) => {
  const response = await axiosInstance.put(`/financial/transactions/${id}`, fields);
  return response.data;
};
const deleteFinancialTransaction = async (transactionId) => {
  const response = await axiosInstance.delete(`/financial/transactions/${transactionId}`);
  return response.data;
};

// React Query Hooks - Financial Categories
export const useFinancialCategories = (restaurantId) => {
  const { user } = useAuth();
  return useQuery(
    [FINANCIAL_QUERY_KEYS.categories, restaurantId],
    () => fetchFinancialCategories(restaurantId),
    {
      enabled: !!restaurantId && !!user?.token,
    }
  );
};
export const useCreateFinancialCategory = () => {
  const queryClient = useQueryClient();
  return useMutation(createFinancialCategory, {
    onSuccess: () => {
      queryClient.invalidateQueries(FINANCIAL_QUERY_KEYS.categories);
    },
  });
};
export const useUpdateFinancialCategory = () => {
  const queryClient = useQueryClient();
  return useMutation(updateFinancialCategory, {
    onSuccess: () => {
      queryClient.invalidateQueries(FINANCIAL_QUERY_KEYS.categories);
    },
  });
};
export const useDeleteFinancialCategory = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteFinancialCategory, {
    onSuccess: () => {
      queryClient.invalidateQueries(FINANCIAL_QUERY_KEYS.categories);
    },
  });
};

// React Query Hooks - Financial Transactions
export const useFinancialTransactions = (filters) => {
  const { user } = useAuth();
  return useQuery(
    [FINANCIAL_QUERY_KEYS.transactions, filters],
    () => fetchFinancialTransactions(filters),
    {
      enabled: !!filters.restaurantId && !!user?.token,
    }
  );
};
export const useCreateFinancialTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation(createFinancialTransaction, {
    onSuccess: () => {
      queryClient.invalidateQueries(FINANCIAL_QUERY_KEYS.transactions);
    },
  });
};
export const useUpdateFinancialTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation(updateFinancialTransaction, {
    onSuccess: () => {
      queryClient.invalidateQueries(FINANCIAL_QUERY_KEYS.transactions);
    },
  });
};
export const useDeleteFinancialTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteFinancialTransaction, {
    onSuccess: () => {
      queryClient.invalidateQueries(FINANCIAL_QUERY_KEYS.transactions);
    },
  });
};
