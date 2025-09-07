import { useQuery } from 'react-query';
import axiosInstance from '@/services/axiosInstance';
import { useAuth } from '@/app/providers/contexts/AuthContext'; // Import useAuth

// Query Keys
const DASHBOARD_QUERY_KEYS = {
  overview: 'dashboardOverview',
};

// API Functions
const fetchDashboardOverview = async ({ restaurantId, period }) => {
  if (!restaurantId) {
    throw new Error('Restaurant ID is required to fetch dashboard data.');
  }

  // Get the user and token from AuthContext
  const { user } = useAuth();
  if (!user || !user.token) {
    throw new Error('User not authenticated or token not available.');
  }

  const response = await axiosInstance.get(`/dashboard/${restaurantId}/overview`, {
    params: { period },
    headers: {
      Authorization: `Bearer ${user.token}`,
    },
  });
  return response.data;
};

// React Query Hooks
export const useDashboardOverview = (restaurantId, period) => {
  return useQuery(
    [DASHBOARD_QUERY_KEYS.overview, restaurantId, period],
    () => fetchDashboardOverview({ restaurantId, period }),
    {
      enabled: !!restaurantId, // Only run query if restaurantId is available
      staleTime: 5 * 60 * 1000, // Data considered fresh for 5 minutes
      cacheTime: 10 * 60 * 1000, // Data stays in cache for 10 minutes
      onError: (error) => {
        console.error('Error fetching dashboard data:', error);
        // You might want to add a toast here, but the component already handles it.
      },
    }
  );
};
