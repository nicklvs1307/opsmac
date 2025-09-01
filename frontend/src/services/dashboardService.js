import { useQuery } from 'react-query';
import axiosInstance from './axiosInstance';

const DASHBOARD_QUERY_KEYS = {
  overview: 'dashboardOverview',
  analytics: 'dashboardAnalytics',
};

const fetchDashboardOverview = async (restaurantId) => {
  const response = await axiosInstance.get(`/dashboard/overview?restaurantId=${restaurantId}`);
  return response.data;
};

const fetchDashboardAnalytics = async (restaurantId, params) => {
  const response = await axiosInstance.get(`/dashboard/analytics?restaurantId=${restaurantId}`, {
    params,
  });
  return response.data;
};

export const useDashboardOverview = (restaurantId) => {
  return useQuery(
    [DASHBOARD_QUERY_KEYS.overview, restaurantId],
    () => fetchDashboardOverview(restaurantId),
    {
      enabled: !!restaurantId,
    }
  );
};

export const useDashboardAnalytics = (restaurantId, params) => {
  return useQuery(
    [DASHBOARD_QUERY_KEYS.analytics, restaurantId, params],
    () => fetchDashboardAnalytics(restaurantId, params),
    {
      enabled: !!restaurantId,
    }
  );
};
