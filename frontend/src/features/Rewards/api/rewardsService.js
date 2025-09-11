import { useQuery, useMutation, useQueryClient } from 'react-query';
import axiosInstance from '@/services/axiosInstance';
import toast from 'react-hot-toast';
import { useAuth } from '@/app/providers/contexts/AuthContext';

const REWARDS_QUERY_KEYS = {
  rewards: 'rewards',
  analytics: 'rewardsAnalytics',
  selectedRewardAnalytics: 'selectedRewardAnalytics',
};

// API Functions
const fetchRewards = async ({ queryKey }) => {
  const [, restaurantId, page, filters] = queryKey;
  const params = {
    page,
    limit: 12,
    ...filters,
  };
  const response = await axiosInstance.get(`/rewards/restaurant/${restaurantId}`, {
    params,
  });
  return response.data;
};

const fetchAnalytics = async () => {
  const response = await axiosInstance.get('/rewards/analytics');
  return response.data;
};

const fetchSelectedRewardAnalytics = async (rewardId) => {
  const response = await axiosInstance.get(`/rewards/${rewardId}/analytics`);
  return response.data;
};

const createReward = async (rewardData) => {
  const response = await axiosInstance.post('/rewards', rewardData);
  return response.data;
};

const updateReward = async ({ id, ...rewardData }) => {
  const response = await axiosInstance.put(`/rewards/${id}`, rewardData);
  return response.data;
};

const deleteReward = async (id) => {
  await axiosInstance.delete(`/rewards/${id}`);
};

// React Query Hooks
export const useRewards = (restaurantId, page, filters, options) => {
  const { user } = useAuth(); // Add this line
  return useQuery(
    [REWARDS_QUERY_KEYS.rewards, restaurantId, page, filters],
    () => fetchRewards({ queryKey: [null, restaurantId, page, filters] }),
    {
      enabled: !!restaurantId && !!user?.token,
      ...options,
    }
  );
};

export const useRewardsAnalytics = (options) => {
  const { user } = useAuth(); // Add this line
  return useQuery(REWARDS_QUERY_KEYS.analytics, fetchAnalytics, {
    enabled: !!user?.token, // Add this line
    ...options,
  });
};

export const useSelectedRewardAnalytics = (rewardId, options) => {
  const { user } = useAuth(); // Add this line
  return useQuery(
    [REWARDS_QUERY_KEYS.selectedRewardAnalytics, rewardId],
    () => fetchSelectedRewardAnalytics(rewardId),
    {
      enabled: !!rewardId && !!user?.token,
      ...options,
    }
  );
};

export const useCreateReward = (options) => {
  const queryClient = useQueryClient();
  return useMutation(createReward, {
    onSuccess: (data, variables, context) => {
      toast.success('Recompensa criada com sucesso!');
      queryClient.invalidateQueries(REWARDS_QUERY_KEYS.rewards);
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(error.response?.data?.message || 'Erro ao criar recompensa.');
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
};

export const useUpdateReward = (options) => {
  const queryClient = useQueryClient();
  return useMutation(updateReward, {
    onSuccess: (data, variables, context) => {
      toast.success('Recompensa atualizada com sucesso!');
      queryClient.invalidateQueries(REWARDS_QUERY_KEYS.rewards);
      queryClient.invalidateQueries(REWARDS_QUERY_KEYS.selectedRewardAnalytics);
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(error.response?.data?.message || 'Erro ao atualizar recompensa.');
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
};

export const useDeleteReward = (options) => {
  const queryClient = useQueryClient();
  return useMutation(deleteReward, {
    onSuccess: (data, variables, context) => {
      toast.success('Recompensa excluída com sucesso!');
      queryClient.invalidateQueries(REWARDS_QUERY_KEYS.rewards);
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(error.response?.data?.message || 'Erro ao excluir recompensa.');
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
};
