import { useMutation, useQueryClient, useQuery } from 'react-query'; // Added useQuery here
import axiosInstance from '@/services/axiosInstance';
import toast from 'react-hot-toast';

const QR_CODE_QUERY_KEYS = {
  qrcodes: 'qrcodes', // For invalidation after generation/deletion
  qrcodeDetails: 'qrcodeDetails', // For fetching single QR code details
  qrcodeAnalytics: 'qrcodeAnalytics', // Added for QR code analytics
};

// API Functions
const generateQRCode = async (payload) => {
  const response = await axiosInstance.post('/api/qrcode', payload);
  return response.data;
};

const downloadQRCodeImage = async (id) => {
  const response = await axiosInstance.get(`/api/qrcode/${id}/image`, {
    responseType: 'blob',
  });
  return response.data;
};

const printQRCode = async (id) => {
  await axiosInstance.post(`/api/qrcode/${id}/print`);
};

const fetchQRCodeDetails = async (id) => {
  const response = await axiosInstance.get(`/api/qrcode/${id}`);
  return response.data;
};

const fetchRestaurantQRCodes = async ({ restaurantId, page, limit, filters }) => {
  const params = { page, limit, ...filters };
  const response = await axiosInstance.get(`/api/qrcode/restaurant/${restaurantId}`, { params });
  return response.data;
};

const fetchQRCodeAnalytics = async (id) => {
  const response = await axiosInstance.get(`/api/qrcode/${id}/analytics`);
  return response.data;
};

const deleteQRCode = async (id) => {
  await axiosInstance.delete(`/qrcode/${id}`);
};

// React Query Hooks
export const useGenerateQRCode = (options) => {
  const queryClient = useQueryClient();
  return useMutation(generateQRCode, {
    onSuccess: (data, variables, context) => {
      toast.success('QR Code gerado com sucesso!');
      queryClient.invalidateQueries(QR_CODE_QUERY_KEYS.qrcodes);
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(error.response?.data?.message || 'Erro ao gerar QR Code.');
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
};

export const useDownloadQRCode = (options) => {
  return useMutation(downloadQRCodeImage, {
    onSuccess: (data, variables, context) => {
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `qrcode-${variables.name || 'qrcode'}.png`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('QR Code baixado com sucesso!');
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(error.response?.data?.message || 'Erro ao baixar QR Code.');
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
};

export const usePrintQRCode = (options) => {
  return useMutation(printQRCode, {
    onSuccess: (data, variables, context) => {
      toast.success('QR Code enviado para impressão!');
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(error.response?.data?.message || 'Erro ao imprimir QR Code.');
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
};

export const useQRCodeDetails = (id, options) => {
  return useQuery([QR_CODE_QUERY_KEYS.qrcodeDetails, id], () => fetchQRCodeDetails(id), {
    enabled: !!id,
    ...options,
  });
};

export const useRestaurantQRCodes = (restaurantId, page, limit, filters, options) => {
  return useQuery(
    [QR_CODE_QUERY_KEYS.qrcodes, restaurantId, page, limit, filters],
    () => fetchRestaurantQRCodes({ restaurantId, page, limit, filters }),
    {
      enabled: !!restaurantId,
      ...options,
    }
  );
};

export const useQRCodeAnalytics = (id, options) => {
  return useQuery(
    [QR_CODE_QUERY_KEYS.qrcodeAnalytics, id], // Changed key to qrcodeAnalytics
    () => fetchQRCodeAnalytics(id),
    {
      enabled: !!id,
      ...options,
    }
  );
};

export const useDeleteQRCode = (options) => {
  const queryClient = useQueryClient();
  return useMutation(deleteQRCode, {
    onSuccess: (data, variables, context) => {
      toast.success('QR Code excluído com sucesso!');
      queryClient.invalidateQueries(QR_CODE_QUERY_KEYS.qrcodes);
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(error.response?.data?.message || 'Erro ao excluir QR Code.');
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
};
