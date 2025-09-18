import { useQuery, useMutation, useQueryClient } from 'react-query';
import axiosInstance from '@/services/axiosInstance';
import { useAuth } from '@/app/providers/contexts/AuthContext'; // Added for getRestaurantIdFromAuth replacement

// Query Keys
const COUPON_QUERY_KEYS = {
  analytics: 'couponAnalytics',
  rewards: 'couponRewards',
  customers: 'couponCustomers',
  coupons: 'coupons',
  couponDetails: 'couponDetails',
  couponValidation: 'couponValidation',
};

// Helper to get restaurantId from AuthContext
const getRestaurantIdFromAuth = () => {
  // This is a placeholder. In a real app, you'd get this from a global state or context.
  // For now, we'll use useAuth directly in the hook where it's needed.
  // This function will be removed, and useAuth will be used directly in useCoupons.
  return null; // This function will not be used directly.
};

// API Functions
const fetchCouponAnalytics = async (restaurantId) => {
  const response = await axiosInstance.get(`/coupons/analytics/restaurant/${restaurantId}`);
  return response.data;
};

const fetchRewards = async (restaurantId) => {
  const response = await axiosInstance.get(`/rewards/restaurant/${restaurantId}`);
  return response.data;
};

const fetchCustomers = async () => {
  const response = await axiosInstance.get('/customers');
  return response.data;
};

const fetchCouponDetails = async (id) => {
  const response = await axiosInstance.get(`/coupons/${id}`);
  return response.data;
};

const createCoupon = async (couponData) => {
  const response = await axiosInstance.post('/coupons', couponData);
  return response.data;
};

const updateCoupon = async ({ id, ...couponData }) => {
  const response = await axiosInstance.put(`/coupons/${id}`, couponData);
  return response.data;
};

const expireCoupons = async (id) => {
  const response = await axiosInstance.post(`/coupons/expire`, { coupon_id: id });
  return response.data;
};

const redeemCoupon = async (id) => {
  const response = await axiosInstance.post(`/coupons/${id}/redeem`);
  return response.data;
};

const fetchCoupons = async ({ restaurantId, params }) => {
  const response = await axiosInstance.get(`/coupons/restaurant/${restaurantId}`, { params });
  return response.data;
};

const validateCoupon = async (code) => {
  const response = await axiosInstance.post('/coupons/validate', { code });
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

export const useCouponDetails = (id) => {
  return useQuery([COUPON_QUERY_KEYS.couponDetails, id], () => fetchCouponDetails(id), {
    enabled: !!id,
  });
};

export const useCreateCoupon = () => {
  const queryClient = useQueryClient();
  return useMutation(createCoupon, {
    onSuccess: () => {
      queryClient.invalidateQueries(COUPON_QUERY_KEYS.coupons);
    },
  });
};

export const useUpdateCoupon = () => {
  const queryClient = useQueryClient();
  return useMutation(updateCoupon, {
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries([COUPON_QUERY_KEYS.couponDetails, variables.id]);
      queryClient.invalidateQueries(COUPON_QUERY_KEYS.coupons);
    },
  });
};

export const useExpireCoupon = () => {
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
      queryClient.invalidateQueries(COUPON_QUERY_KEYS.couponValidation);
    },
  });
};

export const useCoupons = (params) => {
  const { user } = useAuth(); // Get user from AuthContext
  const restaurantId = user?.restaurants?.[0]?.id; // Extract restaurantId
  return useQuery(
    [COUPON_QUERY_KEYS.coupons, restaurantId, params],
    () => fetchCoupons({ restaurantId, params }), // Pass restaurantId to fetchCoupons
    {
      enabled: !!restaurantId,
    }
  );
};

export const useValidateCoupon = () => {
  return useMutation(validateCoupon);
};
