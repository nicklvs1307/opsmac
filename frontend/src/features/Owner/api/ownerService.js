import { useQuery, useMutation, useQueryClient } from 'react-query';
import axiosInstance from '@/shared/lib/axiosInstance';
import toast from 'react-hot-toast';

//================================================================================================
// ROLES
//================================================================================================

// Hook to fetch roles
export const useGetRoles = () => {
  return useQuery('roles', async () => {
    const { data } = await axiosInstance.get(`/api/permissions/my-restaurant/roles`);
    return data;
  });
};

// Hook to delete a role
export const useDeleteRole = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (roleId) => axiosInstance.delete(`/api/permissions/my-restaurant/roles/${roleId}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('roles');
        toast.success('Função deletada com sucesso!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Erro ao deletar função.');
      },
    }
  );
};
