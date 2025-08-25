import { useQuery, useMutation, useQueryClient } from 'react-query';
import axiosInstance from '@/shared/lib/axiosInstance'; // Adjust path as needed

// Query Keys
const CUSTOMER_QUERY_KEYS = {
  birthdays: 'customerBirthdays',
  dashboardMetrics: 'customerDashboardMetrics',
  customerDetail: 'customerDetail',
  customers: 'customers',
};

// API Functions
const fetchCustomerBirthdays = async (params) => {
  const response = await axiosInstance.get('/api/customers/birthdays', { params });
  return response.data;
};

const fetchCustomerDashboardMetrics = async (params) => {
  const response = await axiosInstance.get('/api/customers/dashboard-metrics', { params });
  return response.data;
};

const fetchCustomerDetail = async (id) => {
  const response = await axiosInstance.get(`/api/customers/${id}/details`);
  return response.data;
};

const resetCustomerVisits = async (id) => {
  const response = await axiosInstance.post(`/api/customers/${id}/reset-visits`);
  return response.data;
};

const clearCustomerCheckins = async (id) => {
  const response = await axiosInstance.post(`/api/customers/${id}/clear-checkins`);
  return response.data;
};

const updateCustomer = async ({ id, data }) => {
  const response = await axiosInstance.put(`/api/customers/${id}`, data);
  return response.data;
};

const fetchCustomers = async (params) => {
  const response = await axiosInstance.get('/api/customers', { params });
  return response.data;
};

const createCustomer = async (data) => {
  const response = await axiosInstance.post('/api/customers', data);
  return response.data;
};

const deleteCustomer = async (id) => {
  const response = await axiosInstance.delete(`/api/customers/${id}`);
  return response.data;
};

// React Query Hooks
export const useCustomerBirthdays = (params) => {
  return useQuery([CUSTOMER_QUERY_KEYS.birthdays, params], () => fetchCustomerBirthdays(params));
};

export const useCustomerDashboardMetrics = (params) => {
  return useQuery([CUSTOMER_QUERY_KEYS.dashboardMetrics, params], () =>
    fetchCustomerDashboardMetrics(params)
  );
};

export const useCustomerDetail = (id) => {
  return useQuery([CUSTOMER_QUERY_KEYS.customerDetail, id], () => fetchCustomerDetail(id), {
    enabled: !!id,
  });
};

export const useResetCustomerVisits = () => {
  const queryClient = useQueryClient();
  return useMutation(resetCustomerVisits, {
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries([CUSTOMER_QUERY_KEYS.customerDetail, variables]);
      queryClient.invalidateQueries(CUSTOMER_QUERY_KEYS.customers);
    },
  });
};

export const useClearCustomerCheckins = () => {
  const queryClient = useQueryClient();
  return useMutation(clearCustomerCheckins, {
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries([CUSTOMER_QUERY_KEYS.customerDetail, variables]);
      queryClient.invalidateQueries(CUSTOMER_QUERY_KEYS.customers);
    },
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation(updateCustomer, {
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries([CUSTOMER_QUERY_KEYS.customerDetail, variables.id]);
      queryClient.invalidateQueries(CUSTOMER_QUERY_KEYS.customers);
    },
  });
};

export const useCustomersList = (params) => {
  return useQuery([CUSTOMER_QUERY_KEYS.customers, params], () => fetchCustomers(params));
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation(createCustomer, {
    onSuccess: () => {
      queryClient.invalidateQueries(CUSTOMER_QUERY_KEYS.customers);
    },
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteCustomer, {
    onSuccess: () => {
      queryClient.invalidateQueries(CUSTOMER_QUERY_KEYS.customers);
    },
  });
};
