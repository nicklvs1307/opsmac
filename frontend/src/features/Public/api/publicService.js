import { useQuery, useMutation } from 'react-query';
import axiosInstance from '@/services/axiosInstance';

//================================================================================================
// PUBLIC
//================================================================================================

// Hook to register a customer
export const useRegisterCustomer = () => {
  return useMutation((customerData) =>
    axiosInstance.post('/public/customers/register', customerData)
  );
};

// Hook to fetch dine-in menu
export const useGetDineInMenu = (tableId) => {
  return useQuery(
    ['dineInMenu', tableId],
    async () => {
      const { data } = await axiosInstance.get(`/public/dine-in-menu/${tableId}`);
      return data;
    },
    {
      enabled: !!tableId,
    }
  );
};

// Hook to spin the wheel
export const useSpinWheel = () => {
  return useMutation((rewardData) => axiosInstance.post('/rewards/spin-wheel', rewardData));
};

// Hook to fetch public restaurant data
export const useGetPublicRestaurant = (restaurantSlug) => {
  return useQuery(
    ['publicRestaurant', restaurantSlug],
    async () => {
      const { data } = await axiosInstance.get(`/public/restaurant/${restaurantSlug}`);
      return data;
    },
    {
      enabled: !!restaurantSlug,
    }
  );
};

// Hook to validate a coupon
export const useValidateCoupon = () => {
  return useMutation((couponData) =>
    axiosInstance.post('/coupons/public/validate', couponData)
  );
};

// Hook to perform a public check-in
export const usePublicCheckin = (restaurantSlug) => {
  return useMutation((checkinData) =>
    axiosInstance.post(`/checkin/public/${restaurantSlug}`, checkinData)
  );
};

// Hook to fetch delivery menu
export const useGetDeliveryMenu = (restaurantSlug) => {
  return useQuery(
    ['deliveryMenu', restaurantSlug],
    async () => {
      const { data } = await axiosInstance.get(`/public/products/delivery/${restaurantSlug}`);
      const groupedByCategory = data.products.reduce((acc, product) => {
        const category = product.category?.name || 'Outros';
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(product);
        return acc;
      }, {});
      return { ...data, categories: groupedByCategory };
    },
    {
      enabled: !!restaurantSlug,
    }
  );
};

// Hook to create a delivery order
export const useCreateDeliveryOrder = () => {
  return useMutation((orderData) => axiosInstance.post('/public/orders', orderData));
};

// Hook to fetch dine-in menu
export const useGetPublicDineInMenu = (restaurantSlug, tableNumber) => {
  return useQuery(
    ['publicDineInMenu', restaurantSlug, tableNumber],
    async () => {
      const { data } = await axiosInstance.get(
        `/public/menu/dine-in/${restaurantSlug}/${tableNumber}`
      );
      const groupedByCategory = data.products.reduce((acc, product) => {
        const category = product.category?.name || 'Outros';
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(product);
        return acc;
      }, {});
      return { ...data, categories: groupedByCategory };
    },
    {
      enabled: !!restaurantSlug && !!tableNumber,
    }
  );
};

// Hook to call a waiter
export const useCallWaiter = () => {
  return useMutation(({ sessionId, description }) =>
    axiosInstance.post(`/public/menu/dine-in/${sessionId}/call-waiter`, { description })
  );
};

// Hook to create a dine-in order
export const useCreateDineInOrder = () => {
  return useMutation((orderData) => axiosInstance.post('/public/dine-in/order', orderData));
};

// Hook to start a table session
export const useStartTableSession = () => {
  return useMutation((tableId) =>
    axiosInstance.post(`/public/menu/dine-in/${tableId}/start-session`)
  );
};

// Hook to fetch public menu
export const useGetPublicMenu = (restaurantSlug) => {
  return useQuery(
    ['publicMenu', restaurantSlug],
    async () => {
      const { data } = await axiosInstance.get(`/public/products/${restaurantSlug}`);
      return data;
    },
    {
      enabled: !!restaurantSlug,
    }
  );
};

// Hook to fetch public survey
export const useGetPublicSurvey = (restaurantSlug, surveySlug) => {
  return useQuery(
    ['publicSurvey', restaurantSlug, surveySlug],
    async () => {
      const { data } = await axiosInstance.get(`/public/surveys/${restaurantSlug}/${surveySlug}`);
      return data;
    },
    {
      enabled: !!restaurantSlug && !!surveySlug,
    }
  );
};

// Hook to submit a survey response
export const useSubmitSurveyResponse = (surveySlug) => {
  return useMutation((responseData) =>
    axiosInstance.post(`/public/surveys/${surveySlug}/responses`, responseData)
  );
};

// Hook to link a customer to a survey response
export const useLinkCustomerToResponse = (responseId) => {
  return useMutation((customerId) =>
    axiosInstance.patch(`/public/surveys/responses/${responseId}/link-customer`, {
      customer_id: customerId,
    })
  );
};
