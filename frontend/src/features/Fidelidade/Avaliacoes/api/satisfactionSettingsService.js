import { useQuery, useMutation, useQueryClient } from 'react-query';
import axiosInstance from '@/services/axiosInstance';
import toast from 'react-hot-toast';

const SATISFACTION_SETTINGS_QUERY_KEYS = {
  npsCriteria: 'npsCriteria',
  satisfactionSettings: 'satisfactionSettings',
};

// API Functions
const fetchNpsCriteria = async (restaurantId) => {
  const { data } = await axiosInstance.get(`/npsCriteria?restaurantId=${restaurantId}`);
  return data;
};

const createNpsCriterion = (name) => {
  return axiosInstance.post('/npsCriteria', { name });
};

const updateNpsCriterion = ({ id, name }) => {
  return axiosInstance.put(`/npsCriteria/${id}`, { name });
};

const deleteNpsCriterion = (id) => {
  return axiosInstance.delete(`/npsCriteria/${id}`);
};

const fetchSatisfactionSettings = (restaurantId) => {
  return axiosInstance.get(`/settings/${restaurantId}`);
};

const updateSatisfactionSettings = ({ restaurantId, settings }) => {
  return axiosInstance.put(`/settings/${restaurantId}`, { settings });
};

// React Query Hooks
export const useNpsCriteria = (restaurantId) => {
  return useQuery(
    [SATISFACTION_SETTINGS_QUERY_KEYS.npsCriteria, restaurantId],
    () => fetchNpsCriteria(restaurantId),
    {
      enabled: !!restaurantId,
    }
  );
};

export const useCreateNpsCriterion = () => {
  const queryClient = useQueryClient();
  return useMutation(createNpsCriterion, {
    onSuccess: () => {
      queryClient.invalidateQueries('npsCriteria');
      toast.success('Critério NPS criado com sucesso!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.msg || 'Ocorreu um erro.');
    },
  });
};

export const useUpdateNpsCriterion = () => {
  const queryClient = useQueryClient();
  return useMutation(updateNpsCriterion, {
    onSuccess: () => {
      queryClient.invalidateQueries('npsCriteria');
      toast.success('Critério NPS atualizado com sucesso!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.msg || 'Ocorreu um erro.');
    },
  });
};

export const useDeleteNpsCriterion = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteNpsCriterion, {
    onSuccess: () => {
      queryClient.invalidateQueries('npsCriteria');
      toast.success('Critério NPS deletado com sucesso!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.msg || 'Ocorreu um erro.');
    },
  });
};

export const useSatisfactionSettings = (restaurantId) => {
  return useQuery(
    ['satisfactionSettings', restaurantId],
    () => fetchSatisfactionSettings(restaurantId),
    {
      enabled: !!restaurantId,
    }
  );
};

export const useUpdateSatisfactionSettings = (restaurantId) => {
  const queryClient = useQueryClient();
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
