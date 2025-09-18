import React, { useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth } from '@/app/providers/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
// Updated import path for couponQueries
import {
  useCustomers,
  useRewards,
  useCouponDetails,
  useUpdateCoupon,
} from '@/features/Coupons/api/couponQueries';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useParams, useNavigate } from 'react-router-dom';

const CouponEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const restaurantId = user?.restaurants?.[0]?.id;

  const validationSchema = yup.object().shape({
    rewardId: yup.string().required(t('coupon_create_form.reward_required')),
    customerId: yup.string().required(t('coupon_create_form.customer_required')),
    expiresAt: yup.date().nullable(),
  });

  const {
    data: couponData,
    isLoading: isLoadingCoupon,
    isError: isErrorCoupon,
    error: errorCoupon,
  } = useCouponDetails(id);
  const {
    data: rewardsData,
    isLoading: isLoadingRewards,
    isError: isErrorRewards,
    error: errorRewards,
  } = useRewards(restaurantId); // Pass restaurantId to useRewards
  const {
    data: customersData,
    isLoading: isLoadingCustomers,
    isError: isErrorCustomers,
    error: errorCustomers,
  } = useCustomers();
  const updateCouponMutation = useUpdateCoupon();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      rewardId: '',
      customerId: '',
      expiresAt: '',
    },
  });

  useEffect(() => {
    if (couponData) {
      reset({
        rewardId: couponData.rewardId,
        customerId: couponData.customerId,
        expiresAt: couponData.expiresAt
          ? new Date(couponData.expiresAt).toISOString().slice(0, 16)
          : '',
      });
    }
  }, [couponData, reset]);

  const rewards = rewardsData?.rewards || [];
  const customers = customersData?.customers || [];

  const isLoading =
    isLoadingCoupon || isLoadingRewards || isLoadingCustomers || updateCouponMutation.isLoading;
  const isError =
    isErrorCoupon || isErrorRewards || isErrorCustomers || updateCouponMutation.isError;
  const error = errorCoupon || errorRewards || errorCustomers || updateCouponMutation.error;

  const onSubmit = async (data) => {
    try {
      await updateCouponMutation.mutateAsync({ id, ...data, restaurant_id: restaurantId });
      toast.success(t('coupon_edit_form.coupon_updated_success'));
      navigate('/fidelity/coupons/management'); // Redirect to list after update
    } catch (err) {
      console.error('Error updating coupon:', err);
      toast.error(err.response?.data?.message || t('coupon_edit_form.error_updating_coupon'));
    }
  };

  if (isLoading) {
    return <CircularProgress />;
  }

  if (isError) {
    return (
      <Alert severity="error">{error?.message || t('coupon_edit_form.error_fetching_data')}</Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" mb={3}>
        {t('coupon_edit_form.title')}
      </Typography>
      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Controller
                name="rewardId"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.rewardId}>
                    <InputLabel>{t('coupon_create_form.reward_label')}</InputLabel>
                    <Select {...field} label={t('coupon_create_form.reward_label')}>
                      {rewards.map((reward) => (
                        <MenuItem key={reward.id} value={reward.id}>
                          {reward.title}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="customerId"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.customerId}>
                    <InputLabel>{t('coupon_create_form.customer_label')}</InputLabel>
                    <Select {...field} label={t('coupon_create_form.customer_label')}>
                      {customers.map((customer) => (
                        <MenuItem key={customer.id} value={customer.id}>
                          {customer.name} ({customer.email})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="expiresAt"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t('coupon_create_form.expires_at_label')}
                    type="datetime-local"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" disabled={updateCouponMutation.isLoading}>
                {t('coupon_edit_form.update_coupon_button')}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default CouponEditPage;
