import React, { createContext, useContext, useReducer, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useQueryClient } from 'react-query';
import axiosInstance, { setAuthToken } from '@/services/axiosInstance';
import { useFetchMe, useFetchPermissions, useUpdateProfile } from '@/features/Auth/api/authQueries'; // Import new hooks

const AuthContext = createContext();

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  selectedRestaurantId: null, // New field
};

const AUTH_ACTIONS = {
  SET_USER: 'SET_USER',
  LOGOUT: 'LOGOUT',
  SET_LOADING: 'SET_LOADING',
  UPDATE_USER: 'UPDATE_USER',
  INIT: 'INIT',
  SET_SELECTED_RESTAURANT: 'SET_SELECTED_RESTAURANT',
  SET_PERMISSION_SNAPSHOT: 'SET_PERMISSION_SNAPSHOT',
};

const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.INIT:
      return {
        ...state,
        loading: false,
        isAuthenticated: !!action.payload.token,
      };
    case AUTH_ACTIONS.SET_USER:
      const user = action.payload || {};
      return {
        ...state,
        user: {
          ...user,
          token: localStorage.getItem('token'), // Ensure token is part of user object
          // Explicitly add permissionSnapshot from payload if it exists
          permissionSnapshot: user.permissionSnapshot || state.user?.permissionSnapshot || null,
        },
        isAuthenticated: true,
        loading: false,
        selectedRestaurantId:
          user.restaurants && user.restaurants.length > 0 ? user.restaurants[0].id : null, // Auto-select first restaurant
      };
    case AUTH_ACTIONS.LOGOUT:
      localStorage.removeItem('token'); // Ensure token is removed on logout
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        selectedRestaurantId: null,
      };
    case AUTH_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    case AUTH_ACTIONS.UPDATE_USER:
      return { ...state, user: { ...state.user, ...action.payload } };
    case AUTH_ACTIONS.SET_SELECTED_RESTAURANT:
      return { ...state, selectedRestaurantId: action.payload };
    case AUTH_ACTIONS.SET_PERMISSION_SNAPSHOT:
      if (!state.user) return state;
      return {
        ...state,
        user: { ...state.user, permissionSnapshot: action.payload },
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const queryClient = useQueryClient();
  const updateProfileMutation = useUpdateProfile();

  // Use useFetchMe hook for initial user data
  const { data: userData, isLoading: isUserLoading, isError: isUserError, refetch: refetchUser } = useFetchMe();

  // Use useFetchPermissions hook for permissions, dependent on selectedRestaurantId
  const { data: permissionSnapshot, isLoading: isPermissionsLoading, isError: isPermissionsError } = useFetchPermissions(state.selectedRestaurantId);

  // On app start, check for token and fetch user
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setAuthToken(token);
      refetchUser(); // Manually trigger useFetchMe
    } else {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
    }
  }, []);

  // Update user state when userData or permissionSnapshot changes
  useEffect(() => {
    if (userData) {
      const selectedRestaurantId = userData.restaurants && userData.restaurants.length > 0 ? userData.restaurants[0].id : null;
      dispatch({
        type: AUTH_ACTIONS.SET_USER,
        payload: {
          ...userData,
          permissionSnapshot: permissionSnapshot, // Use data from useFetchPermissions
        },
      });
    } else if (isUserError) {
      setAuthToken(null);
      localStorage.removeItem('token');
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  }, [userData, permissionSnapshot, isUserError]); // Add isUserError to dependencies

  const login = async (email, password) => {
    try {
      const response = await axiosInstance.post('/auth/login', { email, password });
      const { token, ...userDataFromApi } = response.data;

      if (token) {
        localStorage.setItem('token', token); // Persist token to localStorage
        setAuthToken(token);

        // Invalidate and refetch user data and permissions after login
        await queryClient.invalidateQueries('authMe');
        await queryClient.invalidateQueries('iamPermissions');
        await refetchUser(); // This will trigger the useEffect above to update state

        toast.success(`Bem-vindo, ${userDataFromApi.name}!`);
        return { success: true, user: userDataFromApi }; // Return userDataFromApi as user will be updated by useEffect
      } else {
        throw new Error('Token não recebido do servidor');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Erro ao fazer login';
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = async () => {
    setAuthToken(null);
    localStorage.removeItem('token'); // Ensure token is removed on logout
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
    queryClient.clear();
    toast.success('Logout realizado com sucesso');
  };

  const updateUser = async (userData) => {
    // eslint-disable-next-line no-unused-vars
    const { permissionSnapshot, roles, restaurants, token, id, ...payload } = userData;

    try {
      const updatedUser = await updateProfileMutation.mutateAsync(payload);
      dispatch({ type: AUTH_ACTIONS.UPDATE_USER, payload: updatedUser });
      toast.success('Perfil atualizado com sucesso!');
      return { success: true };
    } catch (error) {
      console.error("Failed to update user. Payload sent:", payload);
      const message = error.response?.data?.message || 'Erro ao atualizar perfil';
      toast.error(message);
      return { success: false, message };
    }
  };

  const setSelectedRestaurant = (restaurantId) => {
    // New setter function
    dispatch({ type: AUTH_ACTIONS.SET_SELECTED_RESTAURANT, payload: restaurantId });
  };

  const value = { ...state, login, logout, updateUser, setSelectedRestaurant, dispatch };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;