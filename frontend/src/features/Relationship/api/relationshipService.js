import { useQuery, useMutation, useQueryClient } from 'react-query';
import axiosInstance from '@/services/axiosInstance';
import toast from 'react-hot-toast';

const RELATIONSHIP_QUERY_KEYS = {
  customers: 'relationshipCustomers',
  whatsappSettings: 'whatsappSettings',
};

// API Functions
const fetchCustomers = async (restaurantId) => {
  const { data } = await axiosInstance.get(`/customers/restaurant/${restaurantId}`);
  return data;
};

const fetchWhatsappSettings = async (restaurantId) => {
  const { data } = await axiosInstance.get(`/settings/${restaurantId}/whatsapp`);
  return data;
};

const sendManualMessage = async ({ restaurantId, recipientPhoneNumber, messageText }) => {
  const { data } = await axiosInstance.post(`/whatsapp/send-manual`, {
    restaurant_id: restaurantId,
    recipient_phone_number: recipientPhoneNumber,
    message_text: messageText,
  });
  return data;
};

const saveAutomaticCampaigns = async ({ restaurantId, settings }) => {
  const { data } = await axiosInstance.put(`/settings/${restaurantId}`, {
    settings: {
      whatsapp_messages: settings,
    },
  });
  return data;
};

// React Query Hooks
export const useFetchCustomers = (restaurantId) => {
  return useQuery(
    [RELATIONSHIP_QUERY_KEYS.customers, restaurantId],
    () => fetchCustomers(restaurantId),
    {
      enabled: !!restaurantId,
    }
  );
};

export const useFetchWhatsappSettings = (restaurantId) => {
  return useQuery(
    [RELATIONSHIP_QUERY_KEYS.whatsappSettings, restaurantId],
    () => fetchWhatsappSettings(restaurantId),
    {
      enabled: !!restaurantId,
    }
  );
};

export const useSendManualMessage = () => {
  return useMutation(sendManualMessage, {
    onSuccess: () => {
      toast.success('Mensagem manual enviada com sucesso!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Erro ao enviar mensagem manual.');
    },
  });
};

export const useSaveAutomaticCampaigns = () => {
  const queryClient = useQueryClient();
  return useMutation(saveAutomaticCampaigns, {
    onSuccess: () => {
      queryClient.invalidateQueries(RELATIONSHIP_QUERY_KEYS.whatsappSettings); // Invalidate settings to refetch
      toast.success('Campanhas automáticas salvas com sucesso!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Erro ao salvar campanhas automáticas.');
    },
  });
};
