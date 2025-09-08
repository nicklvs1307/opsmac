import React, { createContext, useContext, useReducer, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useQueryClient } from 'react-query';
import axiosInstance, { setAuthToken } from '@/services/axiosInstance';
import { useUpdateProfile } from '../../../features/Auth/api/authQueries';

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

  // On app start, check for token and fetch user
  useEffect(() => {
    console.log('AuthContext useEffect: Running');
    const token = localStorage.getItem('token');
    console.log('AuthContext useEffect: Token from localStorage:', token);

    if (token) {
      setAuthToken(token);
      console.log('AuthContext useEffect: Attempting to fetch /auth/me');
      axiosInstance
        .get('/auth/me')
        .then(async (response) => {
          console.log('AuthContext useEffect: /auth/me successful', response.data);
          const userData = response.data.user;
          let permissionSnapshot = null;

          const selectedRestaurantId = userData.restaurants && userData.restaurants.length > 0 ? userData.restaurants[0].id : null;
          if (selectedRestaurantId) {
            try {
              console.log('AuthContext useEffect: Attempting to fetch /iam/tree');
              const permResponse = await axiosInstance.get(`/iam/tree?restaurantId=${selectedRestaurantId}`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
              permissionSnapshot = permResponse.data;
              console.log('AuthContext useEffect: /iam/tree successful', permissionSnapshot);
            } catch (permError) {
              console.error("AuthContext useEffect: Failed to fetch permissions during /auth/me:", permError);
            }
          }

          dispatch({
            type: AUTH_ACTIONS.SET_USER,
            payload: {
              ...userData,
              permissionSnapshot: permissionSnapshot,
            },
          });
        })
        .catch((error) => {
          console.error('AuthContext useEffect: /auth/me failed:', error);
          setAuthToken(null);
          localStorage.removeItem('token');
          dispatch({ type: AUTH_ACTIONS.LOGOUT });
        });
    } else {
      console.log('AuthContext useEffect: No token found in localStorage');
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
    }
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axiosInstance.post('/auth/login', { email, password });
      const { token, ...userDataFromApi } = response.data;

      if (token) {
        localStorage.setItem('token', token); // Persist token to localStorage
        setAuthToken(token);

        const selectedRestaurantId = userDataFromApi.restaurants && userDataFromApi.restaurants.length > 0 ? userDataFromApi.restaurants[0].id : null;

        let permissionSnapshot = null;
        if (selectedRestaurantId) {
          try {
            const permResponse = await axiosInstance.get(`/iam/tree?restaurantId=${selectedRestaurantId}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            permissionSnapshot = permResponse.data;
          } catch (permError) {
            console.error("Failed to fetch permissions during login:", permError);
          }
        }

        // Construct the complete user object with permissionSnapshot
        const completeUser = {
          ...userDataFromApi,
          token: token, // Ensure token is part of user object
          permissionSnapshot: permissionSnapshot,
        };
        console.log('DEBUG: Complete user object after login:', JSON.stringify(completeUser, null, 2));
        // Dispatch the complete user object in one go
        dispatch({ type: AUTH_ACTIONS.SET_USER, payload: completeUser });

        toast.success(`Bem-vindo, ${userDataFromApi.name}!`);
        return { success: true, user: completeUser };
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
