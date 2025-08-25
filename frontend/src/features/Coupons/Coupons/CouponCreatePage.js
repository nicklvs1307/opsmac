import React from 'react';
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
import { useCustomers, useRewards, useCreateCoupon } from '@/features/Coupons/api/couponQueries';

const CouponCreatePage = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const restaurantId = user?.restaurants?.[0]?.id;

  const {
    data: rewardsData,
    isLoading: isLoadingRewards,
    isError: isErrorRewards,
    error: errorRewards,
  } = useRewards();
  const {
    data: customersData,
    isLoading: isLoadingCustomers,
    isError: isErrorCustomers,
    error: errorCustomers,
  } = useCustomers();
  const createCouponMutation = useCreateCoupon();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const rewards = rewardsData?.rewards || [];
  const customers = customersData?.customers || [];

  const isLoading = isLoadingRewards || isLoadingCustomers || createCouponMutation.isLoading;
  const isError = isErrorRewards || isErrorCustomers || createCouponMutation.isError;
  const error = errorRewards || errorCustomers || createCouponMutation.error;

  const onSubmit = async (data) => {
    try {
      await createCouponMutation.mutateAsync({ ...data, restaurant_id: restaurantId });
      toast.success(t('coupon_create_form.coupon_created_success'));
      reset(); // Clear form after successful submission
    } catch (err) {
      console.error('Error creating coupon:', err);
      toast.error(err.response?.data?.message || t('coupon_create_form.error_creating_coupon'));
    }
  };

  if (isLoading) {
    return <CircularProgress />;
  }

  if (isError) {
    return (
      <Alert severity="error">
        {error?.message || t('coupon_create_form.error_fetching_data')}
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" mb={3}>
        {t('coupon_create_form.title')}
      </Typography>
      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Controller
                name="reward_id"
                control={control}
                rules={{ required: t('coupon_create_form.reward_required') }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.reward_id}>
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
                name="customer_id"
                control={control}
                rules={{ required: t('coupon_create_form.customer_required') }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.customer_id}>
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
                name="expires_at"
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
              <Button type="submit" variant="contained" disabled={createCouponMutation.isLoading}>
                {t('coupon_create_form.create_coupon_button')}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default CouponCreatePage;
