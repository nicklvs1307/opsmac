import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';

// Create context
const AuthContext = createContext();

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
};

// Action types
const AUTH_ACTIONS = {
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  LOAD_USER: 'LOAD_USER',
  AUTH_ERROR: 'AUTH_ERROR',
  SET_LOADING: 'SET_LOADING',
  UPDATE_USER: 'UPDATE_USER',
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_SUCCESS:
    case AUTH_ACTIONS.LOAD_USER:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
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

// Set auth token in axios headers
const setAuthToken = (token) => {
  if (token) {
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('token', token);
  } else {
    delete axiosInstance.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
  }
};

// Axios interceptor to handle 401 errors
    axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const { config, response: { status } } = error;
    const originalRequest = config;

    // Check if the error is a 401 and not a retry request
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // No refresh token logic implemented, so we log out the user.
      setAuthToken(null); // Clear token from headers and localStorage
      toast.error('Sua sessão expirou. Por favor, faça login novamente.');

      // Redirect to login page, preventing further failed requests.
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth Provider
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user on app start
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        setAuthToken(token);
        try {
          const res = await axiosInstance.get('/api/auth/me');
          dispatch({
            type: AUTH_ACTIONS.LOAD_USER,
            payload: {
              user: res.data.user,
              token,
            },
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

  // Login function
  const login = async (email, password) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      
      const response = await axiosInstance.post('/api/auth/login', {
        email,
        password,
      });

      const { token, user } = response.data;
      
      setAuthToken(token);
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, token },
      });

      toast.success(`Bem-vindo, ${user.name}!`);
      return { success: true };
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.AUTH_ERROR });
      const message = error.response?.data?.message || 'Erro ao fazer login';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      
      const response = await axiosInstance.post('/api/auth/register', userData);
      const { token, user } = response.data;
      
      setAuthToken(token);
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, token },
      });

      toast.success('Conta criada com sucesso!');
      return { success: true };
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.AUTH_ERROR });
      const message = error.response?.data?.message || 'Erro ao criar conta';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Logout function
  const logout = () => {
    setAuthToken(null);
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
    toast.success('Logout realizado com sucesso');
  };

  // Update user function
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

  // Change password function
  const changePassword = async (currentPassword, newPassword) => {
    try {
      await axiosInstance.put('/api/auth/change-password', {
        currentPassword,
        newPassword,
      });
      toast.success('Senha alterada com sucesso!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Erro ao alterar senha';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Forgot password function
  const forgotPassword = async (email) => {
    try {
      await axiosInstance.post('/api/auth/forgot-password', { email });
      toast.success('Email de recuperação enviado!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Erro ao enviar email';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Reset password function
  const resetPassword = async (token, password) => {
    try {
      await axiosInstance.post('/api/auth/reset-password', { token, password });
      toast.success('Senha redefinida com sucesso!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Erro ao redefinir senha';
      toast.error(message);
      return { success: false, message };
    }
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    changePassword,
    forgotPassword,
    resetPassword,
    dispatch, // Expose dispatch
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;