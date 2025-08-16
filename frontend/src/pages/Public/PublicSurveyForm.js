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
  LinearProgress, // For progress bar
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import CheckCircleIcon from '@mui/icons-material/CheckCircle'; // For thank you screen
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Restaurant as RestaurantIcon } from '@mui/icons-material';

const PublicSurveyForm = () => {
  const { t } = useTranslation();
  const { restaurantSlug, customerId } = useParams(); // Assuming these are URL params
  const navigate = useNavigate();
  const theme = useTheme();

  const [survey, setSurvey] = useState(null);
  const [restaurantData, setRestaurantData] = useState(null); // To store restaurant name, logo etc.
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [answers, setAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // For multi-step form
  const [showThankYouScreen, setShowThankYouScreen] = useState(false);
  const [generatedCoupon, setGeneratedCoupon] = useState(null);

  // Dynamic colors from restaurant settings (default to example.html colors)
  const primaryColor = restaurantData?.settings?.survey_program_settings?.primary_color || '#E31837';
  const secondaryColor = restaurantData?.settings?.survey_program_settings?.secondary_color || '#2C3E50';
  const accentColor = restaurantData?.settings?.survey_program_settings?.accent_color || '#FFD700';
  const textColor = restaurantData?.settings?.survey_program_settings?.text_color || '#212529';
  const backgroundColor = restaurantData?.settings?.survey_program_settings?.background_color || '#F8F9FA';
  const backgroundImageUrl = restaurantData?.settings?.survey_program_settings?.background_image_url || null;

  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        setLoading(true);
        // Use the new endpoint for dynamic survey selection
        const { data } = await axiosInstance.get(`/public/surveys/next/${restaurantSlug}/${customerId || ''}`);

        // Verify if survey module is enabled for this restaurant
        const enabledModules = data.restaurant?.settings?.enabled_modules || [];
        if (!enabledModules.includes('surveys_feedback')) {
          setError(t('common.module_not_enabled', { moduleName: t('modules.surveys_feedback') }));
          setLoading(false);
          return;
        }

        setSurvey(data.survey);
        setRestaurantData(data.restaurant);

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

    if (restaurantSlug) { // Only fetch if restaurantSlug is available
      fetchSurvey();
    }
  }, [restaurantSlug, customerId]); // Depend on restaurantSlug and customerId

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

  const validateCurrentQuestion = () => {
    const currentQuestion = survey.questions[currentQuestionIndex];
    // Basic validation: check if an answer is provided for required questions
    if (currentQuestion.required) { // Assuming a 'required' field on question model
      if (currentQuestion.question_type === 'checkboxes') {
        return answers[currentQuestion.id] && answers[currentQuestion.id].length > 0;
      } else {
        return !!answers[currentQuestion.id];
      }
    }
    return true; // If not required, it's always valid to proceed
  };

  const handleNext = () => {
    if (validateCurrentQuestion()) {
      if (currentQuestionIndex < survey.questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        // Last question, submit the form
        handleSubmit();
      }
    } else {
      toast.error(t('public_survey.please_answer_question'));
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');

    const formattedAnswers = Object.keys(answers).map(questionId => ({
      question_id: questionId,
      answer_value: Array.isArray(answers[questionId]) ? answers[questionId].join(',') : answers[questionId],
    }));

    try {
      const response = await axiosInstance.post(`/public/surveys/${survey.slug}/responses`, {
        answers: formattedAnswers,
        customer_id: customerId || null, // Pass customerId if available
      });
      setGeneratedCoupon(response.data.coupon); // Store generated coupon
      setShowThankYouScreen(true); // Show thank you screen
      toast.success(t('public_survey.submit_success_message'));
    } catch (err) {
      console.error('Error submitting answers:', err);
      setError(err.response?.data?.msg || t('public_survey.submit_error_message'));
      toast.error(err.response?.data?.msg || t('public_survey.submit_error_message'));
    } finally {
      setSubmitting(false);
    }
  };

  const currentQuestion = survey?.questions[currentQuestionIndex];
  const progress = survey ? ((currentQuestionIndex + 1) / survey.questions.length) * 100 : 0;

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

  if (!survey || !restaurantData) {
    return null; // Should not happen if loading and error are handled
  }

  // Thank You Screen
  if (showThankYouScreen) {
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
        px: 2,
      }}>
        <Paper sx={{
          p: { xs: 3, md: 6 },
          borderRadius: 4,
          boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.08)',
          textAlign: 'center',
          background: alpha(backgroundColor, 0.9),
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(0, 0, 0, 0.05)',
        }}>
          <CheckCircleIcon sx={{ fontSize: '5rem', color: primaryColor, mb: 2 }} />
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 700, color: textColor }}>
            {t('public_survey.thank_you_title')}
          </Typography>
          <Typography variant="body1" color={textColor} sx={{ mb: 3 }}>
            {t('public_survey.thank_you_message')}
          </Typography>

          {generatedCoupon && (
            <Box sx={{ mt: 4, p: 3, bgcolor: alpha(accentColor, 0.1), borderRadius: 2, border: `1px dashed ${accentColor}` }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: secondaryColor, mb: 1 }}>
                {t('public_survey.your_coupon_code')}
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 900, color: primaryColor, letterSpacing: 2, mb: 2 }}>
                {generatedCoupon.code}
              </Typography>
              <Typography variant="body2" color={textColor}>
                {t('public_survey.coupon_validity', { days: generatedCoupon.coupon_validity_days })} {/* Assuming coupon_validity_days is returned with coupon */}
              </Typography>
              <Typography variant="body2" color={textColor}>
                {t('public_survey.coupon_instructions')}
              </Typography>
            </Box>
          )}

          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => navigate('/')} // Or a specific return URL
            sx={{ mt: 4, py: 1.5, borderRadius: 3, bgcolor: primaryColor, color: 'white' }}
          >
            {t('public_survey.return_to_home')}
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: backgroundColor + ' !important',
      backgroundImage: backgroundImageUrl ? `url(${backgroundImageUrl})` : 'none',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
    }}>
      {/* Header */}
      <Box sx={{
        background: `linear-gradient(135deg, ${secondaryColor}, ${alpha(secondaryColor, 0.8)})`,
        color: 'white',
        padding: { xs: '1.5rem', sm: '1.8rem', md: '2rem' }, // Adjusted padding
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      }}>
        <Box sx={{ mb: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem' }}>
          {restaurantData?.logo ? (
            <img
              src={`${process.env.REACT_APP_API_URL}${restaurantData.logo}`}
              alt={restaurantData.name || t('public_survey.restaurant_logo_alt')}
              style={{
                height: '50px',
                width: '50px',
                borderRadius: '50%',
                objectFit: 'cover',
                filter: 'drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.15))',
              }}
            />
          ) : (
            <RestaurantIcon sx={{ fontSize: '2.5rem', color: accentColor }} />
          )}
          <Typography variant="h5" component="h1" sx={{ fontWeight: 700, color: 'white' }}>
            {restaurantData?.name || 'Don Fonseca'}
          </Typography>
        </Box>
        <Typography variant="h6" sx={{ fontSize: { xs: '1.4rem', sm: '1.6rem' }, marginBottom: '0.6rem', fontWeight: 600 }}>
          {survey.title}
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.95rem', maxWidth: '600px', margin: '0 auto', lineHeight: 1.5 }}>
          {survey.description}
        </Typography>
        {/* Wave effect from exemplo.html - can be done with SVG or CSS pseudo-elements */}
      </Box>

      {/* Progress Bar */}
      <Box sx={{
        padding: { xs: '1rem', sm: '1.2rem 1.5rem' },
        backgroundColor: 'white',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
          <Typography variant="body2" sx={{ fontSize: '0.9rem', fontWeight: 600, color: secondaryColor }}>
            {t('public_survey.progress_title')}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 700, color: primaryColor }}>
            {Math.round(progress)}% ({currentQuestionIndex + 1}/{survey.questions.length})
          </Typography>
        </Box>
        <LinearProgress variant="determinate" value={progress} sx={{
          height: 8,
          borderRadius: 4,
          bgcolor: alpha(primaryColor, 0.2),
          '& .MuiLinearProgress-bar': {
            background: `linear-gradient(90deg, ${primaryColor}, ${alpha(primaryColor, 0.8)})`,
            borderRadius: 4,
          },
        }} />
      </Box>

      {/* Survey Content */}
      <Container maxWidth="sm" sx={{ flex: 1, padding: '1.5rem', width: '100%' }}>
        <form onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
          {survey.questions.sort((a, b) => a.order - b.order).map((question, index) => (
            <Box key={question.id} sx={{ display: index === currentQuestionIndex ? 'block' : 'none' }}>
              <Paper
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
                    {index + 1}
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
                {/* Question Input Types */}
                {question.question_type === 'text' || question.question_type === 'textarea' ? (
                  <TextField
                    fullWidth
                    multiline={question.question_type === 'textarea'}
                    rows={question.question_type === 'textarea' ? 4 : 1}
                    label={t('public_survey.your_answer_label')}
                    value={answers[question.id] || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    variant="outlined"
                    InputLabelProps={{ sx: { color: textColor, '&.Mui-focused': { color: primaryColor } } }}
                    InputProps={{
                      sx: {
                        borderRadius: 2, '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0, 0, 0, 0.1)' },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: alpha(primaryColor, 0.3) },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: primaryColor },
                        transition: 'all 0.3s ease', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', '&:hover': { boxShadow: '0 4px 8px rgba(0,0,0,0.07)' },
                      }
                    }}
                  />
                ) : question.question_type === 'radio' ? (
                  <RadioGroup
                    value={answers[question.id] || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  >
                    {question.options.map((option, optIndex) => (
                      <FormControlLabel key={optIndex} value={option} control={<Radio sx={{ color: primaryColor }} />} label={<Typography sx={{ color: textColor }}>{option}</Typography>} />
                    ))}
                  </RadioGroup>
                ) : question.question_type === 'checkboxes' ? (
                  <FormGroup>
                    {question.options.map((option, optIndex) => (
                      <FormControlLabel
                        key={optIndex}
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
                    <InputLabel sx={{ color: textColor, '&.Mui-focused': { color: primaryColor } }}>{t('public_survey.select_option_label')}</InputLabel>
                    <Select
                      value={answers[question.id] || ''}
                      label={t('public_survey.select_option_label')}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      sx={{
                        color: textColor, '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0, 0, 0, 0.1)' },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: alpha(primaryColor, 0.3) },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: primaryColor },
                      }}
                    >
                      {question.options.map((option, optIndex) => (
                        <MenuItem key={optIndex} value={option} sx={{ color: textColor }}>{option}</MenuItem>
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
                              minWidth: '40px', height: '40px', borderRadius: '50%', fontWeight: 'bold',
                              bgcolor: parseInt(answers[question.id]) === num ? primaryColor : 'transparent',
                              color: parseInt(answers[question.id]) === num ? 'white' : primaryColor,
                              borderColor: primaryColor,
                              '&:hover': { bgcolor: primaryColor, color: 'white', borderColor: primaryColor },
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
                      onChange={(event, newValue) => { handleAnswerChange(question.id, newValue); }}
                      max={5} size="large" sx={{ '& .MuiRating-iconFilled': { color: primaryColor } }} // Cor das estrelas
                    />
                  </Box>
                ) : question.question_type === 'ratings' ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2 }}>
                    <Rating
                      name={`ratings-${question.id}`}
                      value={parseInt(answers[question.id]) || 0}
                      onChange={(event, newValue) => { handleAnswerChange(question.id, newValue); }}
                      max={5} size="large" sx={{ '& .MuiRating-iconFilled': { color: primaryColor } }} // Cor das estrelas
                    />
                  </Box>
                ) : question.question_type === 'like_dislike' ? (
                  <ToggleButtonGroup
                    value={answers[question.id] || ''} exclusive
                    onChange={(event, newSelection) => { if (newSelection !== null) { handleAnswerChange(question.id, newSelection); } }} // Only update if a selection is made
                    sx={{ mt: 2, display: 'flex', justifyContent: 'center', width: '100%' }}
                  >
                    <ToggleButton
                      value="like" aria-label="gostei"
                      sx={{
                        flexGrow: 1, py: 1.5, borderRadius: '8px !important',
                        color: answers[question.id] === 'like' ? 'white' : primaryColor,
                        bgcolor: answers[question.id] === 'like' ? primaryColor : 'transparent',
                        borderColor: primaryColor + ' !important',
                        '&:hover': { bgcolor: primaryColor, color: 'white' },
                      }}
                    >
                      <ThumbUpIcon sx={{ mr: 1 }} /> {t('public_survey.like_button')}
                    </ToggleButton>
                    <ToggleButton
                      value="dislike" aria-label="não gostei"
                      sx={{
                        flexGrow: 1, py: 1.5, borderRadius: '8px !important',
                        color: answers[question.id] === 'dislike' ? 'white' : primaryColor,
                        bgcolor: answers[question.id] === 'dislike' ? primaryColor : 'transparent',
                        borderColor: primaryColor + ' !important',
                        '&:hover': { bgcolor: primaryColor, color: 'white' },
                      }}
                    >
                      <ThumbDownIcon sx={{ mr: 1 }} /> {t('public_survey.dislike_button')}
                    </ToggleButton>
                  </ToggleButtonGroup>
                ) : null}
              </Paper>
            </Box>
          ))}

          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            {currentQuestionIndex > 0 && (
              <Button
                variant="outlined"
                size="large"
                onClick={handlePrevious}
                sx={{
                  borderColor: secondaryColor, color: secondaryColor, py: 1.5, borderRadius: 3,
                  '&:hover': { bgcolor: secondaryColor, color: 'white' }
                }}
              >
                {t('public_survey.previous_button')}
              </Button>
            )}
            <Button
              type="submit"
              variant="contained"
              size="large"
              onClick={handleNext}
              disabled={submitting}
              sx={{
                ml: currentQuestionIndex === 0 ? 'auto' : 0, // Push to right if no previous button
                py: 1.5, borderRadius: 3,
                boxShadow: `0px 8px 20px ${alpha(primaryColor, 0.3)}`,
                backgroundColor: primaryColor, color: 'white', // Changed color to white for better contrast
                '&:hover': { boxShadow: `0px 10px 25px ${alpha(primaryColor, 0.4)}`, transform: 'translateY(-2px)', backgroundColor: primaryColor },
                '&:active': { transform: 'translateY(1px)' }
              }}
            >
              {currentQuestionIndex === survey.questions.length - 1 ?
                (submitting ? <CircularProgress size={24} color="inherit" /> : t('public_survey.submit_button')) : // Changed color to inherit
                t('public_survey.next_button')}
            </Button>
          </Box>
        </form>
      </Container>
    </Box>
  );
};

export default PublicSurveyForm;
