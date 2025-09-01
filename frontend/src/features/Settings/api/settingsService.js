import { useQuery, useMutation, useQueryClient } from 'react-query';
import axiosInstance from '@/services/axiosInstance';
import toast from 'react-hot-toast';

const SETTINGS_QUERY_KEYS = {
  apiToken: 'settingsApiToken',
  generalSettings: 'generalSettings',
  npsCriteria: 'npsCriteria',
  whatsappSettings: 'whatsappSettings',
  allRestaurants: 'allRestaurants',
};

// API Functions
const uploadLogo = async ({ restaurantId, logoFile }) => {
  const formData = new FormData();
  formData.append('logo', logoFile);
  const response = await axiosInstance.post(`/settings/${restaurantId}/logo`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

const uploadAvatar = async (avatarFile) => {
  const formData = new FormData();
  formData.append('avatar', avatarFile);
  const response = await axiosInstance.post('/settings/profile/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

const fetchApiToken = async (restaurantId) => {
  const response = await axiosInstance.get(`/settings/${restaurantId}/api-token`);
  return response.data;
};

const fetchSettings = async (restaurantId) => {
  const response = await axiosInstance.get(`/settings/${restaurantId}`);
  return response.data;
};

const fetchNpsCriteria = async (restaurantId) => {
  const response = await axiosInstance.get(`/settings/${restaurantId}/nps-criteria`);
  return response.data;
};

const updateNpsCriteria = async ({ restaurantId, nps_criteria }) => {
  await axiosInstance.put(`/settings/${restaurantId}/nps-criteria`, { nps_criteria });
};

const generateApiToken = async (restaurantId) => {
  const response = await axiosInstance.post(`/settings/${restaurantId}/api-token/generate`);
  return response.data;
};

const revokeApiToken = async (restaurantId) => {
  await axiosInstance.delete(`/settings/${restaurantId}/api-token`);
};

const updateWhatsappSettings = async ({ restaurantId, data }) => {
  await axiosInstance.put(`/settings/${restaurantId}/whatsapp`, data);
};

const updateProfileAndRestaurant = async ({ restaurantId, profileData, restaurantData }) => {
  // Assuming updateUser is handled by AuthContext, this only handles restaurant data
  if (restaurantId) {
    await axiosInstance.put(`/settings/${restaurantId}/profile`, restaurantData);
  }
};

const changePassword = async (passwordData) => {
  await axiosInstance.put('/auth/change-password', passwordData);
};

const updateGeneralSetting = async ({ restaurantId, category, setting, value }) => {
  await axiosInstance.put(`/settings/${restaurantId}`, {
    category,
    setting,
    value,
  });
};

const sendTestWhatsappMessage = async ({ restaurantId, recipient, message }) => {
  await axiosInstance.post(`/settings/${restaurantId}/whatsapp/test`, {
    recipient,
    message,
  });
};

const fetchWhatsappSettings = async (restaurantId) => {
  const response = await axiosInstance.get(`/settings/${restaurantId}/whatsapp`);
  return response.data;
};

const fetchAllRestaurants = async () => {
  const response = await axiosInstance.get('/admin/restaurants');
  return response.data;
};

// React Query Hooks
export const useUploadLogo = (options) => {
  return useMutation(uploadLogo, {
    onSuccess: (data, variables, context) => {
      toast.success('Logo atualizado com sucesso!');
      // Invalidate relevant queries if needed
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(error.response?.data?.message || 'Erro ao fazer upload do logo.');
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
};

export const useUploadAvatar = (options) => {
  return useMutation(uploadAvatar, {
    onSuccess: (data, variables, context) => {
      toast.success('Avatar atualizado com sucesso!');
      // Invalidate relevant queries if needed
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(error.response?.data?.message || 'Erro ao fazer upload do avatar.');
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
};

export const useApiToken = (restaurantId, options) => {
  return useQuery([SETTINGS_QUERY_KEYS.apiToken, restaurantId], () => fetchApiToken(restaurantId), {
    enabled: !!restaurantId,
    ...options,
  });
};

export const useGeneralSettings = (restaurantId, options) => {
  return useQuery(
    [SETTINGS_QUERY_KEYS.generalSettings, restaurantId],
    () => fetchSettings(restaurantId),
    {
      enabled: !!restaurantId,
      ...options,
    }
  );
};

export const useNpsCriteria = (restaurantId, options) => {
  return useQuery(
    [SETTINGS_QUERY_KEYS.npsCriteria, restaurantId],
    () => fetchNpsCriteria(restaurantId),
    {
      enabled: !!restaurantId,
      ...options,
    }
  );
};

export const useUpdateNpsCriteria = (options) => {
  const queryClient = useQueryClient();
  return useMutation(updateNpsCriteria, {
    onSuccess: (data, variables, context) => {
      toast.success('Critério NPS atualizado com sucesso!');
      queryClient.invalidateQueries(SETTINGS_QUERY_KEYS.npsCriteria);
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(error.response?.data?.message || 'Erro ao atualizar critério NPS.');
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
};

export const useGenerateApiToken = (options) => {
  const queryClient = useQueryClient();
  return useMutation(generateApiToken, {
    onSuccess: (data, variables, context) => {
      toast.success('Novo token de API gerado com sucesso!');
      queryClient.invalidateQueries(SETTINGS_QUERY_KEYS.apiToken);
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(error.response?.data?.message || 'Erro ao gerar token de API.');
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
};

export const useRevokeApiToken = (options) => {
  const queryClient = useQueryClient();
  return useMutation(revokeApiToken, {
    onSuccess: (data, variables, context) => {
      toast.success('Token de API revogado com sucesso!');
      queryClient.invalidateQueries(SETTINGS_QUERY_KEYS.apiToken);
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(error.response?.data?.message || 'Erro ao revogar token de API.');
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
};

export const useUpdateWhatsappSettings = (options) => {
  const queryClient = useQueryClient();
  return useMutation(updateWhatsappSettings, {
    onSuccess: (data, variables, context) => {
      toast.success('Configurações do WhatsApp atualizadas com sucesso!');
      queryClient.invalidateQueries(SETTINGS_QUERY_KEYS.whatsappSettings);
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(error.response?.data?.message || 'Erro ao atualizar configurações do WhatsApp.');
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
};

export const useUpdateProfileAndRestaurant = (options) => {
  return useMutation(updateProfileAndRestaurant, {
    onSuccess: (data, variables, context) => {
      toast.success('Perfil e informações do restaurante atualizados com sucesso!');
      // Invalidate relevant queries if needed
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(error.response?.data?.message || 'Erro ao atualizar perfil e restaurante.');
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
};

export const useChangePassword = (options) => {
  return useMutation(changePassword, {
    onSuccess: (data, variables, context) => {
      toast.success('Senha alterada com sucesso!');
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(error.response?.data?.message || 'Erro ao alterar senha.');
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
};

export const useUpdateGeneralSetting = (options) => {
  return useMutation(updateGeneralSetting, {
    onSuccess: (data, variables, context) => {
      toast.success('Configuração atualizada com sucesso!');
      // Invalidate relevant queries if needed
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(error.response?.data?.message || 'Erro ao atualizar configuração.');
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
};

export const useSendTestWhatsappMessage = (options) => {
  return useMutation(sendTestWhatsappMessage, {
    onSuccess: (data, variables, context) => {
      toast.success('Mensagem de teste enviada com sucesso!');
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(error.response?.data?.message || 'Erro ao enviar mensagem de teste.');
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
};

export const useWhatsappSettings = (restaurantId, options) => {
  return useQuery(
    [SETTINGS_QUERY_KEYS.whatsappSettings, restaurantId],
    () => fetchWhatsappSettings(restaurantId),
    {
      enabled: !!restaurantId,
      ...options,
    }
  );
};

export const useAllRestaurants = (options) => {
  return useQuery(SETTINGS_QUERY_KEYS.allRestaurants, fetchAllRestaurants, {
    ...options,
  });
};
