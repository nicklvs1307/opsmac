import { useQuery, useMutation, useQueryClient } from 'react-query';
import axiosInstance from '@/services/axiosInstance';

const INGREDIENTS_QUERY_KEYS = {
  ingredients: 'ingredients',
};

// API Functions - Ingredients
const fetchIngredients = async () => {
  const response = await axiosInstance.get('/ingredients');
  return response.data;
};
const createIngredient = async (newIngredient) => {
  const response = await axiosInstance.post('/ingredients', newIngredient);
  return response.data;
};
const updateIngredient = async ({ id, updatedIngredient }) => {
  const response = await axiosInstance.put(`/ingredients/${id}`, updatedIngredient);
  return response.data;
};
const deleteIngredient = async (id) => {
  const response = await axiosInstance.delete(`/ingredients/${id}`);
  return response.data;
};

// React Query Hooks - Ingredients
export const useIngredients = () => {
  return useQuery(INGREDIENTS_QUERY_KEYS.ingredients, fetchIngredients);
};
export const useCreateIngredient = () => {
  const queryClient = useQueryClient();
  return useMutation(createIngredient, {
    onSuccess: () => {
      queryClient.invalidateQueries(INGREDIENTS_QUERY_KEYS.ingredients);
    },
  });
};
export const useUpdateIngredient = () => {
  const queryClient = useQueryClient();
  return useMutation(updateIngredient, {
    onSuccess: () => {
      queryClient.invalidateQueries(INGREDIENTS_QUERY_KEYS.ingredients);
    },
  });
};
export const useDeleteIngredient = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteIngredient, {
    onSuccess: () => {
      queryClient.invalidateQueries(INGREDIENTS_QUERY_KEYS.ingredients);
    },
  });
};
