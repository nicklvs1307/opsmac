import axios from 'axios';
import toast from 'react-hot-toast';

const axiosInstance = axios.create({
  baseURL: (process.env.REACT_APP_API_URL || 'http://localhost:5000'),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Initialize Authorization header from localStorage on app start
const token = localStorage.getItem('token');
if (token) {
  axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Interceptor to add the token to every request (redundant if defaults are set, but good as a fallback)
axiosInstance.interceptors.request.use(
  (config) => {
    // This part is now less critical if defaults are set correctly on load,
    // but it ensures the header is present even if defaults were somehow missed or overridden.
    if (!config.headers.Authorization) {
      // Only set if not already present
      const currentToken = localStorage.getItem('token');
      if (currentToken) {
        config.headers.Authorization = `Bearer ${currentToken}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor for handling responses
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 403) {
      toast.error('Você não tem permissão para acessar este recurso.');
    }
    return Promise.reject(error);
  }
);

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('token');
    delete axiosInstance.defaults.headers.common['Authorization'];
  }
};

export default axiosInstance;
