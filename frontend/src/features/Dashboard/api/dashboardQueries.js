import { useQuery } from 'react-query';
import axiosInstance from '@/services/axiosInstance';
import { useAuth } from '@/app/providers/contexts/AuthContext';

// Query Keys
const DASHBOARD_QUERY_KEYS = {
  overview: 'dashboardOverview',
  analytics: 'dashboardAnalytics',
};

// API Functions
const fetchDashboardOverview = async ({ restaurantId, period, token }) => {
  if (!restaurantId) {
    throw new Error('Restaurant ID is required to fetch dashboard data.');
  }

  if (!token) {
    throw new Error('User not authenticated or token not available.');
  }

  const response = await axiosInstance.get(`/dashboard/${restaurantId}/overview`, {
    params: { period },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// React Query Hooks
export const useDashboardOverview = (restaurantId, period) => {
  const { user } = useAuth(); // Call useAuth here

  return useQuery(
    [DASHBOARD_QUERY_KEYS.overview, restaurantId, period, user?.token],
    () => fetchDashboardOverview({ restaurantId, period, token: user?.token }),
    {
      enabled: !!restaurantId && !!user?.token, // Only run query if restaurantId and token are available
      staleTime: 5 * 60 * 1000, // Data considered fresh for 5 minutes
      cacheTime: 10 * 60 * 1000, // Data stays in cache for 10 minutes
      onError: (error) => {
        console.error('Error fetching dashboard data:', error);
        // You might want to add a toast here, but the component already handles it.
      },
    }
  );
};

const fetchDashboardAnalytics = async (restaurantId, params) => {
  const response = await axiosInstance.get(`/dashboard/analytics?restaurantId=${restaurantId}`, {
    params,
  });
  return response.data;
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
