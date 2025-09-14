import React, { useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Rating,
  Grid,
  Autocomplete,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '@/app/providers/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import {
  useCreateFeedback,
  useGetCustomersForFeedback,
  useGetQRCodesForFeedback,
} from './api/feedbackService';

const NewFeedback = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const restaurantId = user?.restaurants?.[0]?.id;

  const { data: customers, isLoading: loadingCustomers } = useGetCustomersForFeedback();
  const { data: qrCodes, isLoading: loadingQrCodes } = useGetQRCodesForFeedback(restaurantId);
  const createFeedbackMutation = useCreateFeedback();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      customer_id: null,
      qr_code_id: null,
      rating: 5,
      comment: '',
      feedback_type: 'compliment',
      source: 'manual',
      table_number: '',
      visit_date: new Date().toISOString().split('T')[0],
    },
  });

  const watchRating = watch('rating');

  useEffect(() => {
    if (watchRating >= 4) {
      setValue('feedback_type', 'compliment');
    } else if (watchRating === 3) {
      setValue('feedback_type', 'suggestion');
    } else {
      setValue('feedback_type', 'complaint');
    }
  }, [watchRating, setValue]);

  const onSubmit = (data) => {
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([key, value]) => {
        if ((key === 'customer_id' || key === 'qr_code_id') && value === null) {
          return false;
        }
        return value !== null && value !== '';
      })
    );

    cleanData.restaurant_id = restaurantId;

    if (cleanData.customer_id) {
      delete cleanData.customer_data;
    } else if (
      cleanData.customer_data &&
      !cleanData.customer_data.name &&
      !cleanData.customer_data.email &&
      !cleanData.customer_data.phone
    ) {
      delete cleanData.customer_data;
    }

    if (!cleanData.customer_id && !cleanData.customer_data) {
      cleanData.is_anonymous = true;
    } else {
      cleanData.is_anonymous = false;
    }

    createFeedbackMutation.mutate(cleanData, {
      onSuccess: () => {
        navigate('/feedback');
      },
    });
  };

  const getRatingLabel = (rating) => {
    switch (rating) {
      case 1:
        return t('new_feedback.rating_very_dissatisfied');
      case 2:
        return t('new_feedback.rating_dissatisfied');
      case 3:
        return t('new_feedback.rating_neutral');
      case 4:
        return t('new_feedback.rating_satisfied');
      case 5:
        return t('new_feedback.rating_very_satisfied');
      default:
        return '';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'compliment':
        return t('feedback_list.type_compliment');
      case 'complaint':
        return t('feedback_list.type_complaint');
      case 'suggestion':
        return t('feedback_list.type_suggestion');
      case 'criticism':
        return t('feedback_list.type_criticism');
      default:
        return type;
    }
  };

  if (loadingCustomers || loadingQrCodes) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/feedback')}>
          {t('public_feedback.back_button')}
        </Button>
        <Typography variant="h4" component="h1">
          {t('sidebar.new_feedback')}
        </Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            {/* Customer Selection */}
            <Grid item xs={12} md={6}>
              <Controller
                name="customer_id"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Autocomplete
                    options={customers || []}
                    getOptionLabel={(option) => `${option.name || option.email || option.phone}`}
                    value={customers.find((c) => c.id === value) || null}
                    onChange={(_, newValue) => onChange(newValue?.id || null)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={t('coupons.table_header_customer')}
                        placeholder={t('new_feedback.customer_placeholder')}
                        error={!!errors.customer_id}
                        helperText={errors.customer_id?.message}
                      />
                    )}
                    renderOption={(props, option) => (
                      <li {...props}>
                        <Box>
                          <Typography variant="body1">
                            {option.name || option.email || option.phone}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {option.email || option.phone}
                          </Typography>
                        </Box>
                      </li>
                    )}
                  />
                )}
              />
            </Grid>

            {/* QR Code Selection */}
            <Grid item xs={12} md={6}>
              <Controller
                name="qr_code_id"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Autocomplete
                    options={qrCodes || []}
                    getOptionLabel={(option) =>
                      `${option.table_name || `Mesa ${option.table_number}`} - ${option.location_description || 'N/A'}`
                    }
                    value={qrCodes.find((q) => q.id === value) || null}
                    onChange={(_, newValue) => {
                      onChange(newValue?.id || null);
                      if (newValue?.table_number) {
                        setValue('table_number', newValue.table_number.toString());
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={t('sidebar.qr_codes')}
                        placeholder={t('new_feedback.qrcode_placeholder')}
                      />
                    )}
                    renderOption={(props, option) => (
                      <li {...props}>
                        <Box>
                          <Typography variant="body1">
                            {option.table_name || `Mesa ${option.table_number}`}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {option.location_description || 'N/A'}
                          </Typography>
                        </Box>
                      </li>
                    )}
                  />
                )}
              />
            </Grid>

            {/* Rating */}
            <Grid item xs={12}>
              <Typography component="legend" gutterBottom>
                {t('new_feedback.rating_label')}
              </Typography>
              <Box display="flex" alignItems="center" gap={2}>
                <Controller
                  name="rating"
                  control={control}
                  rules={{ required: t('new_feedback.rating_required') }}
                  render={({ field: { onChange, value } }) => (
                    <Rating
                      value={value}
                      onChange={(_, newValue) => onChange(newValue)}
                      size="large"
                    />
                  )}
                />
                <Typography variant="body1" color="primary">
                  {getRatingLabel(watchRating)}
                </Typography>
              </Box>
              {errors.rating && (
                <Typography variant="caption" color="error">
                  {errors.rating.message}
                </Typography>
              )}
            </Grid>

            {/* Comment */}
            <Grid item xs={12}>
              <Controller
                name="comment"
                control={control}
                rules={{ required: t('new_feedback.comment_required') }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t('public_feedback.step_comment_label')}
                    multiline
                    rows={4}
                    fullWidth
                    error={!!errors.comment}
                    helperText={errors.comment?.message}
                    placeholder={t('new_feedback.comment_placeholder')}
                  />
                )}
              />
            </Grid>

            {/* Feedback Type */}
            <Grid item xs={12} md={6}>
              <Controller
                name="feedback_type"
                control={control}
                rules={{ required: t('new_feedback.type_required') }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.feedback_type}>
                    <InputLabel>{t('new_feedback.type_label')}</InputLabel>
                    <Select {...field} label={t('new_feedback.type_label')}>
                      <MenuItem value="compliment">{t('feedback_list.type_compliment')}</MenuItem>
                      <MenuItem value="complaint">{t('feedback_list.type_complaint')}</MenuItem>
                      <MenuItem value="suggestion">{t('feedback_list.type_suggestion')}</MenuItem>
                      <MenuItem value="criticism">{t('feedback_list.type_criticism')}</MenuItem>
                    </Select>
                    {errors.feedback_type && (
                      <Typography variant="caption" color="error">
                        {errors.feedback_type.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            {/* Source */}
            <Grid item xs={12} md={6}>
              <Controller
                name="source"
                control={control}
                rules={{ required: t('new_feedback.source_required') }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.source}>
                    <InputLabel>{t('new_feedback.source_label')}</InputLabel>
                    <Select {...field} label={t('new_feedback.source_label')}>
                      <MenuItem value="qrcode">{t('sidebar.qr_codes')}</MenuItem>
                      <MenuItem value="whatsapp">{t('feedback_list.source_whatsapp')}</MenuItem>
                      <MenuItem value="tablet">{t('new_feedback.source_tablet')}</MenuItem>
                      <MenuItem value="web">{t('feedback_list.source_website')}</MenuItem>
                      <MenuItem value="email">{t('login_form.email_label')}</MenuItem>
                      <MenuItem value="manual">{t('feedback_list.source_manual')}</MenuItem>
                    </Select>
                    {errors.source && (
                      <Typography variant="caption" color="error">
                        {errors.source.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            {/* Table Number */}
            <Grid item xs={12} md={6}>
              <Controller
                name="table_number"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t('new_feedback.table_number_label')}
                    type="number"
                    fullWidth
                    placeholder={t('new_feedback.table_number_placeholder')}
                  />
                )}
              />
            </Grid>

            {/* Visit Date */}
            <Grid item xs={12} md={6}>
              <Controller
                name="visit_date"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t('new_feedback.visit_date_label')}
                    type="date"
                    fullWidth
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                )}
              />
            </Grid>

            {/* Preview */}
            <Grid item xs={12}>
              <Alert severity="info">
                <Typography variant="h6" gutterBottom>
                  {t('new_feedback.preview_title')}
                </Typography>
                <Box display="flex" gap={1} mb={1}>
                  <Chip label={getTypeLabel(watch('feedback_type'))} color="primary" size="small" />
                  <Chip label={watch('source')} variant="outlined" size="small" />
                  {watch('table_number') && (
                    <Chip
                      label={`${t('public_feedback.table_prefix')} ${watch('table_number')}`}
                      variant="outlined"
                      size="small"
                    />
                  )}
                </Box>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Rating value={watchRating} readOnly size="small" />
                  <Typography variant="body2">{getRatingLabel(watchRating)}</Typography>
                </Box>
                <Typography variant="body2">
                  {watch('comment') || t('new_feedback.preview_comment_placeholder')}
                </Typography>
              </Alert>
            </Grid>

            {/* Actions */}
            <Grid item xs={12}>
              <Box display="flex" gap={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  onClick={() => navigate('/feedback')}
                  disabled={createFeedbackMutation.isLoading}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={
                    createFeedbackMutation.isLoading ? <CircularProgress size={20} /> : <SaveIcon />
                  }
                  disabled={createFeedbackMutation.isLoading}
                >
                  {createFeedbackMutation.isLoading
                    ? t('new_feedback.saving_button')
                    : t('new_feedback.save_button')}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default NewFeedback;
