import { useQuery, useMutation, useQueryClient } from 'react-query';
import axiosInstance from '@/services/axiosInstance';
import toast from 'react-hot-toast';
import { useAuth } from '@/app/providers/contexts/AuthContext'; // Keeping this dependency for now

// Query Keys
const CHECKIN_QUERY_KEYS = {
  activeCheckins: 'checkinActiveCheckins',
  checkinAnalytics: 'checkinAnalytics',
  checkinSettings: 'checkinSettings',
  restaurantProfile: 'checkinRestaurantProfile', // For useUpdateRestaurantProfile
};

//================================================================================================
// CHECK-IN
//================================================================================================

// API Functions (raw functions for react-query hooks)
const fetchActiveCheckins = async (restaurantId) => {
  const { data } = await axiosInstance.get(`/checkin/active/${restaurantId}`);
  return data.activeCheckins;
};

const performCheckout = async (checkinId) => {
  await axiosInstance.put(`/checkin/checkout/${checkinId}`);
};

const fetchCheckinAnalytics = async (restaurantId) => {
  const { data } = await axiosInstance.get(`/checkin/analytics/${restaurantId}`);
  return data;
};

//================================================================================================
// CHECK-IN SETTINGS
//================================================================================================

const fetchCheckinSettings = async (restaurantId) => {
  const { data } = await axiosInstance.get(`/settings/${restaurantId}`);
  return data;
};

const updateCheckinSettings = async ({ restaurantId, settings }) => {
  const { data } = await axiosInstance.put(`/settings/${restaurantId}`, { settings });
  return data;
};

const updateRestaurantProfile = async ({ restaurantId, profile }) => {
  const { data } = await axiosInstance.put(`/settings/${restaurantId}/profile`, profile);
  return data;
};


// React Query Hooks
// Hook to fetch active check-ins
export const useGetActiveCheckins = (restaurantId, options) => {
  const { user } = useAuth();
  return useQuery(
    [CHECKIN_QUERY_KEYS.activeCheckins, restaurantId],
    () => fetchActiveCheckins(restaurantId),
    {
      enabled: !!restaurantId && !!user?.token,
      ...options,
    }
  );
};

// Hook to perform a checkout
export const useCheckout = () => {
  const queryClient = useQueryClient();
  return useMutation(performCheckout, {
    onSuccess: () => {
      queryClient.invalidateQueries(CHECKIN_QUERY_KEYS.activeCheckins);
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
    [CHECKIN_QUERY_KEYS.checkinAnalytics, restaurantId],
    () => fetchCheckinAnalytics(restaurantId),
    {
      enabled: !!restaurantId && !!user?.token,
    }
  );
};

// Hook to fetch check-in settings
export const useGetCheckinSettings = (restaurantId) => {
  const { user } = useAuth();
  return useQuery(
    [CHECKIN_QUERY_KEYS.checkinSettings, restaurantId],
    () => fetchCheckinSettings(restaurantId),
    {
      enabled: !!restaurantId && !!user?.token,
    }
  );
};

// Hook to update check-in settings
export const useUpdateCheckinSettings = () => {
  const queryClient = useQueryClient();
  return useMutation(updateCheckinSettings, {
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries([CHECKIN_QUERY_KEYS.checkinSettings, variables.restaurantId]);
      toast.success('Configurações de check-in salvas com sucesso!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Erro ao salvar configurações de check-in.');
    },
  });
};

// Hook to update restaurant profile (slug)
export const useUpdateRestaurantProfile = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const restaurantId = user?.restaurants?.[0]?.id; // This dependency on AuthContext is noted.
  
  return useMutation(
    ({ profile }) => updateRestaurantProfile({ restaurantId, profile }),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries([CHECKIN_QUERY_KEYS.checkinSettings, restaurantId]);
        toast.success('Perfil do restaurante atualizado com sucesso!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Erro ao atualizar perfil do restaurante.');
      },
    }
  );
};
