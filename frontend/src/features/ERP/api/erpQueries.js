import { useQuery, useMutation, useQueryClient } from 'react-query';
import axiosInstance from '@/services/axiosInstance';

// Query Keys
const ERP_QUERY_KEYS = {
  financialCategories: 'erpFinancialCategories',
  financialTransactions: 'erpFinancialTransactions',
  ingredients: 'erpIngredients',
  menu: 'erpMenu',
  orders: 'erpOrders',
  paymentMethods: 'erpPaymentMethods',
  pdv: 'erpPdv',
  purchases: 'erpPurchases',
  stockDashboard: 'erpStockDashboard',
  stockMovements: 'erpStockMovements',
  stockProducts: 'erpStockProducts',
  suppliers: 'erpSuppliers',
  tables: 'erpTables',
  restaurant: 'erpRestaurant',
  categories: 'erpCategories',
  cashRegisterSession: 'erpCashRegisterSession',
  cashRegisterOrders: 'erpCashRegisterOrders',
  products: 'erpProducts',
  stockHistory: 'erpStockHistory',
};

// API Functions - Financial Categories
const fetchFinancialCategories = async (restaurantId) => {
  const response = await axiosInstance.get(
    `/financial/categories?restaurant_id=${restaurantId}`
  );
  return response.data;
};
const createFinancialCategory = async (newCategory) => {
  const response = await axiosInstance.post('/financial/categories', newCategory);
  return response.data;
};
const updateFinancialCategory = async ({ id, fields }) => {
  const response = await axiosInstance.put(`/financial/categories/${id}`, fields);
  return response.data;
};
const deleteFinancialCategory = async (categoryId) => {
  const response = await axiosInstance.delete(`/financial/categories/${categoryId}`);
  return response.data;
};

