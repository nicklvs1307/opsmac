import { useQuery, useMutation, useQueryClient } from 'react-query';
import axiosInstance from '@/services/axiosInstance';
import toast from 'react-hot-toast';

//================================================================================================
// INTEGRATIONS
//================================================================================================

// Hook to fetch integration settings
export const useGetIntegrationSettings = (options) => {
  const restaurantId = getRestaurantIdFromAuth();
  return useQuery(
    ['integrationSettings', restaurantId],
    async () => {
      const { data } = await axiosInstance.get(`/settings/${restaurantId}`);
      return data;
    },
    {
      enabled: !!restaurantId,
      ...options,
    }
  );
};

// Hook to update integration settings
export const useUpdateIntegrationSettings = (restaurantId) => {
  const queryClient = useQueryClient();
  return useMutation(
    (settings) => axiosInstance.put(`/settings/${restaurantId}`, { settings }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['integrationSettings', restaurantId]);
        toast.success('Configurações de integração salvas com sucesso!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Erro ao salvar configurações de integração.');
      },
    }
  );
};
