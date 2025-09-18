import { useMutation, useQuery } from 'react-query';
import axiosInstance from '@/services/axiosInstance';

export const useGetPublicQRCode = (qrId) => {
  return useQuery(
    ['publicQRCode', qrId],
    async () => {
      const { data } = await axiosInstance.get(`/qrcode/${qrId}`);
      return data;
    },
    {
      enabled: !!qrId,
    }
  );
};

export const useCreatePublicFeedback = () => {
  return useMutation((feedbackData) =>
    axiosInstance.post('/public/feedback', feedbackData)
  );
};