// API Functions - Financial Transactions
const fetchFinancialTransactions = async (filters) => {
  const response = await axiosInstance.get(
    `/financial/transactions?restaurant_id=${filters.restaurantId}`
  );
  return response.data;
};
const createFinancialTransaction = async (newTransaction) => {
  const response = await axiosInstance.post('/financial/transactions', newTransaction);
  return response.data;
};
const updateFinancialTransaction = async ({ id, fields }) => {
  const response = await axiosInstance.put(`/financial/transactions/${id}`, fields);
  return response.data;
};
const deleteFinancialTransaction = async (transactionId) => {
  const response = await axiosInstance.delete(`/financial/transactions/${transactionId}`);
  return response.data;
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

// API Functions - Menu (generic key-based)
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

// API Functions - Orders
const fetchOrders = async () => {
  const response = await axiosInstance.get('/orders');
  return response.data;
};
const updateOrderStatus = async ({ orderId, status }) => {
  const response = await axiosInstance.put(`/orders/${orderId}/status`, { status });
  return response.data;
};

// API Functions - Payment Methods
const fetchPaymentMethods = async (restaurantId) => {
  const response = await axiosInstance.get(
    `/financial/payment-methods?restaurant_id=${restaurantId}`
  );
  return response.data;
};
const createPaymentMethod = async (newMethod) => {
  const response = await axiosInstance.post('/financial/payment-methods', newMethod);
  return response.data;
};
const updatePaymentMethod = async ({ id, fields }) => {
  const response = await axiosInstance.put(`/financial/payment-methods/${id}`, fields);
  return response.data;
};
const deletePaymentMethod = async (id) => {
  const response = await axiosInstance.delete(`/financial/payment-methods/${id}`);
  return response.data;
};

// API Functions - PDV
const fetchPdvOrders = async (filterStatus) => {
  const response = await axiosInstance.get(
    `/orders${filterStatus ? `?status=${filterStatus}` : ''}`
  );
  return response.data;
};
const fetchRestaurantDetails = async (restaurantId) => {
  const response = await axiosInstance.get(`/restaurant/${restaurantId}`);
  return response.data;
};
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
const updateRestaurantStatus = async ({ restaurantId, is_open }) => {
  const response = await axiosInstance.put(`/restaurant/${restaurantId}/status/open`, {
    is_open,
  });
  return response.data;
};
const updatePosStatus = async ({ restaurantId, pos_status }) => {
  const response = await axiosInstance.put(`/restaurant/${restaurantId}/pos-status`, {
    pos_status,
  });
  return response.data;
};
const createPublicOrder = async (orderData) => {
  const response = await axiosInstance.post('/public/orders', orderData);
  return response.data;
};
const createRestaurantOrder = async ({ restaurantId, orderData }) => {
  const response = await axiosInstance.post(`/restaurant/${restaurantId}/orders`, orderData);
  return response.data;
};
const fetchRestaurantTables = async (restaurantId) => {
  const response = await axiosInstance.get(`/restaurant/${restaurantId}/tables`);
  return response.data;
};
const fetchCustomersBySearch = async ({ restaurantId, searchTerm }) => {
  const response = await axiosInstance.get(
    `/customers?restaurant_id=${restaurantId}&search=${searchTerm}`
  );
  return response.data;
};
const fetchCurrentCashRegisterSession = async ({ restaurantId, userId }) => {
  const response = await axiosInstance.get(
    `/cash-register/current-session?restaurant_id=${restaurantId}&user_id=${userId}`
  );
  return response.data;
};
const fetchCashRegisterOrders = async (sessionId) => {
  const response = await axiosInstance.get(
    `/cash-register/cash-orders?session_id=${sessionId}`
  );
  return response.data;
};
const openCashRegister = async (sessionData) => {
  const response = await axiosInstance.post('/cash-register/open', sessionData);
  return response.data;
};
const recordWithdrawal = async (data) => {
  const response = await axiosInstance.post('/cash-register/withdrawal', data);
  return response.data;
};
const recordReinforcement = async (data) => {
  const response = await axiosInstance.post('/cash-register/reinforcement', data);
  return response.data;
};

// API Functions - Purchases
const fetchSuppliers = async (restaurantId) => {
  const response = await axiosInstance.get(`/suppliers?restaurant_id=${restaurantId}`);
  return response.data;
};
const moveStock = async (data) => {
  const response = await axiosInstance.post('/stock/move', data);
  return response.data;
};

// API Functions - Stock Dashboard
const fetchStockDashboard = async (restaurantId) => {
  const response = await axiosInstance.get(`/stock/dashboard?restaurant_id=${restaurantId}`);
  return response.data;
};

// API Functions - Stock Movements
const fetchStockMovements = async () => {
  const response = await axiosInstance.get('/stock');
  return response.data;
};
const fetchStockHistory = async (productId) => {
  const response = await axiosInstance.get(`/stock/history/${productId}`);
  return response.data;
};

// API Functions - Stock Products
const fetchStockProducts = async (restaurantId) => {
  const response = await axiosInstance.get(`/stock?restaurant_id=${restaurantId}`);
  return response.data;
};

// API Functions - Suppliers
const createSupplier = async (newSupplier) => {
  const response = await axiosInstance.post('/suppliers', newSupplier);
  return response.data;
};
const updateSupplier = async ({ id, updatedSupplier }) => {
  const response = await axiosInstance.put(`/suppliers/${id}`, updatedSupplier);
  return response.data;
};
const deleteSupplier = async (id) => {
  const response = await axiosInstance.delete(`/suppliers/${id}`);
  return response.data;
};

// API Functions - Tables
const fetchTables = async () => {
  const response = await axiosInstance.get('/tables');
  return response.data;
};
const createTable = async (table) => {
  const response = await axiosInstance.post('/tables', table);
  return response.data;
};
const updateTable = async ({ id, table }) => {
  const response = await axiosInstance.put(`/tables/${id}`, table);
  return response.data;
};
const deleteTable = async (id) => {
  const response = await axiosInstance.delete(`/tables/${id}`);
  return response.data;
};
const generateQrCode = async (id) => {
  const response = await axiosInstance.post(`/tables/${id}/generate-qr`);
  return response.data;
};

// React Query Hooks - Financial Categories
export const useFinancialCategories = (restaurantId) => {
  return useQuery(
    [ERP_QUERY_KEYS.financialCategories, restaurantId],
    () => fetchFinancialCategories(restaurantId),
    {
      enabled: !!restaurantId,
    }
  );
};
export const useCreateFinancialCategory = () => {
  const queryClient = useQueryClient();
  return useMutation(createFinancialCategory, {
    onSuccess: () => {
      queryClient.invalidateQueries(ERP_QUERY_KEYS.financialCategories);
    },
  });
};
export const useUpdateFinancialCategory = () => {
  const queryClient = useQueryClient();
  return useMutation(updateFinancialCategory, {
    onSuccess: () => {
      queryClient.invalidateQueries(ERP_QUERY_KEYS.financialCategories);
    },
  });
};
export const useDeleteFinancialCategory = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteFinancialCategory, {
    onSuccess: () => {
      queryClient.invalidateQueries(ERP_QUERY_KEYS.financialCategories);
    },
  });
};

