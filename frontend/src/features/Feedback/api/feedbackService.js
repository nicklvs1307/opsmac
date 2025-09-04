import { useQuery, useMutation, useQueryClient } from 'react-query';
import axiosInstance from '@/services/axiosInstance';
import toast from 'react-hot-toast';

//================================================================================================
// FEEDBACK
//================================================================================================

// Hook to fetch a list of feedbacks with filters
export const useGetFeedbacks = (restaurantId, filters, page) => {
  return useQuery(
    ['feedbacks', restaurantId, filters, page],
    async () => {
      const params = {
        page,
        limit: 10,
        ...filters,
      };
      const { data } = await axiosInstance.get(`/feedback/restaurant/${restaurantId}`, {
        params,
      });
      return data;
    },
    {
      enabled: !!restaurantId, // Only run the query if restaurantId is available
      keepPreviousData: true, // Useful for pagination
    }
  );
};

// Hook to fetch a single feedback by ID
export const useGetFeedbackById = (feedbackId) => {
  return useQuery(
    ['feedback', feedbackId],
    async () => {
      const { data } = await axiosInstance.get(`/feedback/${feedbackId}`);
      return data;
    },
    {
      enabled: !!feedbackId, // Only run the query if feedbackId is available
    }
  );
};

// Hook to create a new feedback
export const useCreateFeedback = () => {
  const queryClient = useQueryClient();
  return useMutation((newFeedback) => axiosInstance.post('/feedback', newFeedback), {
    onSuccess: () => {
      queryClient.invalidateQueries('feedbacks');
      toast.success('Feedback criado com sucesso!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Erro ao criar feedback.');
    },
  });
};

// Hook to reply to a feedback
export const useReplyFeedback = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ feedbackId, replyText }) =>
      axiosInstance.post(`/feedback/${feedbackId}/reply`, { response: replyText }),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries('feedbacks');
        queryClient.invalidateQueries(['feedback', variables.feedbackId]);
        toast.success('Resposta enviada com sucesso!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Erro ao enviar resposta.');
      },
    }
  );
};

// Hook to delete a feedback
export const useDeleteFeedback = () => {
  const queryClient = useQueryClient();
  return useMutation((feedbackId) => axiosInstance.delete(`/feedback/${feedbackId}`), {
    onSuccess: () => {
      queryClient.invalidateQueries('feedbacks');
      toast.success('Feedback excluído com sucesso!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Erro ao excluir feedback.');
    },
  });
};

//================================================================================================
// PUBLIC FEEDBACK (via QR Code)
//================================================================================================

// Hook to fetch public QR code details
export const useGetPublicQRCode = (qrId) => {
  return useQuery(
    ['publicQRCode', qrId],
    async () => {
      const { data } = await axiosInstance.get(`/qr-codes/public/${qrId}`);
      return data;
    },
    {
      enabled: !!qrId,
    }
  );
};

// Hook to track a QR code scan
export const useScanQRCode = () => {
  return useMutation((qrId) => axiosInstance.post(`/qr-codes/${qrId}/scan`));
};

// Hook to create a new public feedback
export const useCreatePublicFeedback = () => {
  return useMutation((publicFeedback) => axiosInstance.post('/feedback/public', publicFeedback), {
    onSuccess: () => {
      // No need to invalidate queries here as it's a public action
      // Success is handled in the component with redirection
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Erro ao enviar feedback.');
    },
  });
};

//================================================================================================
// RELATED DATA
//================================================================================================

// Hook to fetch customers (for autocomplete in NewFeedback)
export const useGetCustomersForFeedback = () => {
  return useQuery(
    'customersForFeedback',
    async () => {
      const { data } = await axiosInstance.get('/customers');
      return data.customers || [];
    },
    {
      staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    }
  );
};

// Hook to fetch QR Codes (for autocomplete in NewFeedback)
export const useGetQRCodesForFeedback = (restaurantId) => {
  return useQuery(
    ['qrCodesForFeedback', restaurantId],
    async () => {
      const { data } = await axiosInstance.get(`/qrcode/restaurant/${restaurantId}`);
      return data.qrcodes || [];
    },
    {
      enabled: !!restaurantId,
      staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    }
  );
};
