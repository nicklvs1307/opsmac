import { useQuery, useMutation, useQueryClient } from 'react-query';
import axiosInstance from '@/shared/lib/axiosInstance'; // Adjust path as needed

// Query Keys
const COUPON_QUERY_KEYS = {
  analytics: 'couponAnalytics',
  rewards: 'couponRewards',
  customers: 'couponCustomers',
  coupons: 'coupons',
  couponValidation: 'couponValidation',
};

// API Functions
const fetchCouponAnalytics = async (restaurantId) => {
  const response = await axiosInstance.get(`/api/coupons/analytics/restaurant/${restaurantId}`);
  return response.data;
};

const fetchRewards = async (restaurantId) => {
  const response = await axiosInstance.get(`/api/rewards/restaurant/${restaurantId}`);
  return response.data;
};

const fetchCustomers = async () => {
  const response = await axiosInstance.get('/api/customers');
  return response.data;
};

const createCoupon = async (couponData) => {
  const response = await axiosInstance.post('/api/coupons', couponData);
  return response.data;
};

const expireCoupons = async () => {
  const response = await axiosInstance.get(`/api/coupons/expire`);
  return response.data;
};

const redeemCoupon = async (id) => {
  const response = await axiosInstance.post(`/api/coupons/${id}/redeem`);
  return response.data;
};

const fetchCoupons = async ({ restaurantId, params }) => {
  const response = await axiosInstance.get(`/api/coupons/restaurant/${restaurantId}`, { params });
  return response.data;
};

const validateCoupon = async (code) => {
  const response = await axiosInstance.post('/api/coupons/validate', { code });
  return response.data;
};

// React Query Hooks
export const useCouponAnalytics = (restaurantId) => {
  return useQuery(
    [COUPON_QUERY_KEYS.analytics, restaurantId],
    () => fetchCouponAnalytics(restaurantId),
    {
      enabled: !!restaurantId,
    }
  );
};

export const useRewards = (restaurantId) => {
  return useQuery([COUPON_QUERY_KEYS.rewards, restaurantId], () => fetchRewards(restaurantId), {
    enabled: !!restaurantId,
  });
};

export const useCustomers = () => {
  return useQuery(COUPON_QUERY_KEYS.customers, fetchCustomers);
};

export const useCreateCoupon = () => {
  const queryClient = useQueryClient();
  return useMutation(createCoupon, {
    onSuccess: () => {
      queryClient.invalidateQueries(COUPON_QUERY_KEYS.coupons);
    },
  });
};

export const useExpireCoupons = () => {
  const queryClient = useQueryClient();
  return useMutation(expireCoupons, {
    onSuccess: () => {
      queryClient.invalidateQueries(COUPON_QUERY_KEYS.coupons);
    },
  });
};

export const useRedeemCoupon = () => {
  const queryClient = useQueryClient();
  return useMutation(redeemCoupon, {
    onSuccess: () => {
      queryClient.invalidateQueries(COUPON_QUERY_KEYS.coupons);
      queryClient.invalidateQueries(COUPON_QUERY_KEYS.couponValidation); // Invalidate validation query if any
    },
  });
};

export const useCoupons = (restaurantId, params) => {
  return useQuery(
    [COUPON_QUERY_KEYS.coupons, restaurantId, params],
    () => fetchCoupons({ restaurantId, params }),
    {
      enabled: !!restaurantId,
    }
  );
};

export const useValidateCoupon = () => {
  return useMutation(validateCoupon);
};