// React Query Hooks - Financial Transactions
export const useFinancialTransactions = (filters) => {
  return useQuery(
    [ERP_QUERY_KEYS.financialTransactions, filters],
    () => fetchFinancialTransactions(filters),
    {
      enabled: !!filters.restaurantId,
    }
  );
};
export const useCreateFinancialTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation(createFinancialTransaction, {
    onSuccess: () => {
      queryClient.invalidateQueries(ERP_QUERY_KEYS.financialTransactions);
    },
  });
};
export const useUpdateFinancialTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation(updateFinancialTransaction, {
    onSuccess: () => {
      queryClient.invalidateQueries(ERP_QUERY_KEYS.financialTransactions);
    },
  });
};
export const useDeleteFinancialTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteFinancialTransaction, {
    onSuccess: () => {
      queryClient.invalidateQueries(ERP_QUERY_KEYS.financialTransactions);
    },
  });
};

// React Query Hooks - Ingredients
export const useIngredients = () => {
  return useQuery(ERP_QUERY_KEYS.ingredients, fetchIngredients);
};
export const useCreateIngredient = () => {
  const queryClient = useQueryClient();
  return useMutation(createIngredient, {
    onSuccess: () => {
      queryClient.invalidateQueries(ERP_QUERY_KEYS.ingredients);
    },
  });
};
export const useUpdateIngredient = () => {
  const queryClient = useQueryClient();
  return useMutation(updateIngredient, {
    onSuccess: () => {
      queryClient.invalidateQueries(ERP_QUERY_KEYS.ingredients);
    },
  });
};
export const useDeleteIngredient = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteIngredient, {
    onSuccess: () => {
      queryClient.invalidateQueries(ERP_QUERY_KEYS.ingredients);
    },
  });
};

// React Query Hooks - Menu
export const useMenuData = (key, id) => {
  return useQuery([ERP_QUERY_KEYS.menu, key, id], () => fetchMenuData({ key, id }), {
    enabled: !!key && !!id,
  });
};
export const useCreateMenuData = () => {
  const queryClient = useQueryClient();
  return useMutation(createMenuData, {
    onSuccess: () => {
      queryClient.invalidateQueries(ERP_QUERY_KEYS.menu);
    },
  });
};
export const useUpdateMenuData = () => {
  const queryClient = useQueryClient();
  return useMutation(updateMenuData, {
    onSuccess: () => {
      queryClient.invalidateQueries(ERP_QUERY_KEYS.menu);
    },
  });
};
export const useDeleteMenuData = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteMenuData, {
    onSuccess: () => {
      queryClient.invalidateQueries(ERP_QUERY_KEYS.menu);
    },
  });
};

// React Query Hooks - Orders
export const useOrders = () => {
  return useQuery(ERP_QUERY_KEYS.orders, fetchOrders);
};
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation(updateOrderStatus, {
    onSuccess: () => {
      queryClient.invalidateQueries(ERP_QUERY_KEYS.orders);
    },
  });
};

// React Query Hooks - Payment Methods
export const usePaymentMethods = (restaurantId) => {
  return useQuery(
    [ERP_QUERY_KEYS.paymentMethods, restaurantId],
    () => fetchPaymentMethods(restaurantId),
    {
      enabled: !!restaurantId,
    }
  );
};
export const useCreatePaymentMethod = () => {
  const queryClient = useQueryClient();
  return useMutation(createPaymentMethod, {
    onSuccess: () => {
      queryClient.invalidateQueries(ERP_QUERY_KEYS.paymentMethods);
    },
  });
};
export const useUpdatePaymentMethod = () => {
  const queryClient = useQueryClient();
  return useMutation(updatePaymentMethod, {
    onSuccess: () => {
      queryClient.invalidateQueries(ERP_QUERY_KEYS.paymentMethods);
    },
  });
};
export const useDeletePaymentMethod = () => {
  const queryClient = useQueryClient();
  return useMutation(deletePaymentMethod, {
    onSuccess: () => {
      queryClient.invalidateQueries(ERP_QUERY_KEYS.paymentMethods);
    },
  });
};

