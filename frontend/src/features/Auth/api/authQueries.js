import { useQuery, useMutation, useQueryClient } from 'react-query';
import axiosInstance from '../../../shared/lib/axiosInstance';

// Query Keys
const AUTH_QUERY_KEYS = {
  me: 'authMe',
};

// API Functions
const fetchMe = async () => {
  const response = await axiosInstance.get('/auth/me');
  return response.data;
};

const loginUser = async ({ email, password }) => {
  const response = await axiosInstance.post('/auth/login', { email, password });
  return response.data;
};

const updateProfile = async (userData) => {
  const response = await axiosInstance.put('/auth/profile', userData);
  return response.data;
};

// React Query Hooks
export const useFetchMe = () => {
  return useQuery(AUTH_QUERY_KEYS.me, fetchMe, {
    staleTime: Infinity, // User data doesn't change often
    cacheTime: Infinity,
    retry: 1,
    enabled: !!localStorage.getItem('token'), // Only fetch if token exists
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  return useMutation(loginUser, {
    onSuccess: (data) => {
      // Invalidate 'me' query to refetch user data after successful login
      queryClient.invalidateQueries(AUTH_QUERY_KEYS.me);
      // Optionally, set token here if not handled by axiosInstance interceptor
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation(updateProfile, {
    onSuccess: (data) => {
      // Invalidate 'me' query to refetch updated user data
      queryClient.invalidateQueries(AUTH_QUERY_KEYS.me);
      // Optionally, update local cache directly if data is returned
      queryClient.setQueryData(AUTH_QUERY_KEYS.me, (oldData) => {
        return oldData ? { ...oldData, user: data.user } : oldData;
      });
    },
  });
};
