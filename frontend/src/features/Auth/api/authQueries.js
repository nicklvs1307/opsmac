import { useQuery, useMutation, useQueryClient } from 'react-query';
import axiosInstance from '@/services/axiosInstance'; // Using aliased path

// Query Keys
const AUTH_QUERY_KEYS = {
  me: 'authMe',
};

// API Functions
const fetchMe = async () => {
  // The token is now automatically added by the axios interceptor in axiosInstance.js
  const response = await axiosInstance.get('/auth/me');
  return response.data.user; // The endpoint returns { user: ... }
};

const updateProfile = async (userData) => {
  // The token is now automatically added by the axios interceptor in axiosInstance.js
  const response = await axiosInstance.put('/auth/profile', userData);
  return response.data;
};

// React Query Hooks
export const useFetchMe = () => {
  return useQuery(AUTH_QUERY_KEYS.me, fetchMe, {
    staleTime: Infinity,
    cacheTime: Infinity,
    retry: false, // Don't retry on auth errors, the context will handle logout
    enabled: false, // This query should be called manually by the AuthContext
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
        return oldData ? { ...oldData, ...data.user } : oldData;
      });
    },
  });
};
