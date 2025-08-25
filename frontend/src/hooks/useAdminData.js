import { useState, useEffect } from 'react';
import {
  fetchUsers as fetchUsersService,
  fetchRestaurants as fetchRestaurantsService,
} from '../api/adminService';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const useAdminData = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await fetchUsersService();
      setUsers(data);
    } catch (error) {
      toast.error(t('admin_dashboard.error_loading_users_description'));
    } finally {
      setLoading(false);
    }
  };

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const data = await fetchRestaurantsService();
      setRestaurants(data);
    } catch (error) {
      toast.error(t('admin_dashboard.error_loading_restaurants_description'));
    } finally {
      setLoading(false);
    }
  };

  return { users, restaurants, loading, setLoading, fetchUsers, fetchRestaurants };
};

export default useAdminData;
