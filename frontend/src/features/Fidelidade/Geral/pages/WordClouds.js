import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Grid,
} from '@mui/material';
import { useAuth } from '@/app/providers/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { useFeedbackWordFrequency } from '@/features/Fidelidade/Avaliacoes/api/satisfactionService';
import { useSurveys } from '@/features/Fidelidade/Avaliacoes/api/surveyService';
import { WordCloud } from '@isoterik/react-word-cloud'; // Changed import
import WordCloudFilters from '../components/WordCloudFilters';

const WordClouds = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const restaurantId = user?.restaurants?.[0]?.id;

  const methods = useForm({
    defaultValues: {
      startDate: '',
      endDate: '',
      feedbackType: '',
      surveyId: '',
    },
  });

  const { control, watch, setValue } = methods;

  const filters = watch(); // Watch all fields to pass to useFeedbackWordFrequency

  const { data: surveysData, isLoading: isLoadingSurveys } = useSurveys(restaurantId);

  const {
    data: wordFrequencyData,
    isLoading: isLoadingWordFrequency,
    isError: isErrorWordFrequency,
  } = useFeedbackWordFrequency(restaurantId, filters);

  const handleFilterChange = (event) => {
    setValue(event.target.name, event.target.value);
  };

  const handleClearFilters = () => {
    reset({
      startDate: '',
      endDate: '',
      feedbackType: '',
      surveyId: '',
    });
  };

  const feedbackTypes = useMemo(
    () => [
      { value: 'compliment', label: t('feedback_list.type_compliment') },
      { value: 'complaint', label: t('feedback_list.type_complaint') },
      { value: 'suggestion', label: t('feedback_list.type_suggestion') },
      { value: 'criticism', label: t('feedback_list.type_criticism') },
    ],
    [t]
  );

  if (isLoadingSurveys) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  const prepareWordCloudData = (data) => {
    return data?.map((item) => ({ text: item.word, value: item.frequency })) || [];
  };

  const words = prepareWordCloudData(wordFrequencyData);

  return (
    <FormProvider {...methods}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('fidelity_general.word_clouds_title')}
        </Typography>

      <WordCloudFilters
        control={control}
        surveysData={surveysData}
        handleFilterChange={handleFilterChange}
        handleClearFilters={handleClearFilters}
      />

      {isLoadingWordFrequency ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
          <CircularProgress size={50} />
        </Box>
      ) : isErrorWordFrequency ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {t('word_clouds.error_loading_word_cloud')}
        </Alert>
      ) : words.length > 0 ? (
        <Paper elevation={3} sx={{ p: 3, height: 500 }}>
          <WordCloud
            words={words}
            options={{
              rotations: 2,
              rotationAngles: [-90, 0],
              fontSizes: [20, 60],
            }}
          />
        </Paper>
      ) : (
        <Alert severity="info">{t('word_clouds.no_data_to_display')}</Alert>
      )}
    </Box>
    </FormProvider>
  );
};

export default WordClouds;
