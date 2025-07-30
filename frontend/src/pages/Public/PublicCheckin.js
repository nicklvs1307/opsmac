import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress,
  Container,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import axiosInstance from '../../api/axiosInstance';
import toast from 'react-hot-toast';

const PublicCheckin = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const restaurantId = queryParams.get('restaurantId');

  const [loading, setLoading] = useState(false);
  const [restaurantName, setRestaurantName] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      phone_number: '',
      customer_name: '',
    },
  });

  useEffect(() => {
    if (!restaurantId) {
      toast.error(t('public_checkin.error_no_restaurant_id'));
      // Optionally redirect to an error page or home
      return;
    }

    const fetchRestaurantName = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/api/restaurants/${restaurantId}`);
        setRestaurantName(response.data.name);
      } catch (err) {
        console.error('Error fetching restaurant name:', err);
        toast.error(t('public_checkin.error_fetching_restaurant'));
        // Optionally redirect or show a generic error
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantName();
  }, [restaurantId, t]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const response = await axiosInstance.post('/api/checkin/public', {
        restaurant_id: restaurantId,
        phone_number: data.phone_number,
        customer_name: data.customer_name,
      });
      toast.success(t('public_checkin.checkin_success'));
      navigate('/thank-you', { state: { message: t('public_checkin.checkin_thank_you_message') } });
    } catch (err) {
      console.error('Error during check-in:', err);
      toast.error(err.response?.data?.message || t('public_checkin.checkin_error'));
    } finally {
      setLoading(false);
    }
  };

  if (loading && !restaurantName) {
    return (
      <Container component={Paper} elevation={3} sx={{ p: 4, mt: 5, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>{t('public_checkin.loading_restaurant')}</Typography>
      </Container>
    );
  }

  return (
    <Container component={Paper} elevation={3} sx={{ p: 4, mt: 5 }}>
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          {t('public_checkin.welcome_to')} {restaurantName || t('public_checkin.our_restaurant')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('public_checkin.please_checkin')}
        </Typography>
      </Box>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="phone_number"
          control={control}
          rules={{
            required: t('public_checkin.phone_required'),
            pattern: {
              value: /^\+?[1-9]\d{1,14}$/,
              message: t('public_checkin.invalid_phone'),
            },
          }}
          render={({ field }) => (
            <TextField
              {...field}
              label={t('public_checkin.phone_number')}
              fullWidth
              margin="normal"
              error={!!errors.phone_number}
              helperText={errors.phone_number?.message}
              placeholder="Ex: 5511987654321"
            />
          )}
        />
        <Controller
          name="customer_name"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label={t('public_checkin.your_name')}
              fullWidth
              margin="normal"
              error={!!errors.customer_name}
              helperText={errors.customer_name?.message}
              placeholder={t('public_checkin.name_optional')}
            />
          )}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 3 }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={20} /> : t('public_checkin.checkin_button')}
        </Button>
      </form>
    </Container>
  );
};

export default PublicCheckin;