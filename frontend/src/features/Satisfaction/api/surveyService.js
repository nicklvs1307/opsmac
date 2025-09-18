import { useQuery, useMutation, useQueryClient } from 'react-query';
import axiosInstance from '@/services/axiosInstance';
import toast from 'react-hot-toast';

const SURVEY_QUERY_KEYS = {
  surveyDetails: 'surveyDetails',
  rewards: 'surveyRewards',
  npsCriteria: 'surveyNpsCriteria',
  surveys: 'surveys', // General surveys list for invalidation
  surveyResults: 'surveyResults', // Added for survey results
};

// API Functions
const createSurvey = async (surveyData) => {
  const { data } = await axiosInstance.post('/surveys', surveyData);
  return data;
};

const fetchSurvey = async (id) => {
  const { data } = await axiosInstance.get(`/surveys/${id}`);
  return data;
};

const fetchRewards = async (restaurantId) => {
  if (!restaurantId) return [];
  const { data } = await axiosInstance.get(`/rewards/restaurant/${restaurantId}?is_active=true`);
  return data.rewards;
};

const fetchNpsCriteria = async () => {
  const { data } = await axiosInstance.get('/nps-criteria');
  return data;
};

const updateSurvey = async ({ id, surveyData }) => {
  const { data } = await axiosInstance.put(`/surveys/${id}`, surveyData);
  return data;
};

const fetchSurveyResults = async (surveyId) => {
  const { data } = await axiosInstance.get(`/surveys/${surveyId}/results`);
  return data;
};

// React Query Hooks
export const useCreateSurvey = (options) => {
  const queryClient = useQueryClient();
  return useMutation(createSurvey, {
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries(SURVEY_QUERY_KEYS.surveys); // Invalidate general surveys list
      toast.success('Pesquisa criada com sucesso!');
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(error.response?.data?.msg || 'Erro ao criar pesquisa.');
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
};

export const useSurveyDetails = (id, options) => {
  return useQuery([SURVEY_QUERY_KEYS.surveyDetails, id], () => fetchSurvey(id), {
    enabled: !!id,
    ...options,
  });
};

export const useSurveyRewards = (restaurantId, options) => {
  return useQuery([SURVEY_QUERY_KEYS.rewards, restaurantId], () => fetchRewards(restaurantId), {
    enabled: !!restaurantId,
    ...options,
  });
};

export const useSurveyNpsCriteria = (options) => {
  return useQuery(SURVEY_QUERY_KEYS.npsCriteria, fetchNpsCriteria, {
    ...options,
  });
};

export const useUpdateSurvey = (options) => {
  const queryClient = useQueryClient();
  return useMutation(updateSurvey, {
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries([SURVEY_QUERY_KEYS.surveyDetails, variables.id]);
      queryClient.invalidateQueries(SURVEY_QUERY_KEYS.surveys);
      toast.success('Pesquisa atualizada com sucesso!');
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(error.response?.data?.msg || 'Erro ao atualizar pesquisa.');
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
};

export const useSurveyResults = (surveyId, options) => {
  return useQuery([SURVEY_QUERY_KEYS.surveyResults, surveyId], () => fetchSurveyResults(surveyId), {
    enabled: !!surveyId,
    ...options,
  });
};

const fetchSurveys = async (restaurantId, filters) => {
  const params = { ...filters, restaurantId: restaurantId };
  const { data } = await axiosInstance.get('/surveys', { params });
  return data;
};

import { useAuth } from '@/app/providers/contexts/AuthContext';

export const useSurveys = (filters, options) => {
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
