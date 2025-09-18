import { useQuery, useMutation, useQueryClient } from 'react-query';
import axiosInstance from '@/services/axiosInstance';
import toast from 'react-hot-toast';
import { useAuth } from '@/app/providers/contexts/AuthContext';

const SATISFACTION_SETTINGS_QUERY_KEYS = {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const restaurantId = user?.restaurants?.[0]?.id;
  return useMutation(updateSatisfactionSettings, {
    onSuccess: () => {
      queryClient.invalidateQueries(['satisfactionSettings', restaurantId]);
      toast.success('Configurações de satisfação salvas com sucesso!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.msg || 'Erro ao salvar configurações de satisfação.');
    },
  });
};
