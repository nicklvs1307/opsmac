import { useQuery, useMutation, useQueryClient } from 'react-query';
import axiosInstance from '@/services/axiosInstance';
import toast from 'react-hot-toast';
import { useAuth } from '@/app/providers/contexts/AuthContext';

const SURVEY_QUERY_KEYS = {
  const { user } = useAuth();
  const restaurantId = user?.restaurants?.[0]?.id;
  return useQuery(
    [SURVEY_QUERY_KEYS.surveys, restaurantId, filters],
    () => fetchSurveys(restaurantId, filters),
    {
      enabled: !!restaurantId,
      ...options,
    }
  );
};

const deleteSurvey = async (id) => {
  await axiosInstance.delete(`/surveys/${id}`);
};

export const useDeleteSurvey = (options) => {
  const queryClient = useQueryClient();
  return useMutation(deleteSurvey, {
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries(SURVEY_QUERY_KEYS.surveys);
      toast.success('Pesquisa excluída com sucesso!');
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(error.response?.data?.msg || 'Erro ao excluir pesquisa.');
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
};

const updateSurveyStatus = async ({ id, status }) => {
  const { data } = await axiosInstance.patch(`/surveys/${id}/status`, { status });
  return data;
};

export const useUpdateSurveyStatus = (options) => {
  const queryClient = useQueryClient();
  return useMutation(updateSurveyStatus, {
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries([SURVEY_QUERY_KEYS.surveyDetails, variables.id]);
      queryClient.invalidateQueries(SURVEY_QUERY_KEYS.surveys);
      toast.success('Status da pesquisa atualizado com sucesso!');
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(error.response?.data?.msg || 'Erro ao atualizar status da pesquisa.');
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
};
