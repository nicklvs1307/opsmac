import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Alert,
  FormHelperText,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import QRCode from 'qrcode.react';
import { useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/app/providers/contexts/AuthContext'; // Importar useAuth
import { usePermissions } from '../../hooks/usePermissions';
import { useForm, FormProvider, Controller, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import {
  useCreateSurvey,
  useSurveyRewards,
  useSurveyNpsCriteria,
} from '../api/surveyService';
import SurveyQuestionField from '../components/SurveyQuestionField';

const surveySchema = yup.object().shape({
  surveyType: yup.string().required('O tipo de pesquisa é obrigatório'),
  title: yup.string().required('O título é obrigatório'),
  slug: yup.string(),
  description: yup.string(),
  rewardId: yup.string(),
  couponValidityDays: yup.number(),
  questions: yup.array(),
});

const SurveyCreatePage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [createdSurveyId, setCreatedSurveyId] = useState(null);
  const [createdSurveySlug, setCreatedSurveySlug] = useState(null);
  const [openQrCodeDialog, setOpenQrCodeDialog] = useState(false);
  const [openQuestionDialog, setOpenQuestionDialog] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState({
    question_text: '',
    question_type: 'text',
    nps_criterion_id: null,
  });

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { can } = usePermissions();
  const restaurantId = user?.restaurants?.[0]?.id;

  const getPublicSurveyLink = (restaurantSlug, surveySlug) => {
    if (!restaurantSlug) {
      return null;
    }
    return `${window.location.origin}/public/surveys/${restaurantSlug}/${surveySlug}`;
  };

  const methods = useForm({
    resolver: yupResolver(surveySchema),
    defaultValues: {
      surveyType: '',
      title: '',
      slug: '',
      description: '',
      rewardId: '',
      couponValidityDays: '',
      questions: [],
    },
  });

  const {
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = methods;

  const surveyType = watch('surveyType');
  const questions = watch('questions');

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'questions',
  });

  const { data: rewards, isLoading: isLoadingRewards } = useSurveyRewards(restaurantId, {
    onError: (error) => {
      toast.error(
        t('survey_create.error_message', { message: error.response?.data?.msg || error.message })
      );
    },
  });
  const { data: npsCriteria, isLoading: isLoadingNpsCriteria } = useSurveyNpsCriteria({
    onError: (error) => {
      toast.error(
        t('survey_create.error_message', { message: error.response?.data?.msg || error.message })
      );
    },
  });

  const createSurveyMutation = useCreateSurvey({
    onSuccess: (data) => {
      queryClient.invalidateQueries('surveys');
      toast.success(t('survey_create.success_message'));
      setCreatedSurveyId(data.id);
      setCreatedSurveySlug(data.slug);
      setActiveStep(3);
    },
    onError: (error) => {
      toast.error(
        t('survey_create.error_message', { message: error.response?.data?.msg || error.message })
      );
    },
  });

  // Efeito para pré-popular as perguntas com base no tipo de pesquisa
  useEffect(() => {
    if (surveyType === 'nps_only') {
      if (npsCriteria && npsCriteria.length > 0) {
        const npsQuestions = npsCriteria.map((criterion, index) => ({
          question_text: t('survey_create.nps_question_text', { name: criterion.name }),
          question_type: 'nps',
          order: index + 1,
          nps_criterion_id: criterion.id,
          options: [], // Adicionar options vazias para consistência
        }));
        setValue('questions', npsQuestions);
      } else {
        setValue('questions', []);
      }
    } else {
      setValue('questions', []); // Limpa para outros tipos de pesquisa
    }
  }, [surveyType, npsCriteria, t, setValue]);

  // Verifica se o módulo de pesquisas/feedback está habilitado
  if (!can('fidelity:satisfaction:surveys', 'create')) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="warning">
          {t('common.module_not_enabled', { moduleName: t('modules.satisfaction') })}
        </Alert>
      </Box>
    );
  }

  const handleNext = async () => {
    let isValid = true;
    if (activeStep === 0) {
      isValid = await methods.trigger('surveyType');
    } else if (activeStep === 1) {
      isValid = await methods.trigger([
        'title',
        'slug',
        'description',
        'rewardId',
        'couponValidityDays',
        'questions',
      ]);
    }

    if (isValid) {
      setActiveStep((prev) => prev + 1);
    } else {
      toast.error(t('common.form_validation_error'));
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleCreate = (data) => {
    const surveyData = {
      type: data.surveyType,
      title: data.title,
      slug: data.slug,
      description: data.description,
      reward_id: data.rewardId || null,
      coupon_validity_days: data.couponValidityDays ? parseInt(data.couponValidityDays, 10) : null,
      questions: data.questions.map((q) => ({
        question_text: q.question_text,
        question_type: q.question_type,
        nps_criterion_id: q.nps_criterion_id || null,
        options: q.options || [],
      })),
    };
    createSurveyMutation.mutate(surveyData);
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Controller
            name="surveyType"
            control={control}
            rules={{ required: t('survey_create.select_type_error') }}
            render={({ field }) => (
              <FormControl fullWidth sx={{ mb: 3 }} error={!!errors.surveyType}>
                <InputLabel>{t('survey_create.survey_type_label')}</InputLabel>
                <Select {...field} label={t('survey_create.survey_type_label')}>
                  <MenuItem value="nps_only">{t('survey_create.type_nps_dynamic')}</MenuItem>
                  <MenuItem value="custom">{t('survey_create.type_custom_soon')}</MenuItem>
                  <MenuItem value="delivery_csat">{t('survey_create.type_delivery_csat')}</MenuItem>
                  <MenuItem value="menu_feedback">{t('survey_create.type_menu_feedback')}</MenuItem>
                  <MenuItem value="customer_profile">
                    {t('survey_create.type_customer_profile')}
                  </MenuItem>
                  <MenuItem value="salon_ratings">{t('survey_create.type_salon_ratings')}</MenuItem>
                  <MenuItem value="salon_like_dislike">
                    {t('survey_create.type_salon_like_dislike')}
                  </MenuItem>
                </Select>
                <FormHelperText>{errors.surveyType?.message}</FormHelperText>
              </FormControl>
            )}
          />
        );
      case 1:
        return (
          <Box sx={{ mb: 3 }}>
            <Controller
              name="title"
              control={control}
              rules={{ required: t('survey_create.title_required_error') }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label={t('survey_create.title_label')}
                  variant="outlined"
                  margin="normal"
                  error={!!errors.title}
                  helperText={errors.title?.message}
                />
              )}
            />
            <Controller
              name="slug"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label={t('survey_create.slug_label')}
                  variant="outlined"
                  margin="normal"
                  helperText={t('survey_create.slug_helper')}
                  error={!!errors.slug}
                />
              )}
            />
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label={t('survey_create.description_label')}
                  variant="outlined"
                  margin="normal"
                  multiline
                  rows={3}
                  error={!!errors.description}
                />
              )}
            />
            <Controller
              name="rewardId"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth margin="normal" error={!!errors.rewardId}>
                  <InputLabel>{t('survey_create.reward_label')}</InputLabel>
                  <Select {...field} label={t('survey_create.reward_label')}>
                    <MenuItem value="">
                      <em>{t('common.none')}</em>
                    </MenuItem>
                    {isLoadingRewards ? (
                      <MenuItem disabled>{t('survey_create.loading_rewards')}</MenuItem>
                    ) : (
                      rewards?.map((reward) => (
                        <MenuItem key={reward.id} value={reward.id}>
                          {reward.name}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                  <FormHelperText>{errors.rewardId?.message}</FormHelperText>
                </FormControl>
              )}
            />
            <Controller
              name="couponValidityDays"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label={t('survey_create.coupon_validity_days_label')}
                  type="number"
                  variant="outlined"
                  margin="normal"
                  InputProps={{ inputProps: { min: 1 } }}
                  error={!!errors.couponValidityDays}
                  helperText={errors.couponValidityDays?.message}
                />
              )}
            />
            <Box mt={4}>
              <Typography variant="h6">{t('survey_create.questions_title')}</Typography>
              {fields.map((field, index) => (
                <SurveyQuestionField
                  key={field.id}
                  questionIndex={index}
                  onRemoveQuestion={() => remove(index)}
                />
              ))}
              <Button
                startIcon={<AddCircleOutlineIcon />}
                onClick={() =>
                  append({
                    question_text: '',
                    question_type: 'text',
                    nps_criterion_id: null,
                    options: [],
                  })
                }
                variant="outlined"
                sx={{ mt: 2 }}
              >
                {t('survey_create.add_question_button')}
              </Button>
              {errors.questions && (
                <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                  {errors.questions.message}
                </Typography>
              )}
            </Box>
          </Box>
        );
      case 2:
        return <Typography>{t('survey_create.review_details')}</Typography>;
      case 3: // ... (código do passo 3 permanece o mesmo)
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              {t('survey_create.created_success_title')}
            </Typography>
            {createdSurveyId && createdSurveySlug && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="body1">
                  {t('survey_create.public_link_label')}{' '}
                  <a
                    href={`/public/surveys/${createdSurveySlug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >{`/public/surveys/${createdSurveySlug}`}</a>
                </Typography>
                <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() =>
                      navigator.clipboard
                        .writeText(`${window.location.origin}/public/surveys/${createdSurveySlug}`)
                        .then(() => toast.success(t('common.link_copied')))
                    }
                  >
                    {t('common.copy_link')}
                  </Button>
                  <Button variant="outlined" onClick={() => setOpenQrCodeDialog(true)}>
                    {t('survey_create.generate_qr_code_button')}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => navigate(`/fidelity/surveys/edit/${createdSurveyId}`)}
                  >
                    {t('survey_create.edit_survey_button')}
                  </Button>
                </Box>
              </Box>
            )}
            <Button
              variant="contained"
              onClick={() => navigate('/satisfaction/surveys')}
              sx={{ mt: 2 }}
            >
              {t('survey_create.view_all_surveys_button')}
            </Button>
            <Dialog open={openQrCodeDialog} onClose={() => setOpenQrCodeDialog(false)}>
              <DialogTitle>{t('survey_create.qr_code_dialog_title')}</DialogTitle>
              <DialogContent sx={{ display: 'flex', justifyContent: 'center' }}>
                {/* Integrar QR Code aqui */}
                <Paper
                  elevation={3}
                  sx={{
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <QRCode
                    value={`${window.location.origin}/public/surveys/${createdSurveySlug}`}
                    size={256}
                    level="H"
                    renderAs="canvas"
                    id="surveyQRCodeCanvas"
                  />
                  <Button
                    variant="contained"
                    sx={{ mt: 2 }}
                    onClick={() => {
                      const canvas = document.getElementById('surveyQRCodeCanvas');
                      if (canvas) {
                        const pngUrl = canvas.toDataURL('image/png');
                        const downloadLink = document.createElement('a');
                        downloadLink.href = pngUrl;
                        downloadLink.download = `survey-${createdSurveySlug}-qrcode.png`;
                        document.body.appendChild(downloadLink);
                        downloadLink.click();
                        document.body.removeChild(downloadLink);
                        toast.success(t('survey_create.qr_code_download_success'));
                      } else {
                        toast.error(t('survey_create.qr_code_download_error'));
                      }
                    }}
                  >
                    {t('survey_create.download_qr_code_button')}
                  </Button>
                </Paper>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpenQrCodeDialog(false)}>{t('common.close')}</Button>
              </DialogActions>
            </Dialog>
          </Box>
        );
      default:
        return <Typography>{t('survey_create.unknown_step')}</Typography>;
    }
  };

  return (
    <FormProvider {...methods}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          {t('survey_create.main_title')}
        </Typography>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Stepper activeStep={activeStep} orientation="vertical" sx={{ mt: 2 }}>
            {[
              t('survey_create.step_choose_type'),
              t('survey_create.step_configure_details'),
              t('survey_create.step_review_and_create'),
              t('survey_create.step_actions'),
            ].map((label, index) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
                <StepContent>
                  {renderStepContent(index)}
                  <Box sx={{ mt: 2 }}>
                    <Button disabled={activeStep === 0} onClick={handleBack} sx={{ mr: 1 }}>
                      {t('common.back')}
                    </Button>
                    <Button
                      variant="contained"
                      onClick={activeStep === 2 ? handleSubmit(handleCreate) : handleNext}
                      disabled={createSurveyMutation.isLoading}
                    >
                      {createSurveyMutation.isLoading ? (
                        <CircularProgress size={24} />
                      ) : activeStep === 2 ? (
                        t('survey_create.create_survey_button')
                      ) : (
                        t('common.next')
                      )}
                    </Button>
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </Paper>
      </Box>
    </FormProvider>
  );
};

export default SurveyCreate;
