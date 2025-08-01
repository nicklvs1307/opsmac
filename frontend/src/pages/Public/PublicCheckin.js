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
  const [restaurantLogo, setRestaurantLogo] = useState('');
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
        setRestaurantLogo(response.data.logo); // Corrigido para response.data.logo
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

      const { reward_earned } = response.data;

      if (reward_earned) {
        if (reward_earned.reward_type === 'spin_the_wheel') {
          // Se a recompensa for uma roleta, redireciona para a página da roleta
          navigate('/girar-roleta', { state: { reward_earned } });
        } else {
          // Se for outra recompensa, redireciona para a página de recompensa ganha
          navigate('/recompensa-ganha', { state: { reward_earned } });
        }
      } else {
        // Caso contrário, redireciona para a página de agradecimento
        navigate('/thank-you', { state: { message: t('public_checkin.checkin_thank_you_message') } });
      }

      toast.success(t('public_checkin.checkin_success'));
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
    <Box sx={{ 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)', // Gradiente suave para melhor aparência
      py: { xs: 4, sm: 6, md: 8 },
      px: 2, // Padding horizontal para mobile
    }}>
      {/* Logo ou ícone do restaurante */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
        {restaurantLogo ? (
          <img 
            src={restaurantLogo} 
            alt="Restaurant Logo" 
            style={{ 
              height: '70px', 
              width: 'auto',
              filter: 'drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.15))'
            }} 
          />
        ) : (
          <img 
            src="/logo192.png" 
            alt="Default Logo" 
            style={{ 
              height: '70px', 
              width: 'auto',
              filter: 'drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.15))'
            }} 
          />
        )}
      </Box>
      
      <Container maxWidth="sm">
        <Paper elevation={0} sx={{ 
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
            background: 'linear-gradient(90deg, #3f51b5, #2196f3)', // Barra colorida no topo
            zIndex: 1,
          },
          backdropFilter: 'blur(10px)', // Efeito de vidro fosco
        }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography 
              variant="h4" 
              component="h1" 
              gutterBottom
              sx={{ 
                fontWeight: 800, 
                background: 'linear-gradient(45deg, #3f51b5 30%, #2196f3 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2,
                fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' }, // Responsivo
                letterSpacing: '-0.5px',
              }}
            >
              {t('public_checkin.welcome_to')} {restaurantName || t('public_checkin.our_restaurant')}
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary"
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
                variant="outlined"
                InputProps={{
                  sx: {
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(0, 0, 0, 0.1)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(63, 81, 181, 0.3)',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#3f51b5',
                    },
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    '&:hover': {
                      boxShadow: '0 4px 8px rgba(0,0,0,0.07)',
                    },
                  }
                }}
                InputLabelProps={{
                  sx: {
                    color: 'text.secondary',
                    '&.Mui-focused': {
                      color: '#3f51b5',
                    },
                  }
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
                      borderColor: 'rgba(63, 81, 181, 0.3)',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#3f51b5',
                    },
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    '&:hover': {
                      boxShadow: '0 4px 8px rgba(0,0,0,0.07)',
                    },
                  }
                }}
                InputLabelProps={{
                  sx: {
                    color: 'text.secondary',
                    '&.Mui-focused': {
                      color: '#3f51b5',
                    },
                  }
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
                    borderColor: 'rgba(63, 81, 181, 0.3)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#3f51b5',
                  },
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  '&:hover': {
                    boxShadow: '0 4px 8px rgba(0,0,0,0.07)',
                  },
                }
              }}
              InputLabelProps={{
                sx: {
                  color: 'text.secondary',
                  '&.Mui-focused': {
                    color: '#3f51b5',
                  },
                }
              }}
            />
          )}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={loading}
          sx={{ 
            mt: 4, 
            py: 1.8, 
            fontSize: { xs: '1rem', md: '1.1rem' }, 
            borderRadius: 3, 
            boxShadow: '0px 8px 20px rgba(63, 81, 181, 0.3)', 
            background: 'linear-gradient(45deg, #3f51b5 30%, #2196f3 90%)',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0px 10px 25px rgba(63, 81, 181, 0.4)',
              transform: 'translateY(-2px)'
            },
            '&:active': {
              transform: 'translateY(1px)'
            }
          }}
        >
          {loading ? 
            <CircularProgress size={24} color="inherit" /> : 
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span>{t('public_checkin.checkin_button')}</span>
            </Box>
          }
        </Button>
        
        <Box textAlign="center" mt={4} sx={{ opacity: 0.8, transition: 'opacity 0.3s ease', '&:hover': { opacity: 1 } }}>
          <Typography variant="caption" color="text.disabled" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <span>Powered by</span> 
            <span style={{ fontWeight: 'bold', background: 'linear-gradient(45deg, #3f51b5 30%, #2196f3 90%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Sistema de Feedback
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
