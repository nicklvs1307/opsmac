import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  const [identificationMethod, setIdentificationMethod] = useState('phone'); // 'phone' or 'cpf'

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      phone_number: '',
      cpf: '',
      customer_name: '',
    },
  });

  useEffect(() => {
    if (!restaurantId) {
      toast.error(t('public_checkin.error_no_restaurant_id'));
      return;
    }

    const fetchRestaurantData = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/public/restaurant/${restaurantId}`);
        setRestaurantName(response.data.name);
        setIdentificationMethod(response.data.settings?.checkin_program_settings?.identification_method || 'phone');
      } catch (err) {
        console.error('Error fetching restaurant data:', err);
        toast.error(t('public_checkin.error_fetching_restaurant'));
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantData();
  }, [restaurantId, t]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const payload = {
        restaurant_id: restaurantId,
        customer_name: data.customer_name,
      };

      if (identificationMethod === 'phone') {
        payload.phone_number = data.phone_number;
      } else if (identificationMethod === 'cpf') {
        payload.cpf = data.cpf;
      }

      const response = await axiosInstance.post('/api/checkin/public', payload);
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
        {identificationMethod === 'phone' && (
          <Controller
            name="phone_number"
            control={control}
            rules={{
              required: t('public_checkin.phone_required'),
              validate: (value) => {
                const cleanedValue = value.replace(/\D/g, '');

                if (!cleanedValue.startsWith('55')) {
                  return t('public_checkin.invalid_phone_country_code');
                }

                const ddd = cleanedValue.substring(2, 4);
                const phoneNumberWithoutCountryCodeAndDDD = cleanedValue.substring(4);

                if (ddd.length !== 2) {
                  return t('public_checkin.invalid_phone_ddd');
                }

                const dddNum = parseInt(ddd, 10);

                if (dddNum >= 11 && dddNum <= 28) {
                  if (phoneNumberWithoutCountryCodeAndDDD.length !== 9) {
                    return t('public_checkin.invalid_phone_9_digits_ddd_11_28');
                  }
                } else {
                  if (phoneNumberWithoutCountryCodeAndDDD.length !== 8 && phoneNumberWithoutCountryCodeAndDDD.length !== 9) {
                    return t('public_checkin.invalid_phone_8_or_9_digits_other_ddd');
                  }
                }

                return true;
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
        )}

        {identificationMethod === 'cpf' && (
          <Controller
            name="cpf"
            control={control}
            rules={{
              required: t('public_checkin.cpf_required'),
              pattern: {
                value: /^\d{11}$/,
                message: t('public_checkin.invalid_cpf'),
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label={t('public_checkin.cpf')}
                fullWidth
                margin="normal"
                error={!!errors.cpf}
                helperText={errors.cpf?.message}
                placeholder="Ex: 12345678900"
              />
            )}
          />
        )}

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
