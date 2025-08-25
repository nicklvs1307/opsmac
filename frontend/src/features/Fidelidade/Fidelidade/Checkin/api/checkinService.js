import { useQuery, useMutation, useQueryClient } from 'react-query';
import axiosInstance from '@/shared/lib/axiosInstance';
import toast from 'react-hot-toast';

//================================================================================================
// CHECK-IN
//================================================================================================

// Hook to fetch active check-ins
export const useGetActiveCheckins = (restaurantId) => {
  return useQuery(
    ['activeCheckins', restaurantId],
    async () => {
      const { data } = await axiosInstance.get(`/api/checkin/active/${restaurantId}`);
      return data.activeCheckins;
    },
    {
      enabled: !!restaurantId,
    }
  );
};

// Hook to perform a checkout
export const useCheckout = () => {
  const queryClient = useQueryClient();
  return useMutation((checkinId) => axiosInstance.put(`/api/checkin/checkout/${checkinId}`), {
    onSuccess: () => {
      queryClient.invalidateQueries('activeCheckins');
      toast.success('Checkout realizado com sucesso!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Erro ao realizar checkout.');
    },
  });
};

// Hook to fetch check-in analytics
export const useGetCheckinAnalytics = (restaurantId) => {
  return useQuery(
    ['checkinAnalytics', restaurantId],
    async () => {
      const { data } = await axiosInstance.get(`/api/checkin/analytics/${restaurantId}`);
      return data;
    },
    {
      enabled: !!restaurantId,
    }
  );
};

//================================================================================================
// CHECK-IN SETTINGS
//================================================================================================

// Hook to fetch check-in settings
export const useGetCheckinSettings = (restaurantId) => {
  return useQuery(
    ['checkinSettings', restaurantId],
    async () => {
      const { data } = await axiosInstance.get(`/api/settings/${restaurantId}`);
      return data;
    },
    {
      enabled: !!restaurantId,
    }
  );
};

// Hook to update check-in settings
export const useUpdateCheckinSettings = (restaurantId) => {
  const queryClient = useQueryClient();
  return useMutation(
    (settings) => axiosInstance.put(`/api/settings/${restaurantId}`, { settings }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['checkinSettings', restaurantId]);
        toast.success('Configurações de check-in salvas com sucesso!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Erro ao salvar configurações de check-in.');
      },
    }
  );
};

// Hook to update restaurant profile (slug)
export const useUpdateRestaurantProfile = (restaurantId) => {
  const queryClient = useQueryClient();
  return useMutation(
    (profile) => axiosInstance.put(`/api/settings/${restaurantId}/profile`, profile),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['checkinSettings', restaurantId]);
        toast.success('Perfil do restaurante atualizado com sucesso!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Erro ao atualizar perfil do restaurante.');
      },
    }
  );
};
