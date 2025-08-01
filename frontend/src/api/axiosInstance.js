import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000'; // Fallback para desenvolvimento

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Se você usa cookies/sessões
});

export default axiosInstance;