// React Query Hooks - PDV
export const usePdvOrders = (filterStatus) => {
  return useQuery([ERP_QUERY_KEYS.pdv, filterStatus], () => fetchPdvOrders(filterStatus));
};
export const useRestaurantDetails = (restaurantId) => {
  return useQuery(
    [ERP_QUERY_KEYS.restaurant, restaurantId],
    () => fetchRestaurantDetails(restaurantId),
    {
      enabled: !!restaurantId,
    }
  );
};
export const useCategories = (restaurantId) => {
  return useQuery([ERP_QUERY_KEYS.categories, restaurantId], () => fetchCategories(restaurantId), {
    enabled: !!restaurantId,
  });
};
export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation(createCategory, {
    onSuccess: () => {
      queryClient.invalidateQueries(ERP_QUERY_KEYS.categories);
    },
  });
};
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation(updateCategory, {
    onSuccess: () => {
      queryClient.invalidateQueries(ERP_QUERY_KEYS.categories);
    },
  });
};
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteCategory, {
    onSuccess: () => {
      queryClient.invalidateQueries(ERP_QUERY_KEYS.categories);
    },
  });
};
export const useToggleCategoryStatus = () => {
  const queryClient = useQueryClient();
  return useMutation(toggleCategoryStatus, {
    onSuccess: () => {
      queryClient.invalidateQueries(ERP_QUERY_KEYS.categories);
    },
  });
};
export const useUpdateRestaurantStatus = () => {
  const queryClient = useQueryClient();
  return useMutation(updateRestaurantStatus, {
    onSuccess: () => {
      queryClient.invalidateQueries(ERP_QUERY_KEYS.restaurant);
    },
  });
};
export const useUpdatePosStatus = () => {
  const queryClient = useQueryClient();
  return useMutation(updatePosStatus, {
    onSuccess: () => {
      queryClient.invalidateQueries(ERP_QUERY_KEYS.restaurant);
    },
  });
};
export const useCreatePublicOrder = () => {
  const queryClient = useQueryClient();
  return useMutation(createPublicOrder, {
    onSuccess: () => {
      queryClient.invalidateQueries(ERP_QUERY_KEYS.pdv);
    },
  });
};
export const useCreateRestaurantOrder = () => {
  const queryClient = useQueryClient();
  return useMutation(createRestaurantOrder, {
    onSuccess: () => {
      queryClient.invalidateQueries(ERP_QUERY_KEYS.pdv);
    },
  });
};
export const useRestaurantTables = (restaurantId) => {
  return useQuery(
    [ERP_QUERY_KEYS.tables, restaurantId],
    () => fetchRestaurantTables(restaurantId),
    {
      enabled: !!restaurantId,
    }
  );
};
export const useCustomersBySearch = (restaurantId, searchTerm) => {
  return useQuery(
    [ERP_QUERY_KEYS.customers, restaurantId, searchTerm],
    () => fetchCustomersBySearch({ restaurantId, searchTerm }),
    {
      enabled: !!restaurantId && !!searchTerm,
    }
  );
};
export const useCurrentCashRegisterSession = (restaurantId, userId) => {
  return useQuery(
    [ERP_QUERY_KEYS.cashRegisterSession, restaurantId, userId],
    () => fetchCurrentCashRegisterSession({ restaurantId, userId }),
    {
      enabled: !!restaurantId && !!userId,
    }
  );
};
export const useCashRegisterOrders = (sessionId) => {
  return useQuery(
    [ERP_QUERY_KEYS.cashRegisterOrders, sessionId],
    () => fetchCashRegisterOrders(sessionId),
    {
      enabled: !!sessionId,
    }
  );
};
export const useOpenCashRegister = () => {
  const queryClient = useQueryClient();
  return useMutation(openCashRegister, {
    onSuccess: () => {
      queryClient.invalidateQueries(ERP_QUERY_KEYS.cashRegisterSession);
    },
  });
};
export const useRecordWithdrawal = () => {
  const queryClient = useQueryClient();
  return useMutation(recordWithdrawal, {
    onSuccess: () => {
      queryClient.invalidateQueries(ERP_QUERY_KEYS.cashRegisterSession);
    },
  });
};
export const useRecordReinforcement = () => {
  const queryClient = useQueryClient();
  return useMutation(recordReinforcement, {
    onSuccess: () => {
      queryClient.invalidateQueries(ERP_QUERY_KEYS.cashRegisterSession);
    },
  });
};

// React Query Hooks - Purchases
export const useProducts = (restaurantId) => {
  return useQuery([ERP_QUERY_KEYS.products, restaurantId], () => fetchProducts(restaurantId), {
    enabled: !!restaurantId,
  });
};
export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation(createProduct, {
    onSuccess: () => {
      queryClient.invalidateQueries(ERP_QUERY_KEYS.products);
    },
  });
};
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation(updateProduct, {
    onSuccess: () => {
      queryClient.invalidateQueries(ERP_QUERY_KEYS.products);
    },
  });
};
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteProduct, {
    onSuccess: () => {
      queryClient.invalidateQueries(ERP_QUERY_KEYS.products);
    },
  });
};
export const useToggleProductStatus = () => {
  const queryClient = useQueryClient();
  return useMutation(toggleProductStatus, {
    onSuccess: () => {
      queryClient.invalidateQueries(ERP_QUERY_KEYS.products);
    },
  });
};

