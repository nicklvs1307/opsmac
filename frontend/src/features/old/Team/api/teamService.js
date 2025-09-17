import { useQuery, useMutation, useQueryClient } from 'react-query';
import axiosInstance from '@/services/axiosInstance';
import toast from 'react-hot-toast';
import { useAuth } from '@/app/providers/contexts/AuthContext';

const TEAM_QUERY_KEYS = {
  teamMembers: 'teamMembers',
};

// API Functions
const fetchTeamMembers = async (restaurantId) => {
  const response = await axiosInstance.get(`/restaurant/${restaurantId}/users`);
  return response.data;
};

const createUser = async ({ restaurantId, userData }) => {
  const response = await axiosInstance.post(`/restaurant/${restaurantId}/users`, userData);
  return response.data;
};

const updateUser = async ({ restaurantId, userId, userData }) => {
  const response = await axiosInstance.put(`/restaurant/${restaurantId}/users/${userId}`, userData);
  return response.data;
};

const deleteUser = async ({ restaurantId, userId }) => {
  await axiosInstance.delete(`/restaurant/${restaurantId}/users/${userId}`);
};

// React Query Hooks
export const useTeamMembers = (restaurantId, options) => {
  const { user } = useAuth();
  return useQuery(
    [TEAM_QUERY_KEYS.teamMembers, restaurantId],
    () => fetchTeamMembers(restaurantId),
    {
      enabled: !!restaurantId && !!user?.token,
      ...options,
    }
  );
};

export const useCreateUser = (options) => {
  const queryClient = useQueryClient();
  return useMutation(createUser, {
    onSuccess: (data, variables, context) => {
      toast.success('Membro da equipe adicionado com sucesso!');
      queryClient.invalidateQueries(TEAM_QUERY_KEYS.teamMembers);
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(error.response?.data?.message || 'Erro ao adicionar membro da equipe.');
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
};

export const useUpdateUser = (options) => {
  const queryClient = useQueryClient();
  return useMutation(updateUser, {
    onSuccess: (data, variables, context) => {
      toast.success('Membro da equipe atualizado com sucesso!');
      queryClient.invalidateQueries(TEAM_QUERY_KEYS.teamMembers);
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(error.response?.data?.message || 'Erro ao atualizar membro da equipe.');
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
};

export const useDeleteUser = (options) => {
  const queryClient = useQueryClient();
  return useMutation(deleteUser, {
    onSuccess: (data, variables, context) => {
      toast.success('Membro da equipe excluído com sucesso!');
      queryClient.invalidateQueries(TEAM_QUERY_KEYS.teamMembers);
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(error.response?.data?.message || 'Erro ao excluir membro da equipe.');
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
};
