import { useQuery, useMutation, useQueryClient } from 'react-query';
import axiosInstance from '@/services/axiosInstance';

// Query Keys
const COUPON_QUERY_KEYS = {
  analytics: 'couponAnalytics',
  rewards: 'couponRewards',
  customers: 'couponCustomers',
  coupons: 'coupons',
  couponDetails: 'couponDetails', // Added for single coupon details
  couponValidation: 'couponValidation',
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
  // Modified to accept id for single coupon expiration
  const response = await axiosInstance.post(`/coupons/expire`, { coupon_id: id }); // Assuming backend expects coupon_id
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
  // Renamed from useExpireCoupons and modified
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

export const useCoupons = (params) => {
  const restaurantId = getRestaurantIdFromAuth();
  return useQuery(
    [COUPON_QUERY_KEYS.coupons, restaurantId, params],
    () => fetchCoupons({ params }),
    {
      enabled: !!restaurantId,
    }
  );
};

export const useValidateCoupon = () => {
  return useMutation(validateCoupon);
};

};
port const useValidateCoupon = () => {
  return useMutation(validateCoupon);
};
;