// React Query Hooks - Addons
export const useAddons = (restaurantId) => {
  return useQuery([ERP_QUERY_KEYS.addons, restaurantId], () => fetchAddons(restaurantId), {
    enabled: !!restaurantId,
  });
};
export const useCreateAddon = () => {
  const queryClient = useQueryClient();
  return useMutation(createAddon, {
    onSuccess: () => {
      queryClient.invalidateQueries(ERP_QUERY_KEYS.addons);
    },
  });
};
export const useUpdateAddon = () => {
  const queryClient = useQueryClient();
  return useMutation(updateAddon, {
    onSuccess: () => {
      queryClient.invalidateQueries(ERP_QUERY_KEYS.addons);
    },
  });
};
export const useDeleteAddon = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteAddon, {
    onSuccess: () => {
      queryClient.invalidateQueries(ERP_QUERY_KEYS.addons);
    },
  });
};
export const useToggleAddonStatus = () => {
  const queryClient = useQueryClient();
  return useMutation(toggleAddonStatus, {
    onSuccess: () => {
      queryClient.invalidateQueries(ERP_QUERY_KEYS.addons);
    },
  });
};
export const useSuppliers = (restaurantId) => {
  return useQuery([ERP_QUERY_KEYS.suppliers, restaurantId], () => fetchSuppliers(restaurantId), {
    enabled: !!restaurantId,
  });
};
export const useMoveStock = () => {
  const queryClient = useQueryClient();
  return useMutation(moveStock, {
    onSuccess: () => {
      queryClient.invalidateQueries(ERP_QUERY_KEYS.stockProducts);
      queryClient.invalidateQueries(ERP_QUERY_KEYS.stockDashboard);
      queryClient.invalidateQueries(ERP_QUERY_KEYS.stockMovements);
    },
  });
};

// React Query Hooks - Stock Dashboard
export const useStockDashboard = (restaurantId) => {
  return useQuery(
    [ERP_QUERY_KEYS.stockDashboard, restaurantId],
    () => fetchStockDashboard(restaurantId),
    {
      enabled: !!restaurantId,
    }
  );
};

// React Query Hooks - Stock Movements
export const useStockMovements = () => {
  return useQuery(ERP_QUERY_KEYS.stockMovements, fetchStockMovements);
};
export const useStockHistory = (productId) => {
  return useQuery([ERP_QUERY_KEYS.stockHistory, productId], () => fetchStockHistory(productId), {
    enabled: !!productId,
  });
};

// React Query Hooks - Stock Products
export const useStockProducts = (restaurantId) => {
  return useQuery(
    [ERP_QUERY_KEYS.stockProducts, restaurantId],
    () => fetchStockProducts(restaurantId),
    {
      enabled: !!restaurantId,
    }
  );
};

// React Query Hooks - Suppliers
export const useCreateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation(createSupplier, {
    onSuccess: () => {
      queryClient.invalidateQueries(ERP_QUERY_KEYS.suppliers);
    },
  });
};
export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation(updateSupplier, {
    onSuccess: () => {
      queryClient.invalidateQueries(ERP_QUERY_KEYS.suppliers);
    },
  });
};
export const useDeleteSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteSupplier, {
    onSuccess: () => {
      queryClient.invalidateQueries(ERP_QUERY_KEYS.suppliers);
    },
  });
};

// React Query Hooks - Tables
export const useTables = () => {
  return useQuery(ERP_QUERY_KEYS.tables, fetchTables);
};
export const useCreateTable = () => {
  const queryClient = useQueryClient();
  return useMutation(createTable, {
    onSuccess: () => {
      queryClient.invalidateQueries(ERP_QUERY_KEYS.tables);
    },
  });
};
export const useUpdateTable = () => {
  const queryClient = useQueryClient();
  return useMutation(updateTable, {
    onSuccess: () => {
      queryClient.invalidateQueries(ERP_QUERY_KEYS.tables);
    },
  });
};
export const useDeleteTable = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteTable, {
    onSuccess: () => {
      queryClient.invalidateQueries(ERP_QUERY_KEYS.tables);
    },
  });
};
export const useGenerateQrCode = () => {
  return useMutation(generateQrCode, {
    onSuccess: () => {
      // Invalidate tables or QR codes query if applicable
    },
  });
};
