import axiosInstance from '@/services/axiosInstance';

export const fetchSegments = async ({ restaurantId, token }) => {
  const response = await axiosInstance.get(`/customerSegmentation`, {
    params: { restaurantId },
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const createSegment = async ({ segmentData, token }) => {
  const response = await axiosInstance.post('/customerSegmentation', segmentData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const updateSegment = async ({ segmentId, segmentData, token }) => {
  const response = await axiosInstance.put(`/customerSegmentation/${segmentId}`, segmentData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const deleteSegment = async ({ segmentId }) => {
  const response = await axiosInstance.delete(`/customerSegmentation/${segmentId}`);
  return response.data;
};

export const applySegmentationRules = async ({ restaurantId }) => {
  const response = await axiosInstance.post(
    `/customerSegmentation/apply-rules`,
    { restaurantId },
  );},
  );