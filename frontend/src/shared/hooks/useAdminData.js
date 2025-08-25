import { useAdminUsers, useAdminRestaurants } from '../../features/Admin/api/adminQueries';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const useAdminData = () => {
  const { t } = useTranslation();

  const {
    data: users,
    isLoading: isLoadingUsers,
    isError: isErrorUsers,
    error: errorUsers,
  } = useAdminUsers();
  const {
    data: restaurants,
    isLoading: isLoadingRestaurants,
    isError: isErrorRestaurants,
    error: errorRestaurants,
  } = useAdminRestaurants();

  // Handle errors with toast
  if (isErrorUsers) {
    toast.error(t('admin_dashboard.error_loading_users_description'));
    console.error('Error loading users:', errorUsers);
  }
  if (isErrorRestaurants) {
    toast.error(t('admin_dashboard.error_loading_restaurants_description'));
    console.error('Error loading restaurants:', errorRestaurants);
  }

  const loading = isLoadingUsers || isLoadingRestaurants;

  return {
    users: users || [], // Provide empty array if data is not yet available
    restaurants: restaurants || [], // Provide empty array if data is not yet available
    loading,
    // No need for setLoading, fetchUsers, fetchRestaurants as react-query handles them
  };
};

export default useAdminData;
