import { useQuery, useMutation, useQueryClient } from 'react-query';
import axiosInstance from '@/services/axiosInstance';
import toast from 'react-hot-toast'; // Added for mutations

// Query Keys
const AUTH_QUERY_KEYS = {
  me: 'authMe',
  permissions: 'iamPermissions',
  login: 'authLogin', // New query key
  register: 'authRegister', // New query key
};

// API Functions
const fetchMe = async () => {
  const response = await axiosInstance.get('/auth/me');
  return response.data.user;
};

const fetchPermissions = async ({ queryKey }) => {
  const [, restaurantId] = queryKey;
  if (!restaurantId) {
    return null;
  }
  const response = await axiosInstance.get(`/iam/tree?restaurantId=${restaurantId}`);
  return response.data;
};

const updateProfile = async (userData) => {
  const { userId, ...data } = userData; // Assuming userId might be passed for profile update, though not explicitly in old authQueries
  const response = await axiosInstance.put('/auth/profile', data);
  return response.data;
};

const loginUser = async (credentials) => {
  const response = await axiosInstance.post('/auth/login', credentials);
  return response.data;
};

const registerCustomer = async (customerData) => {
  const response = await axiosInstance.post('/customers/public/register', customerData);
  return response.data;
};

// React Query Hooks
export const useFetchMe = () => {
  const token = localStorage.getItem('token');
  return useQuery([AUTH_QUERY_KEYS.me, token], fetchMe, {
    staleTime: Infinity,
    cacheTime: Infinity,
    retry: false,
    enabled: !!token,
  });
};

export const useFetchPermissions = (restaurantId) => {
  return useQuery([AUTH_QUERY_KEYS.permissions, restaurantId], fetchPermissions, {
    enabled: !!restaurantId,
    staleTime: Infinity,
    cacheTime: Infinity,
    retry: false,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation(updateProfile, {
    onSuccess: (data) => {
      queryClient.invalidateQueries(AUTH_QUERY_KEYS.me);
      queryClient.setQueryData(AUTH_QUERY_KEYS.me, (oldData) => {
        return oldData ? { ...oldData, ...data.user } : oldData;
      });
    },
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient(); // Added queryClient for potential invalidation if needed
  return useMutation(loginUser, {
    onSuccess: () => {
      // Invalidate 'me' query to refetch user data after successful login
      queryClient.invalidateQueries(AUTH_QUERY_KEYS.me);
    },
    onError: (error) => {
      toast.error(error.response?.data?.msg || 'Erro ao fazer login.');
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient(); // Added queryClient for potential invalidation if needed
  return useMutation(registerCustomer, {
    onSuccess: () => {
      // Optionally invalidate queries or show success message
      // queryClient.invalidateQueries(AUTH_QUERY_KEYS.someOtherQuery);
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.errors[0]?.msg || error.response?.data?.msg || 'Erro ao registrar.'
      );
    },
  });
};
