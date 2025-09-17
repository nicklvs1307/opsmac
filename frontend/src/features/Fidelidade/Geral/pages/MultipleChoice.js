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
} from '@mui/material';
import { useAuth } from '@/app/providers/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { useSurveys } from '@/features/Fidelidade/Avaliacoes/api/surveyService';
import { useQuestionAnswersDistribution } from '@/features/Fidelidade/Avaliacoes/api/satisfactionService';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import SurveyQuestionSelector from '../components/SurveyQuestionSelector';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1957'];

const MultipleChoice = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const restaurantId = user?.restaurants?.[0]?.id;

  const methods = useForm({
    defaultValues: {
      selectedSurveyId: '',
      selectedQuestionId: '',
    },
  });

  const { control, watch, setValue } = methods;

  const selectedSurveyId = watch('selectedSurveyId');
  const selectedQuestionId = watch('selectedQuestionId');

  const {
    data: surveysData,
    isLoading: isLoadingSurveys,
    isError: isErrorSurveys,
  } = useSurveys(restaurantId);

  const selectedSurvey = useMemo(
    () => surveysData?.find((survey) => survey.id === selectedSurveyId),
    [selectedSurveyId, surveysData]
  );

  const multipleChoiceQuestions = useMemo(
    () =>
      selectedSurvey?.questions?.filter(
        (q) => q.question_type === 'multiple_choice' || q.question_type === 'single_choice'
      ) || [],
    [selectedSurvey]
  );

  const {
    data: distributionData,
    isLoading: isLoadingDistribution,
    isError: isErrorDistribution,
  } = useQuestionAnswersDistribution(selectedSurveyId, selectedQuestionId);

  const handleSurveyChange = (event) => {
    setValue('selectedSurveyId', event.target.value);
    setValue('selectedQuestionId', ''); // Reset question when survey changes
  };

  const handleQuestionChange = (event) => {
    setValue('selectedQuestionId', event.target.value);
  };

  if (isLoadingSurveys) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (isErrorSurveys) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {t('common.error_loading_data')}
      </Alert>
    );
  }

  const prepareChartData = (distribution) => {
    return distribution
      ? Object.entries(distribution).map(([name, value]) => ({
          name,
          value,
        }))
      : [];
  };

  const chartData = prepareChartData(distributionData?.distribution);

  return (
    <FormProvider {...methods}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('fidelity_general.multiple_choice_analysis_title')}
        </Typography>

      <SurveyQuestionSelector
        control={control}
        surveysData={surveysData}
        isLoadingSurveys={isLoadingSurveys}
        selectedSurveyId={selectedSurveyId}
        multipleChoiceQuestions={multipleChoiceQuestions}
        handleSurveyChange={handleSurveyChange}
        handleQuestionChange={handleQuestionChange}
      />

      {selectedQuestionId && isLoadingDistribution ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
          <CircularProgress size={50} />
        </Box>
      ) : selectedQuestionId && isErrorDistribution ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {t('multiple_choice.error_loading_answers')}
        </Alert>
      ) : selectedQuestionId && distributionData && chartData.length > 0 ? (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            {t('multiple_choice.answer_distribution')}: "{distributionData.questionText}"
          </Typography>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={150}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
      ) : selectedQuestionId && distributionData && chartData.length === 0 ? (
        <Alert severity="info">{t('multiple_choice.no_answers_recorded')}</Alert>
      ) : (
        <Alert severity="info">{t('multiple_choice.select_question_to_view_distribution')}</Alert>
      )}
    </Box>
    </FormProvider>
  );
};

export default MultipleChoice;
