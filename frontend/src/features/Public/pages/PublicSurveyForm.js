import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  FormGroup,
  Rating,
  CircularProgress,
  Alert,
  Container,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton,
  Slider,
  alpha,
  LinearProgress,
  Modal,
} from '@mui/material';

import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Restaurant as RestaurantIcon } from '@mui/icons-material';
import {
  useGetPublicSurvey,
  useSubmitSurveyResponse,
  useLinkCustomerToResponse,
} from '../api/publicService';
import { useLoginCustomer, useRegisterCustomer } from '@/features/Auth/api/authService';

// Modal Component for Customer Identification
const IdentifyCustomerModal = ({ open, onClose, onIdentified, responseId, restaurantId }) => {
  const { t } = useTranslation();
  const [view, setView] = useState('initial');
  const [formData, setFormData] = useState({ email: '', password: '', name: '', phone: '' });
  const loginMutation = useLoginCustomer();
  const registerMutation = useRegisterCustomer();

  useEffect(() => {
    if (open) {
      setView('initial');
      setFormData({ email: '', password: '', name: '', phone: '' });
    }
  }, [open]);

  const handleFormChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLogin = (e) => {
    e.preventDefault();
    loginMutation.mutate(formData, {
      onSuccess: (data) => {
        const customerId = data.user?.id;
        if (data.user?.role === 'customer' && customerId) {
          onIdentified(customerId);
        } else {
          toast.error(t('public_survey.login_failed_not_customer'));
        }
      },
    });
  };

  const handleRegister = (e) => {
    e.preventDefault();
    registerMutation.mutate(
      { ...formData, restaurant_id: restaurantId },
      {
        onSuccess: (data) => {
          const customerId = data.customer?.id;
          if (customerId) {
            onIdentified(customerId);
          } else {
            toast.error(t('public_survey.registration_failed'));
          }
        },
      }
    );
  };

  const renderInitialView = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        {t('public_survey.identify_modal_title')}
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        {t('public_survey.identify_modal_subtitle')}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Button variant="contained" onClick={() => setView('login')}>
          {t('public_survey.identify_modal_login_button')}
        </Button>
        <Button variant="outlined" onClick={() => setView('register')}>
          {t('public_survey.identify_modal_register_button')}
        </Button>
        <Button onClick={onClose} sx={{ mt: 2 }}>
          {t('public_survey.identify_modal_no_thanks_button')}
        </Button>
      </Box>
    </Box>
  );

  const renderLoginView = () => (
    <form onSubmit={handleLogin}>
      <Typography variant="h6" gutterBottom>
        {t('public_survey.login_title')}
      </Typography>
      <TextField
        fullWidth
        label={t('common.email')}
        name="email"
        type="email"
        value={formData.email}
        onChange={handleFormChange}
        margin="normal"
        required
      />
      <TextField
        fullWidth
        label={t('common.password')}
        name="password"
        type="password"
        value={formData.password}
        onChange={handleFormChange}
        margin="normal"
        required
      />
      {loginMutation.isError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {loginMutation.error.response?.data?.msg || t('public_survey.login_failed')}
        </Alert>
      )}
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button onClick={() => setView('initial')}>{t('common.back')}</Button>
        <Button type="submit" variant="contained" disabled={loginMutation.isLoading}>
          {loginMutation.isLoading ? <CircularProgress size={24} /> : t('common.login')}
        </Button>
      </Box>
    </form>
  );

  const renderRegisterView = () => (
    <form onSubmit={handleRegister}>
      <Typography variant="h6" gutterBottom>
        {t('public_survey.register_title')}
      </Typography>
      <TextField
        fullWidth
        label={t('common.name')}
        name="name"
        value={formData.name}
        onChange={handleFormChange}
        margin="normal"
        required
      />
      <TextField
        fullWidth
        label={t('common.email')}
        name="email"
        type="email"
        value={formData.email}
        onChange={handleFormChange}
        margin="normal"
        required
      />
      <TextField
        fullWidth
        label={t('common.phone')}
        name="phone"
        value={formData.phone}
        onChange={handleFormChange}
        margin="normal"
        required
      />
      {registerMutation.isError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {registerMutation.error.response?.data?.errors[0]?.msg ||
            registerMutation.error.response?.data?.msg ||
            t('public_survey.registration_failed')}
        </Alert>
      )}
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button onClick={() => setView('initial')}>{t('common.back')}</Button>
        <Button type="submit" variant="contained" disabled={registerMutation.isLoading}>
          {registerMutation.isLoading ? <CircularProgress size={24} /> : t('common.register')}
        </Button>
      </Box>
    </form>
  );

  return (
    <Modal open={open} onClose={onClose}>
      <Paper
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: 400 },
          p: 4,
          bgcolor: 'background.paper',
          borderRadius: 2,
        }}
      >
        {view === 'initial' && renderInitialView()}
        {view === 'login' && renderLoginView()}
        {view === 'register' && renderRegisterView()}
      </Paper>
    </Modal>
  );
};

