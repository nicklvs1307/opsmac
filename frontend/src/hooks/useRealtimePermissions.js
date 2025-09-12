import { useQuery } from 'react-query';
import axiosInstance from '@/services/axiosInstance';

const checkPermission = async (featureKey, actionKey) => {
  const { data } = await axiosInstance.post('/iam/check', { featureKey, actionKey });
  return data;
};

export const useCheckPermission = (featureKey, actionKey) => {
  return useQuery(
    ['permission', featureKey, actionKey], // Query key
    () => checkPermission(featureKey, actionKey),
    {
      enabled: !!featureKey && !!actionKey, // Only run if featureKey and actionKey are provided
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 15 * 60 * 1000, // 15 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    }
  );
};
