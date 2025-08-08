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
  Grid,
  Slider,
  alpha,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const PublicSurveyForm = () => {
  const { t } = useTranslation();
  const { slug } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const [survey, setSurvey] = useState(null);
  const [restaurantName, setRestaurantName] = useState('');
  const [restaurantLogo, setRestaurantLogo] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#3f51b5'); // Default Material Blue
  const [secondaryColor, setSecondaryColor] = useState('#f50057'); // Default Material Pink
  const [textColor, setTextColor] = useState('#333333');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [backgroundImageUrl, setBackgroundImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        setLoading(true);
        const { data } = await axiosInstance.get(`/api/public/surveys/${slug}`);
        
        // Verifica se o módulo de pesquisas/feedback está habilitado para este restaurante
        const enabledModules = data.restaurant?.settings?.enabled_modules || [];
        if (!enabledModules.includes('surveys_feedback')) {
          setError(t('common.module_not_enabled', { moduleName: t('modules.surveys_feedback') }));
          setLoading(false);
          return;
        }

        setSurvey(data.survey);
        setRestaurantName(data.restaurant.name);
        setRestaurantLogo(`${process.env.REACT_APP_API_URL}${data.restaurant.logo}`);
        setPrimaryColor(data.restaurant.settings?.survey_program_settings?.primary_color || '#3f51b5');
        setSecondaryColor(data.restaurant.settings?.survey_program_settings?.secondary_color || '#f50057');
        setTextColor(data.restaurant.settings?.survey_program_settings?.text_color || '#333333');
        setBackgroundColor(data.restaurant.settings?.survey_program_settings?.background_color || '#ffffff');
        setBackgroundImageUrl(data.restaurant.settings?.survey_program_settings?.background_image_url || null);
        // Initialize answers state
        const initialAnswers = {};
        data.survey.questions.forEach(q => {
          if (q.question_type === 'checkboxes') {
            initialAnswers[q.id] = [];
          } else {
            initialAnswers[q.id] = '';
          }
        });
        setAnswers(initialAnswers);
      } catch (err) {
        console.error('Error fetching survey:', err);
        setError(err.response?.data?.msg || t('public_survey.survey_not_found_or_inactive'));
      } finally {
        setLoading(false);
      }
    };

    fetchSurvey();
  }, [slug]);

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleCheckboxChange = (questionId, optionValue) => {
    setAnswers(prev => {
      const currentAnswers = prev[questionId] || [];
      if (currentAnswers.includes(optionValue)) {
        return {
          ...prev,
          [questionId]: currentAnswers.filter(item => item !== optionValue),
        };
      } else {
        return {
          ...prev,
          [questionId]: [...currentAnswers, optionValue],
        };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const formattedAnswers = Object.keys(answers).map(questionId => ({
      question_id: questionId,
      answer_value: Array.isArray(answers[questionId]) ? answers[questionId].join(',') : answers[questionId],
    }));

    try {
      await axiosInstance.post(`/api/public/surveys/${slug}/responses`, { answers: formattedAnswers });
      toast.success(t('public_survey.submit_success_message'));
      navigate('/thank-you'); // {t('public_survey.redirect_to_thank_you_page')}
    } catch (err) {
      console.error('Error submitting answers:', err);
      setError(err.response?.data?.msg || t('public_survey.submit_error_message'));
      toast.error(err.response?.data?.msg || t('public_survey.submit_error_message'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Box textAlign="center" py={8}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
          <Button variant="contained" onClick={() => navigate('/')}>{t('common.back_to_home')}</Button>
        </Box>
      </Container>
    );
  }

  if (!survey) {
    return null; // Should not happen if loading and error are handled
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: backgroundColor + ' !important',
      backgroundImage: backgroundImageUrl ? `url(${backgroundImageUrl})` : 'none',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      py: { xs: 2, sm: 4, md: 6 },
      px: 2, // Padding horizontal para mobile
    }}>
      {/* Logo ou ícone do restaurante poderia ser adicionado aqui */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
        {restaurantLogo ? (
          <img 
            src={restaurantLogo} 
            alt={restaurantName || t('public_survey.restaurant_logo_alt')} 
            style={{ 
              height: '100px', 
              width: '100px',
              borderRadius: '50%',
              objectFit: 'cover',
              filter: 'drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.15))'
            }} 
          />
        ) : (
          <img 
            src="/logo192.png" 
            alt={t('public_survey.default_logo_alt')} 
            style={{ 
              height: '100px', 
              width: '100px',
              borderRadius: '50%',
              objectFit: 'cover',
              filter: 'drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.15))'
            }} 
          />
        )}
      </Box>
      <Container maxWidth="sm">
        <Paper sx={{ 
          p: { xs: 3, md: 6 }, 
          elevation: 0, // Sem elevação para um design mais clean
          borderRadius: 4, 
          width: '100%',
          boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.08)', // Sombra mais suave
          border: '1px solid rgba(0, 0, 0, 0.05)', // Borda sutil
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: `linear-gradient(90deg, ${primaryColor}, ${secondaryColor})`, // Barra colorida no topo
            zIndex: 1,
          },
          background: alpha(backgroundColor, 0.8), // Transparência aqui
          backdropFilter: 'blur(10px)', // Efeito de vidro fosco (funciona em navegadores modernos)
        }}>
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom 
            textAlign="center" 
            sx={{ 
              fontWeight: 800, 
              color: textColor,
              mb: 2,
              fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' }, // Responsivo
              letterSpacing: '-0.5px',
            }}
          >
            {survey.title}
          </Typography>
          <Typography 
            variant="body1" 
            color={textColor} 
            gutterBottom 
            textAlign="center" 
            sx={{ 
              mb: 5, 
              maxWidth: '90%', 
              mx: 'auto',
              fontSize: { xs: '0.95rem', sm: '1rem', md: '1.1rem' },
              lineHeight: 1.6,
              opacity: 0.85,
            }}
          >
            {survey.description}
          </Typography>

          <form onSubmit={handleSubmit}>
            {survey.questions.sort((a, b) => a.order - b.order).map((question) => (
              <Paper 
                key={question.id} 
                elevation={0} 
                sx={{ 
                  p: { xs: 3, md: 4 }, 
                  mb: 4, 
                  borderRadius: 2, 
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.08)',
                    transform: 'translateY(-2px)',
                  },
                  background: alpha(backgroundColor, 0.8),
                  backdropFilter: 'blur(8px)',
                }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      bgcolor: primaryColor,
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      mr: 2,
                      flexShrink: 0,
                      fontSize: '0.9rem',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    }}
                  >
                    {question.order}
                  </Box>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: textColor,
                      fontWeight: 600,
                      lineHeight: 1.3,
                      fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
                    }}
                  >
                    {question.question_text}
                  </Typography>
                </Box>
                {
                  question.question_type === 'text' || question.question_type === 'textarea' ? (
                    <TextField
                      fullWidth
                      multiline={question.question_type === 'textarea'}
                      rows={question.question_type === 'textarea' ? 4 : 1}
                      label={t('public_survey.your_answer_label')}
                      value={answers[question.id] || ''}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      variant="outlined"
                      InputLabelProps={{
                        sx: {
                          color: textColor,
                          '&.Mui-focused': {
                            color: primaryColor,
                          },
                        }
                      }}
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
                        }
                      }}
                    />
                  ) : question.question_type === 'radio' ? (
                    <RadioGroup
                      value={answers[question.id] || ''}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    >
                      {question.options.map((option, index) => (
                        <FormControlLabel key={index} value={option} control={<Radio sx={{ color: primaryColor }} />} label={<Typography sx={{ color: textColor }}>{option}</Typography>} />
                      ))}
                    </RadioGroup>
                  ) : question.question_type === 'checkboxes' ? (
                    <FormGroup>
                      {question.options.map((option, index) => (
                        <FormControlLabel
                          key={index}
                          control={
                            <Checkbox
                              checked={(answers[question.id] || []).includes(option)}
                              onChange={() => handleCheckboxChange(question.id, option)}
                              sx={{ color: primaryColor }}
                            />
                          }
                          label={<Typography sx={{ color: textColor }}>{option}</Typography>}
                        />
                      ))}
                    </FormGroup>
                  ) : question.question_type === 'dropdown' ? (
                    <FormControl fullWidth variant="outlined">
                      <InputLabel sx={{ color: textColor,
                        '&.Mui-focused': {
                          color: primaryColor,
                        },
                      }}>{t('public_survey.select_option_label')}</InputLabel>
                      <Select
                        value={answers[question.id] || ''}
                        label={t('public_survey.select_option_label')}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        sx={{ color: textColor,
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(0, 0, 0, 0.1)',
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: alpha(primaryColor, 0.3),
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: primaryColor,
                          },
                        }}
                      >
                        {question.options.map((option, index) => (
                          <MenuItem key={index} value={option} sx={{ color: textColor }}>{option}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : question.question_type === 'nps' ? (
                    <Box sx={{ width: '100%', mt: 2 }}>
                      <Typography variant="body2" gutterBottom textAlign="center" sx={{ color: textColor }}>{t('public_survey.nps_scale_description')}</Typography>
                      <Grid container spacing={1} justifyContent="center">
                        {[...Array(11).keys()].map((num) => (
                          <Grid item key={num}>
                            <Button
                              variant={parseInt(answers[question.id]) === num ? "contained" : "outlined"}
                              onClick={() => handleAnswerChange(question.id, num)}
                              sx={{
                                minWidth: '40px', // Ajuste para mobile
                                height: '40px',
                                borderRadius: '50%',
                                fontWeight: 'bold',
                                bgcolor: parseInt(answers[question.id]) === num ? primaryColor : 'transparent',
                                color: parseInt(answers[question.id]) === num ? 'white' : primaryColor,
                                borderColor: primaryColor,
                                '&:hover': {
                                  bgcolor: primaryColor,
                                  color: 'white',
                                  borderColor: primaryColor,
                                },
                              }}
                            >
                              {num}
                            </Button>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  ) : question.question_type === 'csat' ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2 }}>
                      <Typography variant="body2" gutterBottom>{t('public_survey.csat_scale_description')}</Typography>
                      <Rating
                        name={`csat-rating-${question.id}`}
                        value={parseInt(answers[question.id]) || 0}
                        onChange={(event, newValue) => {
                          handleAnswerChange(question.id, newValue);
                        }}
                        max={5}
                        size="large"
                        sx={{ '& .MuiRating-iconFilled': { color: primaryColor } }} // Cor das estrelas
                      />
                    </Box>
                  ) : question.question_type === 'ratings' ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2 }}>
                      <Rating
                        name={`ratings-${question.id}`}
                        value={parseInt(answers[question.id]) || 0}
                        onChange={(event, newValue) => {
                          handleAnswerChange(question.id, newValue);
                        }}
                        max={5}
                        size="large"
                        sx={{ '& .MuiRating-iconFilled': { color: primaryColor } }} // Cor das estrelas
                      />
                    </Box>
                  ) : question.question_type === 'like_dislike' ? (
                    <ToggleButtonGroup
                      value={answers[question.id] || ''}
                      exclusive
                      onChange={(event, newSelection) => {
                        if (newSelection !== null) {
                          handleAnswerChange(question.id, newSelection);
                        }
                      }}
                      sx={{ mt: 2, display: 'flex', justifyContent: 'center', width: '100%' }}
                    >
                      <ToggleButton 
                        value="like" 
                        aria-label="gostei" 
                        sx={{
                          flexGrow: 1, 
                          py: 1.5, 
                          borderRadius: '8px !important',
                          color: answers[question.id] === 'like' ? 'white' : primaryColor,
                          bgcolor: answers[question.id] === 'like' ? primaryColor : 'transparent',
                          borderColor: primaryColor + ' !important',
                          '&:hover': {
                            bgcolor: primaryColor,
                            color: 'white',
                          },
                        }}
                      >
                        <ThumbUpIcon sx={{ mr: 1 }} /> {t('public_survey.like_button')}
                      </ToggleButton>
                      <ToggleButton 
                        value="dislike" 
                        aria-label="não gostei" 
                        sx={{
                          flexGrow: 1, 
                          py: 1.5, 
                          borderRadius: '8px !important',
                          color: answers[question.id] === 'dislike' ? 'white' : primaryColor,
                          bgcolor: answers[question.id] === 'dislike' ? primaryColor : 'transparent',
                          borderColor: primaryColor + ' !important',
                          '&:hover': {
                            bgcolor: primaryColor,
                            color: 'white',
                          },
                        }}
                      >
                        <ThumbDownIcon sx={{ mr: 1 }} /> {t('public_survey.dislike_button')}
                      </ToggleButton>
                    </ToggleButtonGroup>
                  ) : null
                }
              </Paper>
            ))}

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={submitting}
              sx={{ 
                mt: 6, 
                py: 2, 
                fontSize: { xs: '1.1rem', md: '1.2rem' }, 
                borderRadius: 3, 
                boxShadow: `0px 8px 20px ${alpha(primaryColor, 0.3)}`, 
                backgroundColor: primaryColor,
                color: textColor,
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: `0px 10px 25px ${alpha(primaryColor, 0.4)}`,
                  transform: 'translateY(-2px)',
                  backgroundColor: primaryColor, // Mantém a cor no hover
                },
                '&:active': {
                  transform: 'translateY(1px)'
                }
              }}
            >
              {submitting ? 
                <CircularProgress size={24} color="inherit" /> : 
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span>{t('public_survey.submit_button')}</span>
                </Box>
              }
            </Button>
          </form>
        </Paper>

        <Box textAlign="center" mt={4} sx={{ opacity: 0.8, transition: 'opacity 0.3s ease', '&:hover': { opacity: 1 } }}>
          <Typography variant="caption" color={textColor} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <span>{t('public_survey.powered_by_text')}</span> 
            <span style={{ fontWeight: 'bold', color: primaryColor }}>
              {t('public_survey.powered_by_feedback_system')}
            </span>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default PublicSurveyForm;