import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import { Stars as StarsIcon } from '@mui/icons-material';
import { useAuth } from '../../../contexts/AuthContext';
import axiosInstance from '../../../api/axiosInstance';
import SurveyRewardProgram from './SurveyRewardProgram';
import { useForm, useFieldArray } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const SurveyDashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const restaurantId = user?.restaurants?.[0]?.id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rewards, setRewards] = useState([]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      rewards_per_response: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'rewards_per_response',
  });

  const fetchRewards = useCallback(async () => {
    if (!restaurantId) return;
    try {
      const response = await axiosInstance.get(`/api/rewards/restaurant/${restaurantId}`);
      setRewards(response.data.rewards);
    } catch (err) {
      console.error(t('survey_dashboard.error_fetching_rewards_console'), err);
      toast.error(t('survey_dashboard.error_fetching_rewards'));
    }
  }, [restaurantId, t]);

  const fetchRestaurantData = useCallback(async () => {
    if (!restaurantId) return;
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/settings/${restaurantId}`);
      const { settings } = response.data;
      const surveyRewardSettings = settings?.survey_reward_settings || {};
      reset(surveyRewardSettings);
    } catch (err) {
      console.error(t('survey_dashboard.error_fetching_settings_console'), err);
      toast.error(t('survey_dashboard.error_loading_settings'));
    } finally {
      setLoading(false);
    }
  }, [restaurantId, reset, t]);

  const onSaveSurveyRewardProgram = async (data) => {
    try {
      setLoading(true);
      await axiosInstance.put(`/api/settings/${restaurantId}`, {
        settings: {
          survey_reward_settings: data,
        },
      });
      toast.success(t('survey_dashboard.save_success'));
      fetchRestaurantData();
    } catch (err) {
      console.error(t('survey_dashboard.error_saving_settings_console'), err);
      toast.error(err.response?.data?.message || t('survey_dashboard.error_saving_settings'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRewards();
    fetchRestaurantData();
  }, [fetchRewards, fetchRestaurantData]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Box mb={4}>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 'bold',
            color: '#2c3e50',
            mb: 1,
          }}
        >
          {t('survey_dashboard.main_title')}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: '#7f8c8d',
            mb: 3,
          }}
        >
          {t('survey_dashboard.main_description')}
        </Typography>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={0} indicatorColor="primary" textColor="primary">
          <Tab label={t('survey_dashboard.tab_settings')} icon={<StarsIcon />} />
        </Tabs>
      </Paper>

      <SurveyRewardProgram
        control={control}
        errors={errors}
        fields={fields}
        append={append}
        remove={remove}
        rewards={rewards}
        loading={loading}
        onSave={handleSubmit(onSaveSurveyRewardProgram)}
        t={t}
      />
    </Box>
  );
};

export default SurveyDashboard;
