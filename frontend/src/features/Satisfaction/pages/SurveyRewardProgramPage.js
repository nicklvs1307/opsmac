import React from 'react';
import { usePermissions } from '../../hooks/usePermissions';
import { Box, CircularProgress, Alert } from '@mui/material';
import { useAuth } from '@/app/providers/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  fetchRewards,
  fetchSurveyRewardProgram,
  saveSurveyRewardProgram,
} from '../api/surveyRewardProgramService';
import { useForm, useFieldArray } from 'react-hook-form';
import SurveyRewardProgramComponent from '../components/SurveyRewardProgramComponent'; // Import the component

const SurveyRewardProgramPage = () => {
  const { can } = usePermissions();
  const { t } = useTranslation();
  const { user } = useAuth();
  const restaurantId = user?.restaurants?.[0]?.id;
  const token = user?.token;
  const queryClient = useQueryClient();

  const {
    data: rewards,
    isLoading: isLoadingRewards,
    isError: isErrorRewards,
    error: errorRewards,
  } = useQuery(['rewards', restaurantId], () => fetchRewards({ restaurantId, token }), {
    enabled: !!restaurantId && !!token,
  });

  const {
    data: programData,
    isLoading: isLoadingProgram,
    isError: isErrorProgram,
    error: errorProgram,
  } = useQuery(
    ['surveyRewardProgram', restaurantId],
    () => fetchSurveyRewardProgram({ restaurantId, token }),
    {
      enabled: !!restaurantId && !!token,
      onSuccess: (data) => {
        reset(data); // Set form default values after data is fetched
      },
    }
  );

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: programData || { rewards_per_response: [] },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'rewards_per_response',
  });

  const saveProgramMutation = useMutation(saveSurveyRewardProgram, {
    onSuccess: () => {
      queryClient.invalidateQueries('surveyRewardProgram');
      toast.success(t('survey_reward_program.save_success'));
    },
    onError: (err) => {
      toast.error(err.message || t('survey_reward_program.save_error'));
    },
  });

  const onSubmit = (data) => {
    saveProgramMutation.mutate({ programData: { ...data, restaurant_id: restaurantId }, token });
  };

  if (!can('survey_reward_program', 'read')) { // Assumindo permissão para acessar o programa de recompensas
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="warning">
          {t('common.module_not_enabled', { moduleName: t('modules.survey_reward_program') })}
        </Alert>
      </Box>
    );
  }

  if (isLoadingRewards || isLoadingProgram) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (isErrorRewards || isErrorProgram) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {errorRewards?.message || errorProgram?.message || t('common.error_loading_data')}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <SurveyRewardProgramComponentComponent
        control={control}
        errors={errors}
        fields={fields}
        append={append}
        remove={remove}
        rewards={rewards || []}
        loading={saveProgramMutation.isLoading}
        onSave={handleSubmit(onSubmit)}
      />
    </Box>
  );
};

export default SurveyRewardProgramPage;
