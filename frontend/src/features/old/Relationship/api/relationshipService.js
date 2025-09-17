import { useQuery, useMutation, useQueryClient } from 'react-query';
import axiosInstance from '@/services/axiosInstance';
import toast from 'react-hot-toast';
import { useAuth } from '@/app/providers/contexts/AuthContext';

const getRestaurantIdFromAuth = () => {
  const { user } = useAuth();
  return user?.restaurantId;
};

const RELATIONSHIP_QUERY_KEYS = {
  customers: 'relationshipCustomers',
  whatsappSettings: 'whatsappSettings',
};

// API Functions
const fetchCustomers = async (params) => {
  const restaurantId = getRestaurantIdFromAuth();
  if (!restaurantId) throw new Error('Restaurant ID not available.');
  const { data } = await axiosInstance.get(`/customers/restaurant/${restaurantId}`, { params });
  return data;
};

const fetchWhatsappSettings = async () => {
  const restaurantId = getRestaurantIdFromAuth();
  if (!restaurantId) throw new Error('Restaurant ID not available.');
  const { data } = await axiosInstance.get(`/settings/${restaurantId}/whatsapp`);
  return data;
};

const sendManualMessage = async ({ recipientPhoneNumber, messageText }) => {
  const restaurantId = getRestaurantIdFromAuth();
  if (!restaurantId) throw new Error('Restaurant ID not available.');
  const { data } = await axiosInstance.post(`/whatsapp/send-manual`, {
    restaurant_id: restaurantId,
    recipient_phone_number: recipientPhoneNumber,
    message_text: messageText,
  });
  return data;
};

const saveAutomaticCampaigns = async ({ settings }) => {
  const restaurantId = getRestaurantIdFromAuth();
  if (!restaurantId) throw new Error('Restaurant ID not available.');
  const { data } = await axiosInstance.put(`/settings/${restaurantId}`, {
    settings: {
      whatsapp_messages: settings,
    },
  });
  return data;
};

// React Query Hooks
export const useFetchCustomers = (params) => {
  const restaurantId = getRestaurantIdFromAuth();
  return useQuery(
    [RELATIONSHIP_QUERY_KEYS.customers, restaurantId, params],
    () => fetchCustomers(params),
    {
      enabled: !!restaurantId,
    }
  );
};

export const useFetchWhatsappSettings = () => {
  const restaurantId = getRestaurantIdFromAuth();
  return useQuery(
    [RELATIONSHIP_QUERY_KEYS.whatsappSettings, restaurantId],
    () => fetchWhatsappSettings(),
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
  const restaurantId = getRestaurantIdFromAuth();
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
