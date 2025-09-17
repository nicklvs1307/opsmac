import { useMutation } from 'react-query';
import axiosInstance from '@/services/axiosInstance';
import toast from 'react-hot-toast';

// Hook to login a customer
export const useLoginCustomer = () => {
  return useMutation((credentials) => axiosInstance.post('/auth/login', credentials), {
    onError: (error) => {
      toast.error(error.response?.data?.msg || 'Erro ao fazer login.');
    },
  });
};

// Hook to register a customer
export const useRegisterCustomer = () => {
  return useMutation(
    (customerData) => axiosInstance.post('/customers/public/register', customerData),
    {
      onError: (error) => {
        toast.error(
          error.response?.data?.errors[0]?.msg || error.response?.data?.msg || 'Erro ao registrar.'
        );
      },
    }
  );
};
