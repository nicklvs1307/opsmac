import { useQuery } from 'react-query';
import axiosInstance from '@/services/axiosInstance';

const fetchSatisfactionAnalytics = async (restaurantId) => {
  // This endpoint needs to be created in the backend.
  const { data } = await axiosInstance.get(`/surveys/analytics/${restaurantId}`);
  return data;
};

const fetchNpsCriteria = async () => {
  const { data } = await axiosInstance.get('/nps-criteria');
  return data;
};

export const useSatisfactionAnalytics = (restaurantId) => {
  return useQuery(
    ['satisfactionAnalytics', restaurantId],
    () => fetchSatisfactionAnalytics(restaurantId),
    {
      enabled: !!restaurantId, // Only run the query if restaurantId is available
    }
  );
};

export const useNpsCriteria = () => {
  return useQuery('npsCriteria', fetchNpsCriteria);
};

const fetchSurveysComparisonAnalytics = async (restaurantId, surveyIds) => {
  const { data } = await axiosInstance.post(`/surveys/comparison-analytics`, {
    restaurantId,
    surveyIds,
  });
  return data;
};

export const useSurveysComparisonAnalytics = (restaurantId, surveyIds) => {
  return useQuery(
    ['surveysComparisonAnalytics', restaurantId, surveyIds],
    () => fetchSurveysComparisonAnalytics(restaurantId, surveyIds),
    {
      enabled: !!restaurantId && surveyIds?.length > 0,
    }
  );
};

const fetchQuestionAnswersDistribution = async (surveyId, questionId) => {
  const { data } = await axiosInstance.get(
    `/surveys/${surveyId}/questions/${questionId}/answers-distribution`
  );
  return data;
};

export const useQuestionAnswersDistribution = (surveyId, questionId) => {
  return useQuery(
    ['questionAnswersDistribution', surveyId, questionId],
    () => fetchQuestionAnswersDistribution(surveyId, questionId),
    {
      enabled: !!surveyId && !!questionId,
    }
  );
};

const fetchFeedbackWordFrequency = async (restaurantId, queryParams) => {
  const { data } = await axiosInstance.get(`/feedbacks/word-frequency`, { params: queryParams });
  return data;
};

export const useFeedbackWordFrequency = (restaurantId, queryParams) => {
  return useQuery(
    ['feedbackWordFrequency', restaurantId, queryParams],
    () => fetchFeedbackWordFrequency(restaurantId, queryParams),
    {
      enabled: !!restaurantId,
    }
  );
};
