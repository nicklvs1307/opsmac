import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { useAuth } from '@/app/providers/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import { fetchCoupons } from '../api/couponService';
import { useForm, FormProvider } from 'react-hook-form';
import CouponFilters from '../components/CouponFilters';
import CouponTable from '../components/CouponTable';



const GeneratedCouponsPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const restaurantId = user?.restaurants?.[0]?.id;
  const token = user?.token;

  const methods = useForm({
    defaultValues: {
      page: 1,
      limit: 10,
      search: '',
      status: '',
      rewardType: '',
    },
  });

  const { control, watch, setValue } = methods;

  const page = watch('page');
  const limit = watch('limit');
  const search = watch('search');
  const status = watch('status');
  const rewardType = watch('rewardType');

  const {
    data: couponsData,
    isLoading,
    isError,
    error,
  } = useQuery(
    ['coupons', restaurantId, page, limit, search, status, rewardType],
    () => fetchCoupons({ restaurantId, page, limit, search, status, rewardType, token }),
    {
      enabled: !!restaurantId && !!token,
      keepPreviousData: true, // Keep data while fetching new page
    }
  );

  const handlePageChange = (event, value) => {
    setValue('page', value);
  };

  const handleSearchChange = (event) => {
    setValue('search', event.target.value);
    setValue('page', 1); // Reset page when search changes
  };

  const handleStatusChange = (event) => {
    setValue('status', event.target.value);
    setValue('page', 1);
  };

  const handleRewardTypeChange = (event) => {
    setValue('rewardType', event.target.value);
    setValue('page', 1);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error?.message || t('common.error_loading_data')}
      </Alert>
    );
  }

  const coupons = couponsData?.coupons || [];
  const pagination = couponsData?.pagination || {};

  return (
    <FormProvider {...methods}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('generated_coupons.title')}
        </Typography>

      <CouponFilters
        control={control}
        onSearchChange={handleSearchChange}
        onStatusChange={handleStatusChange}
        onRewardTypeChange={handleRewardTypeChange}
      />

      <CouponTable coupons={coupons} />

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Pagination
          count={pagination.total_pages || 1}
          page={pagination.current_page || 1}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>
    </Box>
    </FormProvider>
  );
};

export default GeneratedCouponsPage;
