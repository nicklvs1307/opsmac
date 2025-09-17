import { useQuery } from 'react-query';
import axiosInstance from '@/services/axiosInstance';

const FINANCIAL_REPORTS_QUERY_KEYS = {
  cashFlowReport: 'cashFlowReport',
  currentStockPosition: 'currentStockPosition',
  dreReport: 'dreReport',
  generatedCouponsReport: 'generatedCouponsReport',
  financialCategoriesReport: 'financialCategoriesReport',
  salesByPaymentMethodReport: 'salesByPaymentMethodReport',
  stockPositionHistoryReport: 'stockPositionHistoryReport', // Added this key
  stockItemsReport: 'stockItemsReport', // Added this key
};

// API Functions
const fetchCashFlowReport = async ({ restaurantId, filters }) => {
  const { start_date, end_date } = filters;
  if (!start_date || !end_date) {
    return null; // Don't fetch if dates are not set
  }
  const { data } = await axiosInstance.get(
    `/financial/reports/cash-flow?restaurant_id=${restaurantId}&start_date=${start_date}&end_date=${end_date}`
  );
  return data;
};

const fetchCurrentStockPosition = async ({ restaurantId }) => {
  const { data } = await axiosInstance.get(`/stock?restaurant_id=${restaurantId}`);
  return data;
};

const fetchDREReport = async ({ restaurantId, filters }) => {
  const { start_date, end_date } = filters;
  if (!start_date || !end_date) {
    return null; // Don't fetch if dates are not set
  }
  const { data } = await axiosInstance.get(
    `/financial/reports/dre?restaurant_id=${restaurantId}&start_date=${start_date}&end_date=${end_date}`
  );
  return data;
};

const fetchGeneratedCoupons = async ({ restaurantId, filters }) => {
  const { status, search, page, limit } = filters;
  let url = `/coupons/restaurant/${restaurantId}?page=${page}&limit=${limit}`;
  if (status) url += `&status=${status}`;
  if (search) url += `&search=${search}`;
  const { data } = await axiosInstance.get(url);
  return data;
};

const fetchFinancialCategories = async ({ restaurantId, filters }) => {
  const { type } = filters;
  let url = `/financial/categories?restaurant_id=${restaurantId}`;
  if (type) url += `&type=${type}`;
  const { data } = await axiosInstance.get(url);
  return data;
};

const fetchSalesByPaymentMethodReport = async ({ restaurantId, filters }) => {
  const { start_date, end_date } = filters;
  if (!start_date || !end_date) {
    return null; // Don't fetch if dates are not set
  }
  const { data } = await axiosInstance.get(
    `/financial/reports/sales-by-payment-method?restaurant_id=${restaurantId}&start_date=${start_date}&end_date=${end_date}`
  );
  return data;
};

const fetchStockPositionHistory = async ({ restaurantId, filters }) => {
  const { start_date, end_date, item_id, type } = filters;
  let url = `/stock/history?restaurant_id=${restaurantId}`;
  if (start_date) url += `&start_date=${start_date}`;
  if (end_date) url += `&end_date=${end_date}`;
  if (item_id) url += `&item_id=${item_id}`;
  if (type) url += `&type=${type}`;
  const { data } = await axiosInstance.get(url);
  return data;
};

const fetchStockItems = async ({ restaurantId }) => {
  const { data } = await axiosInstance.get(`/stock?restaurant_id=${restaurantId}`);
  return data;
};

// React Query Hooks
export const useCashFlowReport = (restaurantId, filters, options) => {
  return useQuery(
    [FINANCIAL_REPORTS_QUERY_KEYS.cashFlowReport, restaurantId, filters],
    () => fetchCashFlowReport({ restaurantId, filters }),
    {
      enabled: !!restaurantId && !!filters.start_date && !!filters.end_date,
      ...options,
    }
  );
};

export const useCurrentStockPosition = (restaurantId, options) => {
  return useQuery(
    [FINANCIAL_REPORTS_QUERY_KEYS.currentStockPosition, restaurantId],
    () => fetchCurrentStockPosition({ restaurantId }),
    {
      enabled: !!restaurantId,
      ...options,
    }
  );
};

export const useDREReport = (restaurantId, filters, options) => {
  return useQuery(
    [FINANCIAL_REPORTS_QUERY_KEYS.dreReport, restaurantId, filters],
    () => fetchDREReport({ restaurantId, filters }),
    {
      enabled: !!restaurantId && !!filters.start_date && !!filters.end_date,
      ...options,
    }
  );
};

export const useGeneratedCouponsReport = (restaurantId, filters, options) => {
  return useQuery(
    [FINANCIAL_REPORTS_QUERY_KEYS.generatedCouponsReport, restaurantId, filters],
    () => fetchGeneratedCoupons({ restaurantId, filters }),
    {
      enabled: !!restaurantId,
      ...options,
    }
  );
};

export const useFinancialCategoriesReport = (restaurantId, filters, options) => {
  return useQuery(
    [FINANCIAL_REPORTS_QUERY_KEYS.financialCategoriesReport, restaurantId, filters],
    () => fetchFinancialCategories({ restaurantId, filters }),
    {
      enabled: !!restaurantId,
      ...options,
    }
  );
};

export const useSalesByPaymentMethodReport = (restaurantId, filters, options) => {
  return useQuery(
    [FINANCIAL_REPORTS_QUERY_KEYS.salesByPaymentMethodReport, restaurantId, filters],
    () => fetchSalesByPaymentMethodReport({ restaurantId, filters }),
    {
      enabled: !!restaurantId && !!filters.start_date && !!filters.end_date,
      ...options,
    }
  );
};

export const useStockPositionHistoryReport = (restaurantId, filters, options) => {
  return useQuery(
    [FINANCIAL_REPORTS_QUERY_KEYS.stockPositionHistoryReport, restaurantId, filters],
    () => fetchStockPositionHistory({ restaurantId, filters }),
    {
      enabled: !!restaurantId,
      ...options,
    }
  );
};

export const useStockItemsReport = (restaurantId, options) => {
  return useQuery(
    [FINANCIAL_REPORTS_QUERY_KEYS.stockItemsReport, restaurantId],
    () => fetchStockItems({ restaurantId }),
    {
      enabled: !!restaurantId,
      ...options,
    }
  );
};
