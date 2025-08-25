import { useQuery, useMutation, useQueryClient } from 'react-query';
import axiosInstance from '@/shared/lib/axiosInstance';
import toast from 'react-hot-toast';

//================================================================================================
// INTEGRATIONS
//================================================================================================

// Hook to fetch integration settings
export const useGetIntegrationSettings = (restaurantId) => {
  return useQuery(
    ['integrationSettings', restaurantId],
    async () => {
      const { data } = await axiosInstance.get(`/api/settings/${restaurantId}`);
      return data;
    },
    {
      enabled: !!restaurantId,
    }
  );
};

// Hook to update integration settings
export const useUpdateIntegrationSettings = (restaurantId) => {
  const queryClient = useQueryClient();
  return useMutation(
    (settings) => axiosInstance.put(`/api/settings/${restaurantId}`, { settings }),
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
