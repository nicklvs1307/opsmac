import axios from 'axios';
import toast from 'react-hot-toast'; // Keep toast for now, might be used elsewhere or for specific cases
import { handleError } from '@/utils/errorHandler'; // Import the new error handler

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

// Interceptor to add the token to every request
axiosInstance.interceptors.request.use(
  (config) => {
    const currentToken = localStorage.getItem('token');
    if (currentToken && !config.headers.Authorization) { // Only set if not already present
      config.headers.Authorization = `Bearer ${currentToken}`;
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
    handleError(error); // Use the centralized error handler
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