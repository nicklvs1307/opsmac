import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000'; // Fallback para desenvolvimento

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Se você usa cookies/sessões
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Ou de onde você armazena seu token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
