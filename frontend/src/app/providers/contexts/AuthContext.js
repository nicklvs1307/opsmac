import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axiosInstance from '../../../shared/lib/axiosInstance';
import toast from 'react-hot-toast';
import { useFetchMe, useLogin, useUpdateProfile } from '../../../features/Auth/api/authQueries';
import { useQueryClient } from 'react-query'; // Import useQueryClient

const AuthContext = createContext();

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
  allowedModules: [], // Módulos permitidos para o usuário
  allowedPermissions: [], // Permissões permitidas para o usuário
};

const AUTH_ACTIONS = {
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  LOAD_USER: 'LOAD_USER',
  AUTH_ERROR: 'AUTH_ERROR',
  SET_LOADING: 'SET_LOADING',
  UPDATE_USER: 'UPDATE_USER',
};

const getModulesFromUser = (user) => {
  if (!user || !user.role || !user.role.name) {
    return [];
  }

  // If the user object already contains a 'modules' array (as it does for super_admin from backend)
  if (user.modules && Array.isArray(user.modules)) {
    return user.modules;
  }

  // Fallback for roles where 'modules' might not be directly provided or for backward compatibility
  const roleName = user.role.name;
  const allModules = ['fidelity', 'stock', 'orders', 'management', 'cdv', 'financial']; // All possible modules

  if (roleName === 'super_admin') {
    // This case should ideally be covered by user.modules, but as a fallback
    return allModules;
  } else if (roleName === 'admin' || roleName === 'owner') {
    return allModules.filter((mod) => mod !== 'admin');
  } else if (roleName === 'manager') {
    return ['fidelity', 'stock', 'orders', 'cdv', 'financial'];
  } else if (roleName === 'waiter') {
    return ['orders'];
  }
  return [];
};

const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_SUCCESS:
    case AUTH_ACTIONS.LOAD_USER:
      const user = action.payload.user;
      const allowedModules = getModulesFromUser(user);
      const allowedPermissions = user.permissions || []; // Extract permissions
      return {
        ...state,
        user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        allowedModules,
        allowedPermissions, // Store permissions
      };
    case AUTH_ACTIONS.LOGOUT:
    case AUTH_ACTIONS.AUTH_ERROR:
      localStorage.removeItem('token');
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        allowedModules: [],
      };
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    default:
      return state;
  }
};

const setAuthToken = (token) => {
  if (token) {
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('token', token);
  } else {
    delete axiosInstance.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
  }
};

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const {
      config,
      response: { status },
    } = error;
    const originalRequest = config;

    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      setAuthToken(null);
      toast.error('Sua sessão expirou. Por favor, faça login novamente.');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const queryClient = useQueryClient(); // Get query client instance

  // Use useFetchMe to load user data
  const { data: userData, isLoading: isUserLoading, isError: isUserError } = useFetchMe();
  const loginMutation = useLogin();
  const updateProfileMutation = useUpdateProfile();

  useEffect(() => {
    if (userData) {
      dispatch({
        type: AUTH_ACTIONS.LOAD_USER,
        payload: { user: userData.user, token: localStorage.getItem('token') }, // Pass token from localStorage
      });
    } else if (!isUserLoading && isUserError) {
      // If there's an error loading user and not just loading, it means token might be invalid
      dispatch({ type: AUTH_ACTIONS.AUTH_ERROR });
    }
  }, [userData, isUserLoading, isUserError]);

  useEffect(() => {
    // Set loading state based on react-query's loading
    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: isUserLoading });
  }, [isUserLoading]);

  const login = async (email, password) => {
    try {
      const response = await loginMutation.mutateAsync({ email, password });
      const { token, user } = response; // response is already data from loginUser
      setAuthToken(token);
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, token },
      });
      toast.success(`Bem-vindo, ${user.name}!`);
      return { success: true, user };
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.AUTH_ERROR });
      const message = error.response?.data?.message || 'Erro ao fazer login';
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = () => {
    setAuthToken(null);
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
    queryClient.removeQueries(); // Clear all react-query cache on logout
    toast.success('Logout realizado com sucesso');
  };

  const updateUser = async (userData) => {
    try {
      const response = await updateProfileMutation.mutateAsync(userData);
      dispatch({
        type: AUTH_ACTIONS.UPDATE_USER,
        payload: response.user, // response is already data from updateProfile
      });
      toast.success('Perfil atualizado com sucesso!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Erro ao atualizar perfil';
      toast.error(message);
      return { success: false, message };
    }
  };

  const value = {
    ...state,
    login,
    logout,
    updateUser,
  };

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
