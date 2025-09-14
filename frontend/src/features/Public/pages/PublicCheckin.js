import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress,
  Container,
  alpha,
  Alert,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useGetPublicRestaurant, useValidateCoupon, usePublicCheckin } from 'api/publicService';

const PublicCheckin = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { restaurantSlug } = useParams();
  const theme = useTheme();

  const {
    data: restaurantData,
    isLoading: isLoadingRestaurant,
    isError: isErrorRestaurant,
    error: restaurantError,
  } = useGetPublicRestaurant(restaurantSlug);
  const validateCouponMutation = useValidateCoupon();
  const publicCheckinMutation = usePublicCheckin(restaurantSlug);

  const primaryColor =
    restaurantData?.settings?.checkin_program_settings?.primary_color || '#3f51b5';
  const secondaryColor =
    restaurantData?.settings?.checkin_program_settings?.secondary_color || '#f50057';
  const textColor = restaurantData?.settings?.checkin_program_settings?.text_color || '#333333';
  const backgroundColor =
    restaurantData?.settings?.checkin_program_settings?.background_color || '#ffffff';
  const backgroundImageUrl =
    restaurantData?.settings?.checkin_program_settings?.background_image_url || null;
  const identificationMethod =
    restaurantData?.settings?.checkin_program_settings?.identification_method || 'phone';
  const requiresTable =
    restaurantData?.settings?.checkin_program_settings?.checkin_requires_table || false;
  const requireCouponForCheckin =
    restaurantData?.settings?.checkin_program_settings?.require_coupon_for_checkin || false;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      phone_number: '',
      cpf: '',
      customer_name: '',
      coupon_code: '',
    },
  });

  const onSubmit = async (data) => {
    let couponId = null;
    if (requireCouponForCheckin && data.coupon_code) {
      try {
        const couponValidationResponse = await validateCouponMutation.mutateAsync({
          code: data.coupon_code,
          restaurantSlug,
        });
        if (couponValidationResponse.is_valid) {
          couponId = couponValidationResponse.id;
        } else {
          return;
        }
      } catch (error) {
        return;
      }
    }

    const payload = {
      customer_name: data.customer_name,
      table_number: requiresTable ? data.table_number : undefined,
      coupon_id: couponId,
    };

    if (identificationMethod === 'phone') {
      payload.phone_number = data.phone_number;
    } else if (identificationMethod === 'cpf') {
      payload.cpf = data.cpf;
    }

    publicCheckinMutation.mutate(payload, {
      onSuccess: (data) => {
        const { reward_earned } = data;
        if (reward_earned) {
          if (reward_earned.reward_type === 'spin_the_wheel') {
            navigate('/girar-roleta', { state: { reward_earned } });
          } else {
            navigate('/recompensa-ganha', { state: { reward_earned } });
          }
        } else {
          navigate('/thank-you', {
            state: { message: t('public_checkin.checkin_thank_you_message') },
          });
        }
      },
    });
  };

  if (isLoadingRestaurant) {
    return (
      <Container component={Paper} elevation={3} sx={{ p: 4, mt: 5, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          {t('public_checkin.loading_restaurant')}
        </Typography>
      </Container>
    );
  }

  if (isErrorRestaurant) {
    return (
      <Container component={Paper} elevation={3} sx={{ p: 4, mt: 5, textAlign: 'center' }}>
        <Alert severity="error">
          {restaurantError?.message || t('public_checkin.error_loading_restaurant')}
        </Alert>
        <Button variant="contained" onClick={() => navigate('/')} sx={{ mt: 2 }}>
          {t('common.back_to_home')}
        </Button>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: backgroundColor,
        backgroundImage: backgroundImageUrl ? `url(${backgroundImageUrl})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        py: { xs: 4, sm: 6, md: 8 },
        px: 2,
      }}
    >
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
        {restaurantData?.logo ? (
          <img
            src={`${process.env.REACT_APP_API_URL}${restaurantData.logo}`}
            alt={t('public_checkin.restaurant_logo_alt')}
            style={{
              height: '100px',
              width: '100px',
              borderRadius: '50%',
              objectFit: 'cover',
              filter: 'drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.15))',
            }}
          />
        ) : (
          <img
            src="/logo192.png"
            alt={t('public_checkin.default_logo_alt')}
            style={{
              height: '100px',
              width: '100px',
              borderRadius: '50%',
              objectFit: 'cover',
              filter: 'drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.15))',
            }}
          />
        )}
      </Box>

      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, md: 5 },
            borderRadius: 4,
            boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(0, 0, 0, 0.05)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: `linear-gradient(90deg, ${primaryColor}, ${secondaryColor})`,
              zIndex: 1,
            },
            background: alpha(theme.palette.background.paper, 0.8),
            backdropFilter: 'blur(10px)',
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 800,
                color: textColor,
                mb: 2,
                fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' },
                letterSpacing: '-0.5px',
              }}
            >
              {t('public_checkin.welcome_to')}{' '}
              {restaurantData?.name || t('public_checkin.our_restaurant')}
            </Typography>
            <Typography
              variant="body1"
              color={textColor}
              sx={{
                maxWidth: '90%',
                mx: 'auto',
                fontSize: { xs: '0.95rem', sm: '1rem', md: '1.1rem' },
                lineHeight: 1.6,
                opacity: 0.85,
              }}
            >
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
                      if (
                        phoneNumberWithoutCountryCodeAndDDD.length !== 8 &&
                        phoneNumberWithoutCountryCodeAndDDD.length !== 9
                      ) {
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
                    variant="outlined"
                    InputProps={{
                      sx: {
                        borderRadius: 2,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(0, 0, 0, 0.1)',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: alpha(primaryColor, 0.3),
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: primaryColor,
                        },
                        transition: 'all 0.3s ease',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                        '&:hover': {
                          boxShadow: '0 4px 8px rgba(0,0,0,0.07)',
                        },
                      },
                    }}
                    InputLabelProps={{
                      sx: {
                        color: textColor,
                        '&.Mui-focused': {
                          color: primaryColor,
                        },
                      },
                    }}
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
                    variant="outlined"
                    InputProps={{
                      sx: {
                        borderRadius: 2,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(0, 0, 0, 0.1)',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: alpha(primaryColor, 0.3),
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: primaryColor,
                        },
                        transition: 'all 0.3s ease',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                        '&:hover': {
                          boxShadow: '0 4px 8px rgba(0,0,0,0.07)',
                        },
                      },
                    }}
                    InputLabelProps={{
                      sx: {
                        color: textColor,
                        '&.Mui-focused': {
                          color: primaryColor,
                        },
                      },
                    }}
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
                  variant="outlined"
                  InputProps={{
                    sx: {
                      borderRadius: 2,
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(0, 0, 0, 0.1)',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: alpha(primaryColor, 0.3),
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: primaryColor,
                      },
                      transition: 'all 0.3s ease',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                      '&:hover': {
                        boxShadow: '0 4px 8px rgba(0,0,0,0.07)',
                      },
                    },
                  }}
                  InputLabelProps={{
                    sx: {
                      color: textColor,
                      '&.Mui-focused': {
                        color: primaryColor,
                      },
                    },
                  }}
                />
              )}
            />

            {requireCouponForCheckin && (
              <Controller
                name="coupon_code"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t('public_checkin.coupon_code')}
                    fullWidth
                    margin="normal"
                    error={!!errors.coupon_code}
                    helperText={errors.coupon_code?.message}
                    placeholder={t('public_checkin.coupon_code_optional')}
                    variant="outlined"
                    InputProps={{
                      sx: {
                        borderRadius: 2,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(0, 0, 0, 0.1)',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: alpha(primaryColor, 0.3),
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: primaryColor,
                        },
                        transition: 'all 0.3s ease',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                        '&:hover': {
                          boxShadow: '0 4px 8px rgba(0,0,0,0.07)',
                        },
                      },
                    }}
                    InputLabelProps={{
                      sx: {
                        color: textColor,
                        '&.Mui-focused': {
                          color: primaryColor,
                        },
                      },
                    }}
                  />
                )}
              />
            )}

            {requiresTable && (
              <Controller
                name="table_number"
                control={control}
                rules={{ required: t('public_checkin.table_number_required') }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t('public_checkin.table_number')}
                    fullWidth
                    margin="normal"
                    error={!!errors.table_number}
                    helperText={errors.table_number?.message}
                    variant="outlined"
                    InputProps={{
                      sx: {
                        borderRadius: 2,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(0, 0, 0, 0.1)',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: alpha(primaryColor, 0.3),
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: primaryColor,
                        },
                        transition: 'all 0.3s ease',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                        '&:hover': {
                          boxShadow: '0 4px 8px rgba(0,0,0,0.07)',
                        },
                      },
                    }}
                    InputLabelProps={{
                      sx: {
                        color: textColor,
                        '&.Mui-focused': {
                          color: primaryColor,
                        },
                      },
                    }}
                  />
                )}
              />
            )}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={publicCheckinMutation.isLoading || validateCouponMutation.isLoading}
              sx={{
                mt: 4,
                py: 1.8,
                fontSize: { xs: '1rem', md: '1.1rem' },
                borderRadius: 3,
                boxShadow: `0px 8px 20px ${alpha(primaryColor, 0.3)}`,
                backgroundColor: primaryColor,
                color: textColor,
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: `0px 10px 25px ${alpha(primaryColor, 0.4)}`,
                  transform: 'translateY(-2px)',
                  backgroundColor: primaryColor,
                },
                '&:active': {
                  transform: 'translateY(1px)',
                },
              }}
            >
              {publicCheckinMutation.isLoading || validateCouponMutation.isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span>{t('public_checkin.checkin_button')}</span>
                </Box>
              )}
            </Button>

            <Box
              textAlign="center"
              mt={4}
              sx={{ opacity: 0.8, transition: 'opacity 0.3s ease', '&:hover': { opacity: 1 } }}
            >
              <Typography
                variant="caption"
                color={textColor}
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <span>{t('public_checkin.powered_by_text')}</span>
                <span style={{ fontWeight: 'bold', color: primaryColor }}>
                  {t('public_checkin.powered_by_feedback_system')}
                </span>
              </Typography>
            </Box>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default PublicCheckin;
