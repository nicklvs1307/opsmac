import { useQuery, useMutation, useQueryClient } from 'react-query';
import axiosInstance from '@/services/axiosInstance';

// Query Keys
const LABEL_QUERY_KEYS = {
  items: 'labelItems',
};

// API Functions
const fetchLabelItems = async () => {
  const response = await axiosInstance.get('/labels/items');
  return response.data;
};

const updateLabelItem = async (updatedItem) => {
  const response = await axiosInstance.patch(
    `/labels/items/${updatedItem.type}/${updatedItem.id}`,
    updatedItem
  );
  return response.data;
};

// React Query Hooks
export const useLabelItems = (options) => {
  return useQuery(LABEL_QUERY_KEYS.items, fetchLabelItems, options);
};

export const useUpdateLabelItem = () => {
  const queryClient = useQueryClient();
  return useMutation(updateLabelItem, {
    onSuccess: (data, variables) => {
      // Invalidate the list of label items to refetch fresh data
      queryClient.invalidateQueries(LABEL_QUERY_KEYS.items);
      // Optionally, update the cache directly for better UX
      queryClient.setQueryData(LABEL_QUERY_KEYS.items, (oldData) => {
        return oldData?.map((item) =>
          item.id === data.id && item.type === data.type ? data : item
        );
      });
    },
  });
};
