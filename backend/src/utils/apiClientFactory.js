import axios from "axios";
import logger from "./logger.js";

const createApiClient = (baseURL, defaultHeaders = {}) => {
  const instance = axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
      ...defaultHeaders,
    },
    timeout: 10000, // Exemplo de timeout
  });

  // Add a request interceptor
  instance.interceptors.request.use(
    (config) => {
      // Do something before request is sent
      logger.debug("Request sent:", config.url);
      return config;
    },
    (error) => {
      // Do something with request error
      return Promise.reject(error);
    },
  );

  // Add a response interceptor
  instance.interceptors.response.use(
    (response) => {
      // Any status code that lie within the range of 2xx cause this function to trigger
      return response;
    },
    (error) => {
      // Any status codes that falls outside the range of 2xx cause this function to trigger
      logger.error("API call failed:", error.response?.data || error.message);
      // You can throw a custom error here or handle specific status codes
      if (error.response && error.response.status === 401) {
        // Handle unauthorized specifically
      }
      return Promise.reject(error);
    },
  );

  return instance;
};

export default createApiClient;
