import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  Rating,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  Container,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Fade,
  Zoom,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  Restaurant as RestaurantIcon,
  Star as StarIcon,
  Send as SendIcon,
  CheckCircle as CheckCircleIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  ErrorOutline as ErrorOutlineIcon,
  ArrowBack as ArrowBackIcon,
  Comment as CommentIcon,
  NavigateNext as NavigateNextIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import toast from 'react-hot-toast';

const PublicFeedback = () => {
  const { qrId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [error, setError] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      rating: 0,
      comment: '',
      feedback_type: '',
      customer_name: '',
      customer_email: '',
      customer_phone: '',
      table_number: '',
      visit_date: new Date().toISOString().split('T')[0],
    },
  });

  const rating = watch('rating');

  useEffect(() => {
    if (qrId) {
      fetchQRCode();
    } else {
      setError('QR Code inválido');
      setLoading(false);
    }
  }, [qrId, fetchQRCode]);

  useEffect(() => {
    // Auto-determine feedback type based on rating
    if (rating > 0) {
      let type = '';
      if (rating >= 4) {
        type = 'positive';
      } else if (rating >= 3) {
        type = 'neutral';
      } else {
        type = 'negative';
      }
      setValue('feedback_type', type);
    }
  }, [rating, setValue]);

  const fetchQRCode = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axiosInstance.get(`/api/qr-codes/public/${qrId}`);
      
      if (!response.data.qrCode.is_active) {
        setError('Este QR Code não está mais ativo');
        return;
      }
      
      if (response.data.qrCode.expires_at && new Date(response.data.qrCode.expires_at) < new Date()) {
        setError('Este QR Code expirou');
        return;
      }
      
      setQrCode(response.data.qrCode);
      setRestaurant(response.data.restaurant);
      
      // Set table number if available
      if (response.data.qrCode.table_number) {
        setValue('table_number', response.data.qrCode.table_number);
      }
      
      // Track QR code scan
      await axiosInstance.post(`/api/qr-codes/${qrId}/scan`);
    } catch (err) {
      console.error('Error fetching QR code:', err);
      setError(err.response?.data?.message || 'QR Code não encontrado');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      
      const feedbackData = {
        ...data,
        qr_code_id: qrCode.id,
        restaurant_id: restaurant.id,
        source: 'qr_code',
      };
      
      await axiosInstance.post('/api/feedback/public', feedbackData);
      
      setSubmitted(true);
      
      // Redirect to thank you page after 3 seconds
      setTimeout(() => {
        navigate('/obrigado', { 
          state: { 
            restaurant: restaurant.name,
            rating: data.rating 
          } 
        });
      }, 3000);
    } catch (err) {
      console.error('Error submitting feedback:', err);
      toast.error(err.response?.data?.message || 'Erro ao enviar feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const getRatingLabel = (value) => {
    switch (value) {
      case 1: return 'Muito Ruim';
      case 2: return 'Ruim';
      case 3: return 'Regular';
      case 4: return 'Bom';
      case 5: return 'Excelente';
      default: return '';
    }
  };

  const getRatingColor = (value) => {
    if (value >= 4) return 'success.main';
    if (value >= 3) return 'warning.main';
    return 'error.main';
  };

  const steps = [
    {
      label: 'Avaliação',
      description: 'Como foi sua experiência?',
    },
    {
      label: 'Comentário',
      description: 'Conte-nos mais detalhes',
    },
    {
      label: 'Seus Dados',
      description: 'Para podermos responder',
    },
  ];

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box 
          display="flex" 
          flexDirection="column"
          justifyContent="center" 
          alignItems="center" 
          minHeight="70vh"
          gap={3}
        >
          <CircularProgress 
            size={70} 
            thickness={4}
            sx={{ 
              color: 'primary.main',
              boxShadow: '0 0 20px rgba(25, 118, 210, 0.2)',
              borderRadius: '50%',
              p: 1
            }} 
          />
          <Typography 
            variant="h6" 
            color="text.secondary"
            sx={{ 
              fontWeight: 500,
              animation: 'pulse 1.5s infinite',
              '@keyframes pulse': {
                '0%': { opacity: 0.6 },
                '50%': { opacity: 1 },
                '100%': { opacity: 0.6 }
              }
            }}
          >
            Carregando...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Box 
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          minHeight="70vh"
          px={2}
        >
          <Paper
            elevation={3}
            sx={{ 
              p: { xs: 3, md: 4 },
              borderRadius: 3,
              width: '100%',
              maxWidth: 500,
              textAlign: 'center',
              overflow: 'hidden',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #f44336, #ff9800)',
              }
            }}
          >
            <Box 
              sx={{ 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                mb: 3
              }}
            >
              <Avatar 
                sx={{ 
                  bgcolor: 'error.light', 
                  width: 70, 
                  height: 70,
                  mb: 2,
                  boxShadow: '0 4px 14px rgba(244, 67, 54, 0.3)'
                }}
              >
                <ErrorOutlineIcon sx={{ fontSize: 40, color: 'white' }} />
              </Avatar>
              <Typography 
                variant="h5" 
                gutterBottom
                sx={{ fontWeight: 600, color: 'error.main' }}
              >
                Oops! Ocorreu um erro
              </Typography>
            </Box>
            
            <Alert 
              severity="error" 
              variant="outlined"
              sx={{ 
                mb: 3,
                borderRadius: 2,
                '& .MuiAlert-icon': {
                  fontSize: '1.5rem'
                }
              }}
            >
              {error}
            </Alert>
            
            <Button 
              variant="contained" 
              onClick={() => window.history.back()}
              startIcon={<ArrowBackIcon />}
              sx={{ 
                borderRadius: 2,
                px: 3,
                py: 1,
                bgcolor: 'error.main',
                boxShadow: '0 4px 10px rgba(244, 67, 54, 0.3)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: 'error.dark',
                  boxShadow: '0 6px 15px rgba(244, 67, 54, 0.4)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              Voltar
            </Button>
          </Paper>
        </Box>
      </Container>
    );
  }

  if (submitted) {
    return (
      <Container maxWidth="md">
        <Box 
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          minHeight="70vh"
          px={2}
        >
          <Fade in={submitted} timeout={800}>
            <Paper
              elevation={3}
              sx={{ 
                p: { xs: 4, md: 5 },
                borderRadius: 3,
                width: '100%',
                maxWidth: 500,
                textAlign: 'center',
                overflow: 'hidden',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: 'linear-gradient(90deg, #4caf50, #8bc34a)',
                }
              }}
            >
              <Box 
                sx={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  mb: 3
                }}
              >
                <Zoom in={submitted} timeout={1000} style={{ transitionDelay: '300ms' }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: 'success.light', 
                      width: 90, 
                      height: 90,
                      mb: 3,
                      boxShadow: '0 6px 20px rgba(76, 175, 80, 0.3)',
                      animation: 'pulse 2s infinite',
                      '@keyframes pulse': {
                        '0%': { boxShadow: '0 0 0 0 rgba(76, 175, 80, 0.4)' },
                        '70%': { boxShadow: '0 0 0 15px rgba(76, 175, 80, 0)' },
                        '100%': { boxShadow: '0 0 0 0 rgba(76, 175, 80, 0)' }
                      }
                    }}
                  >
                    <CheckCircleIcon sx={{ fontSize: 50, color: 'white' }} />
                  </Avatar>
                </Zoom>
                
                <Fade in={submitted} timeout={1000} style={{ transitionDelay: '500ms' }}>
                  <Typography 
                    variant="h4" 
                    gutterBottom 
                    sx={{ 
                      fontWeight: 600, 
                      color: 'success.main',
                      mb: 2,
                      textShadow: '0 2px 4px rgba(76, 175, 80, 0.2)'
                    }}
                  >
                    Obrigado pelo seu feedback!
                  </Typography>
                </Fade>
                
                <Fade in={submitted} timeout={1000} style={{ transitionDelay: '700ms' }}>
                  <Typography 
                    variant="body1" 
                    color="text.secondary" 
                    gutterBottom
                    sx={{ 
                      fontSize: '1.1rem',
                      mb: 3,
                      maxWidth: '80%',
                      mx: 'auto'
                    }}
                  >
                    Sua opinião é muito importante para nós.
                  </Typography>
                </Fade>
                
                <Fade in={submitted} timeout={1000} style={{ transitionDelay: '900ms' }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 1,
                      bgcolor: 'rgba(76, 175, 80, 0.08)',
                      borderRadius: 2,
                      p: 1.5,
                      width: 'fit-content'
                    }}
                  >
                    <CircularProgress 
                      size={20} 
                      thickness={5}
                      sx={{ color: 'success.main' }} 
                    />
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ fontWeight: 500 }}
                    >
                      Redirecionando...
                    </Typography>
                  </Box>
                </Fade>
              </Box>
            </Paper>
          </Fade>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box py={4}>
        {/* Restaurant Header */}
        <Card 
          elevation={0}
          sx={{ 
            mb: 4, 
            background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)', 
            color: 'white',
            borderRadius: 3,
            overflow: 'hidden',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              right: 0,
              width: '40%',
              height: '100%',
              background: 'rgba(255,255,255,0.1)',
              clipPath: 'polygon(100% 0, 0 0, 100% 100%)',
            }
          }}
        >
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Box display="flex" alignItems="center" gap={3} flexWrap={{ xs: 'wrap', sm: 'nowrap' }}>
              <Avatar 
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  width: { xs: 60, md: 80 }, 
                  height: { xs: 60, md: 80 },
                  boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                }}
              >
                <RestaurantIcon sx={{ fontSize: { xs: 30, md: 40 } }} />
              </Avatar>
              <Box>
                <Typography 
                  variant="h4" 
                  gutterBottom 
                  sx={{ 
                    fontSize: { xs: '1.5rem', md: '2rem' },
                    fontWeight: 600,
                    textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }}
                >
                  {restaurant?.name}
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    opacity: 0.9,
                    fontSize: { xs: '0.95rem', md: '1.1rem' },
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 0.5
                  }}
                >
                  <Chip 
                    label={restaurant?.cuisine_type} 
                    size="small" 
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      fontWeight: 500
                    }} 
                  />
                </Typography>
                {qrCode?.location && (
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      opacity: 0.8,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5
                    }}
                  >
                    <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                      {qrCode.location}
                    </Box>
                    {qrCode.table_number && (
                      <Chip 
                                                                label={t('public_feedback.table_prefix') + ` ${qrCode.table_number}`} 
                        size="small" 
                        sx={{ 
                          bgcolor: 'rgba(255,255,255,0.15)',
                          color: 'white',
                          fontWeight: 500,
                          height: 24,
                          '& .MuiChip-label': { px: 1 }
                        }} 
                      />
                    )}
                  </Typography>
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Feedback Form */}
        <Paper 
          elevation={2}
          sx={{ 
            p: { xs: 3, md: 4 },
            borderRadius: 3,
            boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
            overflow: 'hidden',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #1976d2, #42a5f5)',
            }
          }}
        >
          <Typography 
            variant="h5" 
            gutterBottom 
            textAlign="center"
            sx={{
              fontWeight: 600,
              mb: 3,
              color: 'text.primary',
              position: 'relative',
              display: 'inline-block',
              left: '50%',
              transform: 'translateX(-50%)',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -8,
                left: '10%',
                width: '80%',
                height: '3px',
                background: 'linear-gradient(90deg, transparent, rgba(25, 118, 210, 0.5), transparent)',
                borderRadius: '50%',
              }
            }}
          >
            Conte-nos sobre sua experiência
          </Typography>
          
          <Stepper 
            activeStep={activeStep} 
            orientation="vertical" 
            sx={{ 
              mb: 4,
              '& .MuiStepLabel-root': {
                padding: { xs: '12px 0', md: '16px 0' },
              },
              '& .MuiStepIcon-root': {
                fontSize: { xs: 28, md: 32 },
                color: 'primary.main',
                '&.Mui-active': {
                  color: 'primary.main',
                  filter: 'drop-shadow(0 2px 4px rgba(25, 118, 210, 0.4))',
                },
                '&.Mui-completed': {
                  color: '#4caf50',
                }
              },
              '& .MuiStepLabel-label': {
                fontSize: { xs: '1rem', md: '1.1rem' },
                fontWeight: 500,
                '&.Mui-active': {
                  fontWeight: 600,
                }
              },
              '& .MuiStepContent-root': {
                borderLeft: '2px solid rgba(25, 118, 210, 0.3)',
                marginLeft: '16px',
                paddingLeft: { xs: '16px', md: '24px' },
                transition: 'all 0.3s ease',
              }
            }}
          >
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel>
                  <Typography variant="h6">{step.label}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {step.description}
                  </Typography>
                </StepLabel>
                <StepContent>
                  {index === 0 && (
                    <Box textAlign="center" py={3}>
                      <Typography variant="h6" gutterBottom>
                        Como você avalia nossa experiência?
                      </Typography>
                      <Controller
                        name="rating"
                        control={control}
                        rules={{ required: 'Por favor, selecione uma avaliação' }}
                        render={({ field }) => (
                          <Box>
                            <Rating
                              {...field}
                              size="large"
                              sx={{ fontSize: '3rem', mb: 2 }}
                            />
                            {rating > 0 && (
                              <Typography
                                variant="h6"
                                sx={{ color: getRatingColor(rating) }}
                              >
                                {getRatingLabel(rating)}
                              </Typography>
                            )}
                            {errors.rating && (
                              <Typography color="error" variant="body2">
                                {errors.rating.message}
                              </Typography>
                            )}
                          </Box>
                        )}
                      />
                      <Box mt={3}>
                        <Button
                          variant="contained"
                          onClick={handleNext}
                          disabled={!rating}
                        >
                          Continuar
                        </Button>
                      </Box>
                    </Box>
                  )}
                  
                  {index === 1 && (
                    <Box 
                      py={3}
                      sx={{
                        '& .MuiTextField-root': {
                          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                          }
                        }
                      }}
                    >
                      <Fade in={true} timeout={500}>
                        <Box>
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              mb: 2, 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 1,
                              color: 'text.secondary',
                              fontWeight: 500
                            }}
                          >
                            <CommentIcon color="primary" fontSize="small" />
                            Compartilhe detalhes sobre sua experiência
                          </Typography>
                          
                          <Controller
                            name="comment"
                            control={control}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                label="Comentário (opcional)"
                                multiline
                                rows={4}
                                fullWidth
                                placeholder="Conte-nos mais sobre sua experiência..."
                                sx={{ 
                                  mb: 3,
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    transition: 'all 0.3s ease',
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                      borderColor: 'primary.main',
                                      borderWidth: '1px',
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                      borderColor: 'primary.main',
                                      borderWidth: '2px',
                                      boxShadow: '0 0 0 3px rgba(25, 118, 210, 0.1)'
                                    }
                                  }
                                }}
                                InputProps={{
                                  sx: {
                                    '&::placeholder': {
                                      fontStyle: 'italic',
                                      opacity: 0.7
                                    }
                                  }
                                }}
                              />
                            )}
                          />
                          
                          <Box 
                            display="flex" 
                            gap={2}
                            sx={{ 
                              justifyContent: { xs: 'center', sm: 'flex-start' },
                              flexWrap: 'wrap'
                            }}
                          >
                            <Button 
                              onClick={handleBack}
                              startIcon={<ArrowBackIcon />}
                              variant="outlined"
                              sx={{ 
                                borderRadius: 2,
                                px: 3,
                                py: 1,
                                borderColor: 'primary.main',
                                color: 'primary.main',
                                '&:hover': {
                                  borderColor: 'primary.dark',
                                  backgroundColor: 'rgba(25, 118, 210, 0.04)'
                                }
                              }}
                            >
                              Voltar
                            </Button>
                            <Button 
                              variant="contained" 
                              onClick={handleNext}
                              endIcon={<NavigateNextIcon />}
                              sx={{ 
                                borderRadius: 2,
                                px: 3,
                                py: 1,
                                boxShadow: '0 4px 10px rgba(25, 118, 210, 0.3)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  boxShadow: '0 6px 15px rgba(25, 118, 210, 0.4)',
                                  transform: 'translateY(-2px)'
                                }
                              }}
                            >
                              Continuar
                            </Button>
                          </Box>
                        </Box>
                      </Fade>
                    </Box>
                  )}
                  
                  {index === 2 && (
                    <Box 
                      py={3}
                      sx={{
                        '& .MuiTextField-root': {
                          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                          }
                        }
                      }}
                    >
                      <Fade in={true} timeout={500}>
                        <Box>
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              mb: 3, 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 1,
                              color: 'text.secondary',
                              fontWeight: 500,
                              bgcolor: 'rgba(25, 118, 210, 0.04)',
                              p: 2,
                              borderRadius: 2,
                              border: '1px dashed rgba(25, 118, 210, 0.3)'
                            }}
                          >
                            <InfoIcon color="primary" fontSize="small" />
                            Para que possamos responder ao seu feedback (opcional)
                          </Typography>
                          
                          <Grid container spacing={3} sx={{ mb: 3 }}>
                            <Grid item xs={12} md={6}>
                              <Zoom in={true} style={{ transitionDelay: '100ms' }}>
                                <Box>
                                  <Controller
                                    name="customer_name"
                                    control={control}
                                    render={({ field }) => (
                                      <TextField
                                        {...field}
                                        label="Seu Nome"
                                        fullWidth
                                        variant="outlined"
                                        sx={{ 
                                          '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            transition: 'all 0.3s ease',
                                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                              borderColor: 'primary.main',
                                              borderWidth: '1px',
                                            },
                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                              borderColor: 'primary.main',
                                              borderWidth: '2px',
                                              boxShadow: '0 0 0 3px rgba(25, 118, 210, 0.1)'
                                            }
                                          }
                                        }}
                                        InputProps={{
                                          startAdornment: (
                                            <Box 
                                              sx={{ 
                                                mr: 1, 
                                                color: 'primary.main',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                bgcolor: 'rgba(25, 118, 210, 0.08)',
                                                borderRadius: '50%',
                                                width: 32,
                                                height: 32
                                              }}
                                            >
                                              <PersonIcon fontSize="small" />
                                            </Box>
                                          ),
                                        }}
                                      />
                                    )}
                                  />
                                </Box>
                              </Zoom>
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <Zoom in={true} style={{ transitionDelay: '200ms' }}>
                                <Box>
                                  <Controller
                                    name="customer_email"
                                    control={control}
                                    rules={{
                                      pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: 'Email inválido',
                                      },
                                    }}
                                    render={({ field }) => (
                                      <TextField
                                        {...field}
                                        label="Email"
                                        type="email"
                                        fullWidth
                                        error={!!errors.customer_email}
                                        helperText={errors.customer_email?.message}
                                        sx={{ 
                                          '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            transition: 'all 0.3s ease',
                                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                              borderColor: 'primary.main',
                                              borderWidth: '1px',
                                            },
                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                              borderColor: 'primary.main',
                                              borderWidth: '2px',
                                              boxShadow: '0 0 0 3px rgba(25, 118, 210, 0.1)'
                                            },
                                            '&.Mui-error .MuiOutlinedInput-notchedOutline': {
                                              borderColor: 'error.main',
                                              boxShadow: '0 0 0 3px rgba(211, 47, 47, 0.1)'
                                            }
                                          },
                                          '& .MuiFormHelperText-root.Mui-error': {
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 0.5,
                                            mt: 0.5,
                                            mx: 0
                                          }
                                        }}
                                        InputProps={{
                                          startAdornment: (
                                            <Box 
                                              sx={{ 
                                                mr: 1, 
                                                color: 'primary.main',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                bgcolor: 'rgba(25, 118, 210, 0.08)',
                                                borderRadius: '50%',
                                                width: 32,
                                                height: 32
                                              }}
                                            >
                                              <EmailIcon fontSize="small" />
                                            </Box>
                                          ),
                                        }}
                                        FormHelperTextProps={{
                                          children: errors.customer_email?.message && (
                                            <>
                                              <ErrorOutlineIcon fontSize="small" />
                                              {errors.customer_email?.message}
                                            </>
                                          )
                                        }}
                                      />
                                    )}
                                  />
                                </Box>
                              </Zoom>
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <Zoom in={true} style={{ transitionDelay: '300ms' }}>
                                <Box>
                                  <Controller
                                    name="customer_phone"
                                    control={control}
                                    render={({ field }) => (
                                      <TextField
                                        {...field}
                                        label="Telefone"
                                        fullWidth
                                        placeholder="(11) 99999-9999"
                                        sx={{ 
                                          '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            transition: 'all 0.3s ease',
                                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                              borderColor: 'primary.main',
                                              borderWidth: '1px',
                                            },
                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                              borderColor: 'primary.main',
                                              borderWidth: '2px',
                                              boxShadow: '0 0 0 3px rgba(25, 118, 210, 0.1)'
                                            }
                                          }
                                        }}
                                        InputProps={{
                                          startAdornment: (
                                            <Box 
                                              sx={{ 
                                                mr: 1, 
                                                color: 'primary.main',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                bgcolor: 'rgba(25, 118, 210, 0.08)',
                                                borderRadius: '50%',
                                                width: 32,
                                                height: 32
                                              }}
                                            >
                                              <PhoneIcon fontSize="small" />
                                            </Box>
                                          ),
                                        }}
                                      />
                                    )}
                                  />
                                </Box>
                              </Zoom>
                            </Grid>
                          </Grid>
                          
                          <Box 
                            display="flex" 
                            gap={2}
                            sx={{ 
                              justifyContent: { xs: 'center', sm: 'flex-start' },
                              flexWrap: 'wrap',
                              mt: 2
                            }}
                          >
                            <Button 
                              onClick={handleBack}
                              startIcon={<ArrowBackIcon />}
                              variant="outlined"
                              sx={{ 
                                borderRadius: 2,
                                px: 3,
                                py: 1,
                                borderColor: 'primary.main',
                                color: 'primary.main',
                                '&:hover': {
                                  borderColor: 'primary.dark',
                                  backgroundColor: 'rgba(25, 118, 210, 0.04)'
                                }
                              }}
                            >
                              Voltar
                            </Button>
                            <Button
                              variant="contained"
                              startIcon={<SendIcon />}
                              onClick={handleSubmit(onSubmit)}
                              disabled={submitting}
                              size="large"
                              sx={{ 
                                borderRadius: 2,
                                px: 3,
                                py: 1,
                                boxShadow: '0 4px 10px rgba(25, 118, 210, 0.3)',
                                transition: 'all 0.3s ease',
                                bgcolor: submitting ? 'primary.light' : 'primary.main',
                                '&:hover': {
                                  boxShadow: '0 6px 15px rgba(25, 118, 210, 0.4)',
                                  transform: 'translateY(-2px)',
                                  bgcolor: 'primary.dark'
                                }
                              }}
                            >
                              {submitting ? (
                                <CircularProgress size={20} color="inherit" />
                              ) : (
                                'Enviar Feedback'
                              )}
                            </Button>
                          </Box>
                        </Box>
                      </Fade>
                    </Box>
                  )}
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </Paper>
        
        {/* Footer */}
        <Box textAlign="center" mt={4}>
          <Typography variant="body2" color="text.secondary">
            {t('public_feedback.powered_by')}
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default PublicFeedback;