import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useGetPublicQRCode, useCreatePublicFeedback } from '../../Feedback/api/feedbackService'; // Corrected import
import { useTranslation } from 'react-i18next';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Paper,
  Stepper,
  Step,
  StepLabel,
  TextField,
  Rating,
  Fade,
  useTheme,
} from '@mui/material';
import {
  SentimentVeryDissatisfied,
  SentimentDissatisfied,
  SentimentSatisfied,
  SentimentSatisfiedAlt,
  SentimentVerySatisfied,
  CheckCircleOutline,
  ErrorOutline,
  ArrowBack as ArrowBackIcon,
  HelpOutline as HelpOutlineIcon,
} from '@mui/icons-material';

const steps = [
  'public_feedback.step_rating',
  'public_feedback.step_comment',
  'public_feedback.step_contact',
];

const ratingIcons = {
  1: { icon: <SentimentVeryDissatisfied fontSize="large" />, label: 'Péssimo' },
  2: { icon: <SentimentDissatisfied fontSize="large" />, label: 'Ruim' },
  3: { icon: <SentimentSatisfied fontSize="large" />, label: 'Normal' },
  4: { icon: <SentimentSatisfiedAlt fontSize="large" />, label: 'Bom' },
  5: { icon: <SentimentVerySatisfied fontSize="large" />, label: 'Excelente' },
};

const getRatingColor = (rating, theme) => {
  if (rating <= 2) return theme.palette.error.main;
  if (rating === 3) return theme.palette.warning.main;
  return theme.palette.success.main;
};

const PublicFeedback = () => {
  const { qrId } = useParams();
  const { t } = useTranslation();
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);

  const validationSchema = yup.object().shape({
    rating: yup.number().required(),
    feedback_text: yup.string(),
    customer_name: yup.string(),
    customer_email: yup.string().email(t('public_feedback.invalid_email_format')),
  });

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      rating: 5,
      feedback_text: '',
      customer_name: '',
      customer_email: '',
    },
    resolver: yupResolver(validationSchema),
  });

  const rating = watch('rating');

  const { data: qrCodeData, isLoading, isError, error } = useGetPublicQRCode(qrId); // Corrected hook
  const createFeedbackMutation = useCreatePublicFeedback(); // Corrected hook

  const isQrCodeInvalid =
    !qrCodeData || !qrCodeData.is_active || new Date(qrCodeData.expires_at) < new Date();

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const onSubmit = (data) => {
    const feedback_type = data.rating >= 4 ? 'positive' : data.rating <= 2 ? 'negative' : 'neutral';
    createFeedbackMutation.mutate({ ...data, qrCodeId: qrId, feedback_type });
  };

  if (isLoading) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (isError || isQrCodeInvalid) {
    return (
      <Paper sx={{ p: 4, m: 2, textAlign: 'center' }}>
        <ErrorOutline sx={{ fontSize: 60, color: 'error.main' }} />
        <Typography variant="h5" gutterBottom>
          {t('public_feedback.qr_code_error_title')}
        </Typography>
        <Typography variant="body1">
          {error?.response?.data?.message || t('public_feedback.qr_code_error_text')}
        </Typography>
        <Button variant="contained" onClick={() => window.history.back()} sx={{ mt: 2 }}>
          {t('public_feedback.go_back')}
        </Button>
      </Paper>
    );
  }

  if (createFeedbackMutation.isSuccess) {
    return (
      <Fade in={true}>
        <Paper sx={{ p: 4, m: 2, textAlign: 'center' }}>
          <CheckCircleOutline sx={{ fontSize: 60, color: 'success.main' }} />
          <Typography variant="h5" gutterBottom>
            {t('public_feedback.thank_you_title')}
          </Typography>
          <Typography variant="body1">{t('public_feedback.thank_you_text')}</Typography>
        </Paper>
      </Fade>
    );
  }

  return (
    <Box sx={{ maxWidth: 600, margin: 'auto', p: 2 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 } }}>
        <Typography variant="h4" align="center" gutterBottom>
          {t('public_feedback.title')}
        </Typography>
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{t(label)}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <form onSubmit={handleSubmit(onSubmit)}>
          {activeStep === 0 && (
            <Fade in={true}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6">{t('public_feedback.rating_question')}</Typography>
                <Controller
                  name="rating"
                  control={control}
                  render={({ field }) => (
                    <Rating
                      {...field}
                      size="large"
                      sx={{ my: 2, color: getRatingColor(field.value, theme) }}
                      icon={ratingIcons[field.value]?.icon}
                      emptyIcon={<HelpOutlineIcon fontSize="large" />}
                    />
                  )}
                />
                <Typography variant="h5" sx={{ color: getRatingColor(rating, theme) }}>
                  {ratingIcons[rating]?.label}
                </Typography>
              </Box>
            </Fade>
          )}

          {activeStep === 1 && (
            <Fade in={true}>
              <Box>
                <Typography variant="h6">{t('public_feedback.comment_question')}</Typography>
                <Controller
                  name="feedback_text"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={t('public_feedback.comment_placeholder')}
                      multiline
                      rows={4}
                      fullWidth
                      margin="normal"
                    />
                  )}
                />
              </Box>
            </Fade>
          )}

          {activeStep === 2 && (
            <Fade in={true}>
              <Box>
                <Typography variant="h6">{t('public_feedback.contact_question')}</Typography>
                <Controller
                  name="customer_name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={t('public_feedback.name_label')}
                      fullWidth
                      margin="normal"
                    />
                  )}
                />
                <Controller
                  name="customer_email"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={t('public_feedback.email_label')}
                      type="email"
                      fullWidth
                      margin="normal"
                      error={!!errors.customer_email}
                      helperText={errors.customer_email?.message}
                    />
                  )}
                />
              </Box>
            </Fade>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button disabled={activeStep === 0} onClick={handleBack} startIcon={<ArrowBackIcon />}>
              {t('public_feedback.back_button')}
            </Button>
            {activeStep < steps.length - 1 ? (
              <Button variant="contained" onClick={handleNext}>
                {t('public_feedback.next_button')}
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                type="submit"
                disabled={createFeedbackMutation.isLoading}
              >
                {createFeedbackMutation.isLoading ? (
                  <CircularProgress size={24} />
                ) : (
                  t('public_feedback.submit_button')
                )}
              </Button>
            )}
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default PublicFeedback;
