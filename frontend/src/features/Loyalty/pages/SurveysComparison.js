import React from 'react';
import { Box, Typography, Paper, CircularProgress, Alert, Grid } from '@mui/material';
import { useAuth } from '@/app/providers/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { useForm, FormProvider } from 'react-hook-form';
import { useSurveys } from '@/features/Fidelidade/Avaliacoes/api/surveyService'; // To get list of surveys
import { useSurveysComparisonAnalytics } from '@/features/Satisfaction/api/satisfactionService'; // New hook
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import SurveyMultiSelect from '../components/SurveyMultiSelect';
import ComparisonMetricsTable from '../components/ComparisonMetricsTable';

const SurveysComparison = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const restaurantId = user?.restaurants?.[0]?.id;

  const methods = useForm({
    defaultValues: {
      selectedSurveyIds: [],
    },
  });

  const { control, watch, setValue } = methods;

  const selectedSurveyIds = watch('selectedSurveyIds');

  const {
    data: surveysData,
    isLoading: isLoadingSurveys,
    isError: isErrorSurveys,
  } = useSurveys(restaurantId);
  const {
    data: comparisonData,
    isLoading: isLoadingComparison,
    isError: isErrorComparison,
  } = useSurveysComparisonAnalytics(restaurantId, selectedSurveyIds);

  const handleSurveySelect = (event) => {
    setValue('selectedSurveyIds', event.target.value);
  };

  if (isLoadingSurveys || isLoadingComparison) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (isErrorSurveys || isErrorComparison) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {t('common.error_loading_data')}
      </Alert>
    );
  }

  const surveys = surveysData || [];

  return (
    <FormProvider {...methods}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('fidelity_general.surveys_comparison_title')}
        </Typography>

        <SurveyMultiSelect
          control={control}
          surveys={surveys}
          handleSurveySelect={handleSurveySelect}
        />

        {selectedSurveyIds.length > 0 && comparisonData && comparisonData.length > 0 ? (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  {t('surveys_comparison.nps_comparison')}
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="title" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="averageNps" fill="#8884d8" name="NPS" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  {t('surveys_comparison.csat_comparison')}
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="title" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="averageCsat" fill="#82ca9d" name="CSAT" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <ComparisonMetricsTable comparisonData={comparisonData} />
            </Grid>
          </Grid>
        ) : selectedSurveyIds.length > 0 && comparisonData && comparisonData.length === 0 ? (
          <Alert severity="info">{t('surveys_comparison.no_data_for_selected_surveys')}</Alert>
        ) : (
          <Alert severity="info">{t('surveys_comparison.select_surveys_to_compare')}</Alert>
        )}
      </Box>
    </FormProvider>
  );
};

export default SurveysComparison;
