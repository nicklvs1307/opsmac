import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axiosInstance from '@/services/axiosInstance';
import toast from 'react-hot-toast';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
  allowedModules: [], // Módulos permitidos para o usuário
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
  if (user?.restaurant?.modules) {
    return user.restaurant.modules.map((m) => m.name);
  }
  if (user?.restaurants?.[0]?.modules) {
    return user.restaurants[0].modules.map((m) => m.name);
  }
  return [];
};

const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_SUCCESS:
    case AUTH_ACTIONS.LOAD_USER:
      const user = action.payload.user;
      const allowedModules = getModulesFromUser(user);
      return {
        ...state,
        user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        allowedModules,
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

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        setAuthToken(token);
        try {
          const res = await axiosInstance.get('/api/auth/me');
          dispatch({
            type: AUTH_ACTIONS.LOAD_USER,
            payload: { user: res.data.user, token },
          });
        } catch (error) {
          console.error('Error loading user:', error);
          dispatch({ type: AUTH_ACTIONS.AUTH_ERROR });
        }
      } else {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    };

    loadUser();
  }, []);

  const login = async (email, password) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      const response = await axiosInstance.post('/api/auth/login', { email, password });
      const { token, user } = response.data;
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
    toast.success('Logout realizado com sucesso');
  };

  const updateUser = async (userData) => {
    try {
      const response = await axiosInstance.put('/api/auth/profile', userData);
      dispatch({
        type: AUTH_ACTIONS.UPDATE_USER,
        payload: response.data.user,
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
