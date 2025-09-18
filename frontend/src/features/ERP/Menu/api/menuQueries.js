import { useQuery, useMutation, useQueryClient } from 'react-query';
import axiosInstance from '@/services/axiosInstance';
import { useAuth } from '@/app/providers/contexts/AuthContext';

const MENU_QUERY_KEYS = {
  menu: 'menu',
  categories: 'menuCategories',
  products: 'menuProducts',
  addons: 'menuAddons',
};

// API Functions - Generic Menu
const fetchMenuData = async ({ key, id }) => {
  const response = await axiosInstance.get(`/${key}?restaurant_id=${id}`);
  return response.data;
};
const createMenuData = async ({ key, data }) => {
  const response = await axiosInstance.post(`/${key}`, data);
  return response.data;
};
const updateMenuData = async ({ key, id, data }) => {
  const response = await axiosInstance.put(`/${key}/${id}`, data);
  return response.data;
};
const deleteMenuData = async ({ key, id }) => {
  const response = await axiosInstance.delete(`/${key}/${id}`);
  return response.data;
};

// API Functions - Categories
const fetchCategories = async (restaurantId) => {
  const response = await axiosInstance.get(`/categories?restaurant_id=${restaurantId}`);
  return response.data;
};
const createCategory = async (newCategory) => {
  const response = await axiosInstance.post('/categories', newCategory);
  return response.data;
};
const updateCategory = async ({ id, fields }) => {
  const response = await axiosInstance.put(`/categories/${id}`, fields);
  return response.data;
};
const deleteCategory = async (categoryId) => {
  const response = await axiosInstance.delete(`/categories/${categoryId}`);
  return response.data;
};
const toggleCategoryStatus = async (categoryId) => {
  const response = await axiosInstance.patch(`/categories/${categoryId}/toggle-status`);
  return response.data;
};

// API Functions - Products
const fetchProducts = async (restaurantId) => {
  const response = await axiosInstance.get(`/products?restaurant_id=${restaurantId}`);
  return response.data;
};
const createProduct = async (newProduct) => {
  const response = await axiosInstance.post('/products', newProduct);
  return response.data;
};
const updateProduct = async ({ id, fields }) => {
  const response = await axiosInstance.put(`/products/${id}`, fields);
  return response.data;
};
const deleteProduct = async (productId) => {
  const response = await axiosInstance.delete(`/products/${productId}`);
  return response.data;
};
const toggleProductStatus = async (productId) => {
  const response = await axiosInstance.patch(`/products/${productId}/toggle-status`);
  return response.data;
};

// API Functions - Addons
const fetchAddons = async (restaurantId) => {
  const response = await axiosInstance.get(`/addons?restaurant_id=${restaurantId}`);
  return response.data;
};
const createAddon = async (newAddon) => {
  const response = await axiosInstance.post('/addons', newAddon);
  return response.data;
};
const updateAddon = async ({ id, fields }) => {
  const response = await axiosInstance.put(`/addons/${id}`, fields);
  return response.data;
};
const deleteAddon = async (addonId) => {
  const response = await axiosInstance.delete(`/addons/${addonId}`);
  return response.data;
};
const toggleAddonStatus = async (addonId) => {
  const response = await axiosInstance.patch(`/addons/${addonId}/toggle-status`);
  return response.data;
};


// React Query Hooks - Generic Menu
export const useMenuData = (key, id) => {
  return useQuery([MENU_QUERY_KEYS.menu, key, id], () => fetchMenuData({ key, id }), {
    enabled: !!key && !!id,
  });
};
export const useCreateMenuData = () => {
  const queryClient = useQueryClient();
  return useMutation(createMenuData, {
    onSuccess: () => {
      queryClient.invalidateQueries(MENU_QUERY_KEYS.menu);
    },
  });
};
export const useUpdateMenuData = () => {
  const queryClient = useQueryClient();
  return useMutation(updateMenuData, {
    onSuccess: () => {
      queryClient.invalidateQueries(MENU_QUERY_KEYS.menu);
    },
  });
};
export const useDeleteMenuData = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteMenuData, {
    onSuccess: () => {
      queryClient.invalidateQueries(MENU_QUERY_KEYS.menu);
    },
  });
};

// React Query Hooks - Categories
export const useCategories = (restaurantId) => {
  const { user } = useAuth();
  return useQuery([MENU_QUERY_KEYS.categories, restaurantId], () => fetchCategories(restaurantId), {
    enabled: !!restaurantId && !!user?.token,
  });
};
export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation(createCategory, {
    onSuccess: () => {
      queryClient.invalidateQueries(MENU_QUERY_KEYS.categories);
    },
  });
};
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation(updateCategory, {
    onSuccess: () => {
      queryClient.invalidateQueries(MENU_QUERY_KEYS.categories);
    },
  });
};
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteCategory, {
    onSuccess: () => {
      queryClient.invalidateQueries(MENU_QUERY_KEYS.categories);
    },
  });
};
export const useToggleCategoryStatus = () => {
  const queryClient = useQueryClient();
  return useMutation(toggleCategoryStatus, {
    onSuccess: () => {
      queryClient.invalidateQueries(MENU_QUERY_KEYS.categories);
    },
  });
};

// React Query Hooks - Products
export const useProducts = (restaurantId) => {
  const { user } = useAuth();
  return useQuery([MENU_QUERY_KEYS.products, restaurantId], () => fetchProducts(restaurantId), {
    enabled: !!restaurantId && !!user?.token,
  });
};
export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation(createProduct, {
    onSuccess: () => {
      queryClient.invalidateQueries(MENU_QUERY_KEYS.products);
    },
  });
};
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation(updateProduct, {
    onSuccess: () => {
      queryClient.invalidateQueries(MENU_QUERY_KEYS.products);
    },
  });
};
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteProduct, {
    onSuccess: () => {
      queryClient.invalidateQueries(MENU_QUERY_KEYS.products);
    },
  });
};
export const useToggleProductStatus = () => {
  const queryClient = useQueryClient();
  return useMutation(toggleProductStatus, {
    onSuccess: () => {
      queryClient.invalidateQueries(MENU_QUERY_KEYS.products);
    },
  });
};

// React Query Hooks - Addons
export const useAddons = (restaurantId) => {
  const { user } = useAuth();
  return useQuery([MENU_QUERY_KEYS.addons, restaurantId], () => fetchAddons(restaurantId), {
    enabled: !!restaurantId && !!user?.token,
  });
};
export const useCreateAddon = () => {
  const queryClient = useQueryClient();
  return useMutation(createAddon, {
    onSuccess: () => {
      queryClient.invalidateQueries(MENU_QUERY_KEYS.addons);
    },
  });
};
export const useUpdateAddon = () => {
  const queryClient = useQueryClient();
  return useMutation(updateAddon, {
    onSuccess: () => {
      queryClient.invalidateQueries(MENU_QUERY_KEYS.addons);
    },
  });
};
export const useDeleteAddon = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteAddon, {
    onSuccess: () => {
      queryClient.invalidateQueries(MENU_QUERY_KEYS.addons);
    },
  });
};
export const useToggleAddonStatus = () => {
  const queryClient = useQueryClient();
  return useMutation(toggleAddonStatus, {
    onSuccess: () => {
      queryClient.invalidateQueries(MENU_QUERY_KEYS.addons);
    },
  });
};
