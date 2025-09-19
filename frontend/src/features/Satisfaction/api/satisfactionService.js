import { useQuery } from 'react-query';
import axiosInstance from '@/services/axiosInstance';
import { useAuth } from '@/app/providers/contexts/AuthContext';

const fetchSatisfactionAnalytics = async (paramRestaurantId) => {
  const { user } = useAuth();
  const restaurantId = paramRestaurantId || user?.restaurants?.[0]?.id;
  return useQuery(
    ['feedbackWordFrequency', restaurantId, queryParams],
    () => fetchFeedbackWordFrequency(restaurantId, queryParams),
    {
      enabled: !!restaurantId,
    }
  );
};
