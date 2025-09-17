import { useQuery, useMutation, useQueryClient } from 'react-query';
import axiosInstance from '@/services/axiosInstance';
import toast from 'react-hot-toast';
import { useAuth } from '@/app/providers/contexts/AuthContext';

//================================================================================================
// CHECK-IN
//================================================================================================

// Hook to fetch active check-ins
export const useGetActiveCheckins = (restaurantId, options) => {
  const { user } = useAuth();
  return useQuery(
    ['activeCheckins', restaurantId],
    async () => {
      const { data } = await axiosInstance.get(`/checkin/active/${restaurantId}`);
      return data.activeCheckins;
    },
    {
      enabled: !!restaurantId && !!user?.token,
      ...options,
    }
  );
};

// Hook to perform a checkout
export const useCheckout = () => {
  const queryClient = useQueryClient();
  return useMutation((checkinId) => axiosInstance.put(`/checkin/checkout/${checkinId}`), {
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
  const { user } = useAuth();
  return useQuery(
    ['checkinAnalytics', restaurantId],
    async () => {
      const { data } = await axiosInstance.get(`/checkin/analytics/${restaurantId}`);
      return data;
    },
    {
      enabled: !!restaurantId && !!user?.token,
    }
  );
};

//================================================================================================
// CHECK-IN SETTINGS
//================================================================================================

// Hook to fetch check-in settings
export const useGetCheckinSettings = (restaurantId) => {
  const { user } = useAuth();
  return useQuery(
    ['checkinSettings', restaurantId],
    async () => {
      const { data } = await axiosInstance.get(`/settings/${restaurantId}`);
      return data;
    },
    {
      enabled: !!restaurantId && !!user?.token,
    }
  );
};

// Hook to update check-in settings
export const useUpdateCheckinSettings = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ restaurantId, settings }) => axiosInstance.put(`/settings/${restaurantId}`, { settings }),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['checkinSettings', variables.restaurantId]);
        toast.success('Configurações de check-in salvas com sucesso!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Erro ao salvar configurações de check-in.');
      },
    }
  );
};

// Hook to update restaurant profile (slug)
export const useUpdateRestaurantProfile = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const restaurantId = user?.restaurants?.[0]?.id;
  
  return useMutation(
    ({ profile }) => axiosInstance.put(`/settings/${restaurantId}/profile`, profile),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['checkinSettings', restaurantId]);
        toast.success('Perfil do restaurante atualizado com sucesso!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Erro ao atualizar perfil do restaurante.');
      },
    }
  );
};
