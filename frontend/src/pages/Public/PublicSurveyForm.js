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
  LinearProgress,
  Modal, // Added Modal
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Restaurant as RestaurantIcon } from '@mui/icons-material';

// Modal Component for Customer Identification
const IdentifyCustomerModal = ({ open, onClose, onIdentified, responseId, restaurantId }) => {
    const { t } = useTranslation();
    const [view, setView] = useState('initial'); // 'initial', 'login', 'register'
    const [formData, setFormData] = useState({ email: '', password: '', name: '', phone: '' });
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (open) {
            // Reset state when modal opens
            setView('initial');
            setFormData({ email: '', password: '', name: '', phone: '' });
            setError('');
        }
    }, [open]);

    const handleFormChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            const response = await axiosInstance.post('/api/auth/login', {
                email: formData.email,
                password: formData.password,
            });
            const customerId = response.data.user?.id; 
            if (response.data.user?.role === 'customer' && customerId) {
                onIdentified(customerId);
            } else {
                setError(t('public_survey.login_failed_not_customer'));
            }
        } catch (err) {
            setError(err.response?.data?.msg || t('public_survey.login_failed'));
        } finally {
            setSubmitting(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            const response = await axiosInstance.post('/api/customers/register', {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                restaurant_id: restaurantId,
            });
            const customerId = response.data.customer?.id;
            if (customerId) {
                onIdentified(customerId);
            } else {
                setError(t('public_survey.registration_failed'));
            }
        } catch (err) {
            setError(err.response?.data?.errors[0]?.msg || err.response?.data?.msg || t('public_survey.registration_failed'));
        } finally {
            setSubmitting(false);
        }
    };

    const renderInitialView = () => (
        <Box>
            <Typography variant="h6" gutterBottom>{t('public_survey.identify_modal_title')}</Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>{t('public_survey.identify_modal_subtitle')}</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button variant="contained" onClick={() => setView('login')}>{t('public_survey.identify_modal_login_button')}</Button>
                <Button variant="outlined" onClick={() => setView('register')}>{t('public_survey.identify_modal_register_button')}</Button>
                <Button onClick={onClose} sx={{ mt: 2 }}>{t('public_survey.identify_modal_no_thanks_button')}</Button>
            </Box>
        </Box>
    );

    const renderLoginView = () => (
        <form onSubmit={handleLogin}>
            <Typography variant="h6" gutterBottom>{t('public_survey.login_title')}</Typography>
            <TextField fullWidth label={t('common.email')} name="email" type="email" value={formData.email} onChange={handleFormChange} margin="normal" required />
            <TextField fullWidth label={t('common.password')} name="password" type="password" value={formData.password} onChange={handleFormChange} margin="normal" required />
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button onClick={() => setView('initial')}>{t('common.back')}</Button>
                <Button type="submit" variant="contained" disabled={submitting}>
                    {submitting ? <CircularProgress size={24} /> : t('common.login')}
                </Button>
            </Box>
        </form>
    );

    const renderRegisterView = () => (
        <form onSubmit={handleRegister}>
            <Typography variant="h6" gutterBottom>{t('public_survey.register_title')}</Typography>
            <TextField fullWidth label={t('common.name')} name="name" value={formData.name} onChange={handleFormChange} margin="normal" required />
            <TextField fullWidth label={t('common.email')} name="email" type="email" value={formData.email} onChange={handleFormChange} margin="normal" required />
            <TextField fullWidth label={t('common.phone')} name="phone" value={formData.phone} onChange={handleFormChange} margin="normal" required />
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button onClick={() => setView('initial')}>{t('common.back')}</Button>
                <Button type="submit" variant="contained" disabled={submitting}>
                    {submitting ? <CircularProgress size={24} /> : t('common.register')}
                </Button>
            </Box>
        </form>
    );

    return (
        <Modal open={open} onClose={onClose}>
            <Paper sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: { xs: '90%', sm: 400 }, p: 4, bgcolor: 'background.paper', borderRadius: 2 }}>
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
  const theme = useTheme();

  const [survey, setSurvey] = useState(null);
  const [restaurantData, setRestaurantData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [answers, setAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showThankYouScreen, setShowThankYouScreen] = useState(false);
  const [generatedCoupon, setGeneratedCoupon] = useState(null);
  const [showIdentifyModal, setShowIdentifyModal] = useState(false);
  const [anonymousResponseId, setAnonymousResponseId] = useState(null);

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
        const { data } = await axiosInstance.get(`/public/surveys/${restaurantSlug}/${surveySlug}`);
        
        if (!data.survey) {
            throw new Error(t('public_survey.survey_not_found_or_inactive'));
        }

        const surveyData = data.survey;
        
        // Fetch reward details if reward_id exists
        if (surveyData.reward_id) {
            const rewardRes = await axiosInstance.get(`/api/rewards/${surveyData.reward_id}`);
            surveyData.reward = rewardRes.data; 
        }

        setSurvey(surveyData);
        setRestaurantData(data.restaurant);

        const initialAnswers = {};
        surveyData.questions.forEach(q => {
          initialAnswers[q.id] = q.question_type === 'checkboxes' ? [] : '';
        });
        setAnswers(initialAnswers);
      } catch (err) {
        console.error('Error fetching survey:', err);
        const errorMessage = err.response?.data?.msg || err.message || t('public_survey.survey_not_found_or_inactive');
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (restaurantSlug && surveySlug) {
      fetchSurvey();
    }
  }, [restaurantSlug, surveySlug, t]);

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleCheckboxChange = (questionId, optionValue) => {
    setAnswers(prev => {
      const currentAnswers = prev[questionId] || [];
      if (currentAnswers.includes(optionValue)) {
        return { ...prev, [questionId]: currentAnswers.filter(item => item !== optionValue) };
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
    if (reward.type === 'wheel_spin') {
      navigate('/girar-roleta', { state: { fromSurvey: true, responseId: anonymousResponseId || survey.id } });
    } else if (reward.type === 'coupon') {
      setGeneratedCoupon(reward.details);
      setShowThankYouScreen(true);
    } else {
      setShowThankYouScreen(true);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    const formattedAnswers = Object.keys(answers).map(questionId => ({
      question_id: questionId,
      answer_value: Array.isArray(answers[questionId]) ? answers[questionId].join(',') : answers[questionId],
    }));
    const payload = { answers: formattedAnswers };
    if (customerId) payload.customer_id = customerId;

    try {
      const response = await axiosInstance.post(`/public/surveys/${survey.slug}/responses`, payload);
      toast.success(t('public_survey.submit_success_message'));
      const { reward, responseId } = response.data;

      if (customerId && reward) {
        handleReward(reward);
      } else if (!customerId && survey.reward) { // Check for reward object on survey
        setAnonymousResponseId(responseId);
        setShowIdentifyModal(true);
      } else {
        setShowThankYouScreen(true);
      }
    } catch (err) {
      console.error('Error submitting answers:', err);
      setError(err.response?.data?.msg || t('public_survey.submit_error_message'));
      toast.error(err.response?.data?.msg || t('public_survey.submit_error_message'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCustomerIdentified = async (newCustomerId) => {
    try {
        const response = await axiosInstance.patch(`/public/surveys/responses/${anonymousResponseId}/link-customer`, {
            customer_id: newCustomerId,
        });
        setShowIdentifyModal(false);
        handleReward(response.data.reward);
    } catch (err) {
        toast.error(t('public_survey.link_customer_error'));
        console.error('Error linking customer:', err);
    }
  };

  const handleNext = () => {
    // Validation logic here...
    if (currentQuestionIndex < survey.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  if (loading) return <Container maxWidth="md"><Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh"><CircularProgress size={60} /></Box></Container>;
  if (error) return <Container maxWidth="md"><Box textAlign="center" py={8}><Alert severity="error">{error}</Alert><Button variant="contained" onClick={() => navigate('/')}>{t('common.back_to_home')}</Button></Box></Container>;
  if (!survey || !restaurantData) return null;

  if (showThankYouScreen) {
    // Thank You Screen JSX
    return ( <Box>...</Box> ); // Simplified for brevity
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
        {/* Rest of the survey form JSX */}
    </Box>
  );
};

export default PublicSurveyForm;