import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Alert,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/app/providers/contexts/AuthContext'; // Importar useAuth
import usePermissions from '@/hooks/usePermissions';
import { useForm, FormProvider, Controller, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import SurveyQuestionField from '../components/SurveyQuestionField'; // Importar o componente de pergunta

const surveySchema = yup.object().shape({
  title: yup.string().required('O título é obrigatório.'),
  slug: yup.string().optional(),
  description: yup.string().optional(),
  rewardId: yup.string().optional().nullable(),
  couponValidityDays: yup.number().min(1, 'Mínimo de 1 dia.').optional().nullable(),
  questions: yup.array().of(
    yup.object().shape({
      question_text: yup.string().required('O texto da pergunta é obrigatório.'),
      question_type: yup.string().required('O tipo da pergunta é obrigatório.'),
      nps_criterion_id: yup.string().when('question_type', {
        is: 'nps',
        then: (schema) => schema.required('O critério NPS é obrigatório para perguntas NPS.'),
        otherwise: (schema) => schema.optional().nullable(),
      }),
      options: yup.array().of(yup.object().shape({ text: yup.string().required('A opção é obrigatória.') })).optional(),
    })
  ).min(1, 'Adicione pelo menos uma pergunta.').required('Adicione pelo menos uma pergunta.'),
});

import {
  useSurveyDetails,
  useSurveyRewards,
  useSurveyNpsCriteria,
  useUpdateSurvey,
} from '../api/surveyService';

const SurveyEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { can } = usePermissions();
  const restaurantId = user?.restaurants?.[0]?.id;

  const methods = useForm({
    resolver: yupResolver(surveySchema),
    defaultValues: {
      title: '',
      slug: '',
      description: '',
      rewardId: '',
      couponValidityDays: '',
      questions: [],
    },
  });

  const { handleSubmit, control, watch, setValue, formState: { errors } } = methods;

  const questions = watch('questions');

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'questions',
  });

  const { isLoading, isError, error } = useSurveyDetails(id, {
    onSuccess: (data) => {
      setValue('title', data.title);
      setValue('slug', data.slug);
      setValue('description', data.description);
      setValue('rewardId', data.reward_id || '');
      setValue('couponValidityDays', data.coupon_validity_days || '');
      setValue('questions', data.questions || []);
    },
    onError: (err) => {
      toast.error(t('survey_edit.load_error', { message: err.response?.data?.msg || err.message }));
    },
  });

  const { data: rewards, isLoading: isLoadingRewards } = useSurveyRewards(restaurantId, {
    onError: (error) => {
      toast.error(
        t('survey_edit.load_error', { message: error.response?.data?.msg || error.message })
      );
    },
  });

  const { data: npsCriteria, isLoading: isLoadingNpsCriteria } = useSurveyNpsCriteria({
    onError: (error) => {
      toast.error(
        t('survey_edit.load_error', { message: error.response?.data?.msg || error.message })
      );
    },
  });

  const updateSurveyMutation = useUpdateSurvey({
    onSuccess: () => {
      queryClient.invalidateQueries(['survey', id]);
      queryClient.invalidateQueries('surveys');
      toast.success(t('survey_edit.update_success'));
      navigate('/satisfaction/surveys'); // {t('survey_edit.redirect_to_list')}
    },
    onError: (err) => {
      toast.error(
        t('survey_edit.update_error', { message: err.response?.data?.msg || err.message })
      );
    },
  });

  // Verifica se o módulo de pesquisas/feedback está habilitado
  if (!can('fidelity:satisfaction:surveys', 'update')) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="warning">
          {t('common.module_not_enabled', { moduleName: t('modules.satisfaction') })}
        </Alert>
      </Box>
    );
  }

  

  const handleUpdate = (data) => {
    const surveyData = {
      title: data.title,
      slug: data.slug,
      description: data.description,
      reward_id: data.rewardId || null,
      coupon_validity_days: data.couponValidityDays ? parseInt(data.couponValidityDays, 10) : null,
      questions: data.questions.map((q, index) => ({
        ...q,
        order: index + 1,
        options: q.options || [],
      })),
    };
    updateSurveyMutation.mutate({ id, surveyData });
  };

  if (isLoading) return <CircularProgress />;
  if (isError)
    return (
      <Typography color="error">
        {t('common.error')}: {error.message}
      </Typography>
    );

  return (
    <FormProvider {...methods}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          {t('survey_edit.title')}
        </Typography>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Controller
            name="title"
            control={control}
            rules={{ required: t('survey_edit.title_required_error') }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label={t('survey_edit.title_label')}
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
                label={t('survey_edit.slug_label')}
                variant="outlined"
                margin="normal"
                helperText={t('survey_edit.slug_helper')}
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
                label={t('survey_edit.description_label')}
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
                <InputLabel>{t('survey_edit.reward_label')}</InputLabel>
                <Select
                  {...field}
                  label={t('survey_edit.reward_label')}
                >
                  <MenuItem value="">
                    <em>{t('common.none')}</em>
                  </MenuItem>
                  {isLoadingRewards ? (
                    <MenuItem disabled>{t('survey_edit.loading_rewards')}</MenuItem>
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
                label={t('survey_edit.coupon_validity_days_label')}
                type="number"
                variant="outlined"
                margin="normal"
                InputProps={{ inputProps: { min: 1 } }}
                error={!!errors.couponValidityDays}
                helperText={errors.couponValidityDays?.message}
              />
            )}
          />

          <Typography variant="h5" sx={{ mt: 3, mb: 2 }}>
            {t('survey_edit.questions_title')}
          </Typography>
          {fields.map((field, index) => (
            <SurveyQuestionField key={field.id} questionIndex={index} onRemoveQuestion={() => remove(index)} />
          ))}
          <Button
            variant="contained"
            onClick={() => append({ question_text: '', question_type: 'text', nps_criterion_id: null, options: [] })}
            sx={{ mb: 2 }}
          >
            {t('survey_edit.add_question_button')}
          </Button>
          {errors.questions && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {errors.questions.message}
            </Typography>
          )}

          <Box sx={{ mt: 3 }}>
            <Button
              variant="contained"
              onClick={handleSubmit(handleUpdate)} // Alterado para handleSubmit(handleUpdate)
              disabled={updateSurveyMutation.isLoading}
            >
              {updateSurveyMutation.isLoading ? (
                <CircularProgress size={24} />
              ) : (
                t('survey_edit.save_changes_button')
              )}
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/satisfaction/surveys')}
              sx={{ ml: 2 }}
            >
              {t('common.cancel')}
            </Button>
          </Box>
        </Paper>
      </Box>
    </FormProvider>
  );
};

export default SurveyEdit;