const PublicSurveyForm = () => {
  const { t } = useTranslation();
  const { restaurantSlug, surveySlug, customerId } = useParams();
  const navigate = useNavigate();

  const {
    data: surveyData,
    isLoading,
    isError,
    error,
  } = useGetPublicSurvey(restaurantSlug, surveySlug);
  const submitSurveyMutation = useSubmitSurveyResponse(surveySlug);
  const linkCustomerMutation = useLinkCustomerToResponse();

  const [answers, setAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showThankYouScreen, setShowThankYouScreen] = useState(false);
  const [generatedCoupon, setGeneratedCoupon] = useState(null);
  const [showIdentifyModal, setShowIdentifyModal] = useState(false);
  const [anonymousResponseId, setAnonymousResponseId] = useState(null);

  const survey = surveyData?.survey;
  const restaurantData = surveyData?.restaurant;

  const primaryColor =
    restaurantData?.settings?.survey_program_settings?.primary_color || '#E31837';
  const textColor = restaurantData?.settings?.survey_program_settings?.text_color || '#333333';
  const accentColor = restaurantData?.settings?.survey_program_settings?.accent_color || '#4CAF50';

  useEffect(() => {
    if (survey) {
      const initialAnswers = {};
      survey.questions.forEach((q) => {
        initialAnswers[q.id] = q.question_type === 'checkboxes' ? [] : '';
      });
      setAnswers(initialAnswers);
    }
  }, [survey]);

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleCheckboxChange = (questionId, optionValue) => {
    setAnswers((prev) => {
      const currentAnswers = prev[questionId] || [];
      if (currentAnswers.includes(optionValue)) {
        return { ...prev, [questionId]: currentAnswers.filter((item) => item !== optionValue) };
      } else {
        return { ...prev, [questionId]: [...currentAnswers, optionValue] };
      }
    });
  };

  const handleReward = (reward) => {
    if (!reward) {
      setShowThankYouScreen(true);
      return;
    }
    if (reward.type === 'spin_the_wheel') {
      navigate('/girar-roleta', {
        state: { fromSurvey: true, responseId: anonymousResponseId || survey.id },
      });
    } else if (reward.type === 'coupon') {
      setGeneratedCoupon(reward.details);
      setShowThankYouScreen(true);
    } else {
      setShowThankYouScreen(true);
    }
  };

  const handleSubmit = () => {
    const formattedAnswers = Object.keys(answers).map((questionId) => ({
      question_id: questionId,
      answer_value: Array.isArray(answers[questionId])
        ? answers[questionId].join(',')
        : answers[questionId],
    }));
    const payload = { answers: formattedAnswers };
    if (customerId) payload.customer_id = customerId;

    submitSurveyMutation.mutate(payload, {
      onSuccess: (data) => {
        const { reward, responseId } = data;
        if (customerId && reward) {
          handleReward(reward);
        } else if (!customerId && survey.reward) {
          setAnonymousResponseId(responseId);
          setShowIdentifyModal(true);
        } else {
          setShowThankYouScreen(true);
        }
      },
    });
  };

  const handleCustomerIdentified = (newCustomerId) => {
    linkCustomerMutation.mutate(newCustomerId, {
      onSuccess: (data) => {
        setShowIdentifyModal(false);
        handleReward(data.reward);
      },
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < survey.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  if (isLoading)
    return (
      <Container maxWidth="md">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  if (isError)
    return (
      <Container maxWidth="md">
        <Box textAlign="center" py={8}>
          <Alert severity="error">
            {error.message || t('public_survey.survey_not_found_or_inactive')}
          </Alert>
          <Button variant="contained" onClick={() => navigate('/')}>
            {t('common.back_to_home')}
          </Button>
        </Box>
      </Container>
    );
  if (!survey || !restaurantData) return null;

  if (showThankYouScreen) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)',
          py: { xs: 4, sm: 6, md: 8 },
          px: 2,
        }}
      >
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
          <img
            src="/logo192.png"
            alt="Logo"
            style={{
              height: '70px',
              width: 'auto',
              filter: 'drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.15))',
            }}
          />
        </Box>

        <Container maxWidth="md">
          <Box py={4}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
              <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
              <Typography variant="h4" gutterBottom>
                {t('thank_you.title')}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                {generatedCoupon
                  ? t('thank_you.coupon_message', { couponCode: generatedCoupon.code })
                  : t('thank_you.default_message')}
              </Typography>
              {generatedCoupon && (
                <Box sx={{ bgcolor: 'success.light', p: 2, borderRadius: 2, mb: 3 }}>
                  <Typography variant="h6" color="success.dark">
                    {generatedCoupon.code}
                  </Typography>
                  <Typography variant="body2" color="success.dark">
                    {generatedCoupon.description}
                  </Typography>
                </Box>
              )}
              <Button variant="contained" onClick={() => navigate('/')}>
                {t('common.back_to_home')}
              </Button>
            </Paper>
          </Box>

          <Box
            textAlign="center"
            mt={4}
            sx={{ opacity: 0.8, transition: 'opacity 0.3s ease', '&:hover': { opacity: 1 } }}
          >
            <Typography
              variant="caption"
              color="text.disabled"
              sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}
            >
              <span>Powered by</span>
              <span
                style={{
                  fontWeight: 'bold',
                  background: 'linear-gradient(45deg, #3f51b5 30%, #2196f3 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Sistema de Feedback
              </span>
            </Typography>
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box>
      <IdentifyCustomerModal
        open={showIdentifyModal}
        onClose={() => {
          setShowIdentifyModal(false);
          setShowThankYouScreen(true);
        }}
        onIdentified={handleCustomerIdentified}
        responseId={anonymousResponseId}
        restaurantId={restaurantData?.id}
      />

      {/* Header Estilizado */}
      <Box
        sx={{
          background: '#FFFFFF', // var(--light)
          paddingTop: '60px',
          position: 'relative',
        }}
      >
        {/* Shape arredondado (cápsula) */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '120px',
            background: primaryColor, // var(--primary)
            borderBottomLeftRadius: '50% 80%',
            borderBottomRightRadius: '50% 80%',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)', // var(--shadow)
          }}
        ></Box>

        {/* Conteúdo do header */}
        <Box
          sx={{
            position: 'relative',
            zIndex: 2,
            textAlign: 'center',
            padding: '20px 30px 30px',
            color: textColor, // var(--dark)
          }}
        >
          <Box
            sx={{
              width: '80px',
              height: '80px',
              background: '#FFFFFF', // var(--light)
              borderRadius: '50%',
              margin: '-40px auto 15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `4px solid ${accentColor}`, // var(--accent)
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)', // var(--shadow)
            }}
          >
            {restaurantData?.logo ? (
              <img
                src={`${process.env.REACT_APP_API_URL}${restaurantData.logo}`}
                alt={restaurantData.name}
                style={{ width: '60px', height: '60px', borderRadius: '50%' }}
              />
            ) : (
              <RestaurantIcon sx={{ fontSize: 60, color: primaryColor }} />
            )}
          </Box>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              color: primaryColor, // var(--primary)
              fontSize: '28px',
              fontWeight: 700,
              marginBottom: '10px',
            }}
          >
            {restaurantData?.name || survey.title}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontWeight: 300,
              opacity: 0.9,
              maxWidth: '600px',
              margin: '0 auto',
              color: textColor, // var(--dark)
            }}
          >
            {survey.description}
          </Typography>
          <Box
            sx={{
              height: '6px',
              background: 'rgba(0, 0, 0, 0.1)',
              marginTop: '25px',
              borderRadius: '3px',
              overflow: 'hidden',
            }}
          >
            <LinearProgress
              variant="determinate"
              value={((currentQuestionIndex + 1) / survey.questions.length) * 100}
              sx={{
                height: '100%',
                background: primaryColor, // var(--primary)
                transition: 'width 0.3s ease',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: primaryColor,
                },
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* Corpo da Pesquisa */}
      <Container
        maxWidth="md"
        sx={{
          marginTop: '-40px', // Adjust to overlap with the header
          marginBottom: '40px',
          margin: { xs: '0 20px 20px', sm: '0 auto 40px' }, // Responsive margin
        }}
      >
        <Paper
          elevation={0}
          sx={{
            borderRadius: { xs: '0 0 12px 12px', sm: '0 0 16px 16px' }, // Responsive border radius
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)', // var(--shadow)
            overflow: 'hidden',
          }}
        >
          <Box sx={{ padding: '30px' }}>
            {survey.questions && survey.questions.length > 0 && (
              <Box>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: '14px',
                    color: '#adb5bd', // var(--gray)
                    marginBottom: '5px',
                    fontWeight: 500,
                  }}
                >
                  Pergunta {currentQuestionIndex + 1} de {survey.questions.length}
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: '18px',
                    fontWeight: 600,
                    marginBottom: '20px',
                  }}
                >
                  {survey.questions[currentQuestionIndex].question_text}
                </Typography>

                {/* Question types rendering */}
                {survey.questions[currentQuestionIndex].question_type === 'text' && (
                  <TextField
                    fullWidth
                    label={t('public_survey.your_answer')}
                    value={answers[survey.questions[currentQuestionIndex].id] || ''}
                    onChange={(e) =>
                      handleAnswerChange(survey.questions[currentQuestionIndex].id, e.target.value)
                    }
                    sx={{
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '10px',
                        '& fieldset': {
                          borderColor: '#dee2e6', // var(--border)
                        },
                        '&:hover fieldset': {
                          borderColor: primaryColor,
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: primaryColor,
                          boxShadow: `0 0 0 3px ${alpha(primaryColor, 0.2)}`,
                        },
                      },
                      '& .MuiInputBase-input': {
                        padding: '15px',
                        fontSize: '16px',
                      },
                    }}
                  />
                )}
                {survey.questions[currentQuestionIndex].question_type === 'textarea' && (
                  <TextField
                    fullWidth
                    label={t('public_survey.your_answer')}
                    multiline
                    rows={4}
                    value={answers[survey.questions[currentQuestionIndex].id] || ''}
                    onChange={(e) =>
                      handleAnswerChange(survey.questions[currentQuestionIndex].id, e.target.value)
                    }
                    sx={{
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '10px',
                        '& fieldset': {
                          borderColor: '#dee2e6', // var(--border)
                        },
                        '&:hover fieldset': {
                          borderColor: primaryColor,
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: primaryColor,
                          boxShadow: `0 0 0 3px ${alpha(primaryColor, 0.2)}`,
                        },
                      },
                      '& .MuiInputBase-input': {
                        padding: '15px',
                        fontSize: '16px',
                      },
                    }}
                  />
                )}
                {survey.questions[currentQuestionIndex].question_type === 'radio' && (
                  <FormControl component="fieldset" sx={{ mb: 2, width: '100%' }}>
                    <RadioGroup
                      value={answers[survey.questions[currentQuestionIndex].id] || ''}
                      onChange={(e) =>
                        handleAnswerChange(
                          survey.questions[currentQuestionIndex].id,
                          e.target.value
                        )
                      }
                    >
                      {survey.questions[currentQuestionIndex].options?.map((option, optIndex) => (
                        <FormControlLabel
                          key={optIndex}
                          value={option}
                          control={
                            <Radio
                              sx={{ color: primaryColor, '&.Mui-checked': { color: primaryColor } }}
                            />
                          }
                          label={option}
                          sx={{
                            width: '100%',
                            margin: '0 0 15px 0',
                            padding: '15px',
                            background: '#f8f9fa', // var(--light)
                            borderRadius: '10px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            border: '1px solid #dee2e6', // var(--border)
                            '&:hover': {
                              background: `${alpha(primaryColor, 0.1)}`, // primary-light with 10% opacity
                              borderColor: primaryColor,
                            },
                            // This class is applied by MUI when the radio is checked
                            '& .Mui-checked': {
                              background: `${alpha(primaryColor, 0.1)}`,
                              borderColor: primaryColor,
                            },
                          }}
                        />
                      ))}
                    </RadioGroup>
                  </FormControl>
                )}
                {survey.questions[currentQuestionIndex].question_type === 'checkboxes' && (
                  <FormGroup sx={{ mb: 2, width: '100%' }}>
                    {survey.questions[currentQuestionIndex].options?.map((option, optIndex) => (
                      <FormControlLabel
                        key={optIndex}
                        control={
                          <Checkbox
                            checked={(
                              answers[survey.questions[currentQuestionIndex].id] || []
                            ).includes(option)}
                            onChange={() =>
                              handleCheckboxChange(
                                survey.questions[currentQuestionIndex].id,
                                option
                              )
                            }
                            sx={{ color: primaryColor, '&.Mui-checked': { color: primaryColor } }}
                          />
                        }
                        label={option}
                        sx={{
                          width: '100%',
                          margin: '0 0 15px 0',
                          padding: '15px',
                          background: '#f8f9fa', // var(--light)
                          borderRadius: '10px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          border: '1px solid #dee2e6', // var(--border)
                          '&:hover': {
                            background: `${alpha(primaryColor, 0.1)}`,
                            borderColor: primaryColor,
                          },
                          // This class is applied by MUI when the checkbox is checked
                          '& .Mui-checked': {
                            background: `${alpha(primaryColor, 0.1)}`,
                            borderColor: primaryColor,
                          },
                        }}
                      />
                    ))}
                  </FormGroup>
                )}
                {survey.questions[currentQuestionIndex].question_type === 'dropdown' && (
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>{t('public_survey.select_option')}</InputLabel>
                    <Select
                      value={answers[survey.questions[currentQuestionIndex].id] || ''}
                      label={t('public_survey.select_option')}
                      onChange={(e) =>
                        handleAnswerChange(
                          survey.questions[currentQuestionIndex].id,
                          e.target.value
                        )
                      }
                    >
                      {survey.questions[currentQuestionIndex].options?.map((option, optIndex) => (
                        <MenuItem key={optIndex} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
                {survey.questions[currentQuestionIndex].question_type === 'ratings' && (
                  <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center', width: '100%' }}>
                    <Rating
                      name="simple-controlled"
                      value={parseInt(answers[survey.questions[currentQuestionIndex].id]) || 0}
                      onChange={(event, newValue) => {
                        handleAnswerChange(
                          survey.questions[currentQuestionIndex].id,
                          newValue.toString()
                        );
                      }}
                      size="large"
                      sx={{
                        '& .MuiRating-iconFilled': {
                          color: primaryColor,
                        },
                        '& .MuiRating-iconHover': {
                          color: primaryColor,
                        },
                      }}
                    />
                  </Box>
                )}
                {survey.questions[currentQuestionIndex].question_type === 'like_dislike' && (
                  <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center', width: '100%' }}>
                    <ToggleButtonGroup
                      value={answers[survey.questions[currentQuestionIndex].id] || ''}
                      exclusive
                      onChange={(event, newValue) => {
                        if (newValue !== null) {
                          handleAnswerChange(survey.questions[currentQuestionIndex].id, newValue);
                        }
                      }}
                      aria-label="text alignment"
                      sx={{
                        '& .MuiToggleButton-root': {
                          border: '1px solid #dee2e6', // var(--border)
                          borderRadius: '10px',
                          padding: '15px',
                          '&:hover': {
                            background: `${alpha(primaryColor, 0.1)}`,
                            borderColor: primaryColor,
                          },
                          '&.Mui-selected': {
                            background: `${alpha(primaryColor, 0.1)}`,
                            borderColor: primaryColor,
                            color: primaryColor,
                          },
                        },
                      }}
                    >
                      <ToggleButton value="like" aria-label="like">
                        <ThumbUpIcon sx={{ fontSize: 36, color: primaryColor }} />
                      </ToggleButton>
                      <ToggleButton value="dislike" aria-label="dislike">
                        <ThumbDownIcon sx={{ fontSize: 36, color: primaryColor }} />
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </Box>
                )}

                {survey.questions[currentQuestionIndex].question_type === 'nps' && (
                  <Box sx={{ mb: 2, width: '100%' }}>
                    <Typography gutterBottom>{t('public_survey.nps_question_label')}</Typography>
                    <Slider
                      aria-label="NPS Score"
                      value={parseInt(answers[survey.questions[currentQuestionIndex].id]) || 0}
                      onChange={(event, newValue) => {
                        handleAnswerChange(
                          survey.questions[currentQuestionIndex].id,
                          newValue.toString()
                        );
                      }}
                      defaultValue={0}
                      step={1}
                      marks
                      min={0}
                      max={10}
                      valueLabelDisplay="auto"
                      sx={{
                        color: primaryColor,
                        '& .MuiSlider-markLabel': {
                          color: textColor,
                        },
                        '& .MuiSlider-thumb': {
                          '&:hover, &.Mui-focusVisible': {
                            boxShadow: `0px 0px 0px 8px ${alpha(primaryColor, 0.16)}`,
                          },
                          '&.Mui-active': {
                            boxShadow: `0px 0px 0px 14px ${alpha(primaryColor, 0.16)}`,
                          },
                        },
                      }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Typography variant="caption" sx={{ color: textColor }}>
                        {t('public_survey.nps_0_label')}
                      </Typography>
                      <Typography variant="caption" sx={{ color: textColor }}>
                        {t('public_survey.nps_10_label')}
                      </Typography>
                    </Box>
                  </Box>
                )}

                {survey.questions[currentQuestionIndex].question_type ===
                  'numerical_rating_scale' && (
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginTop: '15px',
                      flexWrap: 'wrap',
                      gap: '10px',
                    }}
                  >
                    {survey.questions[currentQuestionIndex].options?.map((option, optIndex) => (
                      <Box
                        key={optIndex}
                        onClick={() =>
                          handleAnswerChange(
                            survey.questions[currentQuestionIndex].id,
                            option.value
                          )
                        }
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          cursor: 'pointer',
                          padding: '10px',
                          borderRadius: '8px',
                          transition: 'all 0.2s ease',
                          width: { xs: 'calc(20% - 8px)', sm: 'auto' }, // Responsive width
                          background:
                            answers[survey.questions[currentQuestionIndex].id] === option.value
                              ? `${alpha(primaryColor, 0.1)}`
                              : 'transparent',
                          '&:hover': {
                            background: `${alpha(primaryColor, 0.1)}`,
                          },
                        }}
                      >
                        <Box
                          sx={{
                            width: '40px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: '#F1FAEE', // var(--secondary)
                            borderRadius: '50%',
                            fontWeight: 600,
                            marginBottom: '5px',
                            ...(answers[survey.questions[currentQuestionIndex].id] ===
                              option.value && {
                              background: primaryColor,
                              color: 'white',
                            }),
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              background: primaryColor,
                              color: 'white',
                            },
                          }}
                        >
                          {option.value}
                        </Box>
                        <Typography
                          variant="caption"
                          sx={{ fontSize: '12px', color: '#adb5bd', textAlign: 'center' }}
                        >
                          {option.label}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
                {survey.questions[currentQuestionIndex].question_type === 'emoji_rating' && (
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginTop: '20px',
                      flexWrap: 'wrap',
                      gap: '10px',
                    }}
                  >
                    {survey.questions[currentQuestionIndex].options?.map((option, optIndex) => (
                      <Box
                        key={optIndex}
                        onClick={() =>
                          handleAnswerChange(
                            survey.questions[currentQuestionIndex].id,
                            option.value
                          )
                        }
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          cursor: 'pointer',
                          padding: '10px',
                          borderRadius: '8px',
                          transition: 'all 0.2s ease',
                          width: { xs: 'calc(20% - 8px)', sm: 'auto' }, // Responsive width
                          background:
                            answers[survey.questions[currentQuestionIndex].id] === option.value
                              ? `${alpha(primaryColor, 0.1)}`
                              : 'transparent',
                          '&:hover': {
                            background: `${alpha(primaryColor, 0.1)}`,
                          },
                        }}
                      >
                        <Typography variant="h4" sx={{ fontSize: '36px', marginBottom: '5px' }}>
                          {option.emoji}
                        </Typography>
                        <Typography variant="caption" sx={{ fontSize: '12px', color: '#adb5bd' }}>
                          {option.label}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            )}
          </Box>

          {/* Survey Footer */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '20px 30px',
              borderTop: '1px solid #dee2e6', // var(--border)
            }}
          >
            <Button
              variant="outlined"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              sx={{
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                border: `1px solid ${primaryColor}`,
                color: primaryColor,
                fontSize: '16px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                '&:hover': {
                  background: `${alpha(primaryColor, 0.1)}`,
                  borderColor: primaryColor,
                },
                '&:disabled': {
                  opacity: 0.5,
                  cursor: 'not-allowed',
                  transform: 'none !important',
                },
              }}
            >
              <i className="fas fa-arrow-left"></i> Anterior
            </Button>
            {currentQuestionIndex < survey.questions.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleNext}
                sx={{
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  background: primaryColor,
                  color: 'white',
                  fontSize: '16px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  '&:hover': {
                    background: alpha(primaryColor, 0.9),
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                Próximo <i className="fas fa-arrow-right"></i>
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={submitSurveyMutation.isLoading}
                sx={{
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  background: primaryColor,
                  color: 'white',
                  fontSize: '16px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  '&:hover': {
                    background: alpha(primaryColor, 0.9),
                    transform: 'translateY(-2px)',
                  },
                  '&:disabled': {
                    opacity: 0.5,
                    cursor: 'not-allowed',
                    transform: 'none !important',
                  },
                }}
              >
                {submitSurveyMutation.isLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  <>
                    <i className="fas fa-paper-plane"></i> Enviar Pesquisa
                  </>
                )}
              </Button>
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default PublicSurveyForm;
