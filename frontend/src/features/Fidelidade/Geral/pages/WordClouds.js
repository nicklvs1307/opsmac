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
import { useFeedbackWordFrequency } from '../Avaliacoes/api/satisfactionService';
import { useSurveys } from '../Avaliacoes/api/surveyService';
import { WordCloud } from '@isoterik/react-word-cloud'; // Changed import

const WordClouds = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const restaurantId = user?.restaurants?.[0]?.id;

  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    feedbackType: '',
    surveyId: '',
  });

  const { data: surveysData, isLoading: isLoadingSurveys } = useSurveys(restaurantId);

  const {
    data: wordFrequencyData,
    isLoading: isLoadingWordFrequency,
    isError: isErrorWordFrequency,
  } = useFeedbackWordFrequency(restaurantId, filters);

  const handleFilterChange = (event) => {
    setFilters({
      ...filters,
      [event.target.name]: event.target.value,
    });
  };

  const handleClearFilters = () => {
    setFilters({
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

  const words = wordFrequencyData?.map(item => ({ text: item.word, value: item.frequency })) || [];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('fidelity_general.word_clouds_title')}
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('common.filters')}
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label={t('feedback_list.visit_date_label') + ' (Início)'}
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label={t('feedback_list.visit_date_label') + ' (Fim)'}
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>{t('feedback_list.type_label')}</InputLabel>
              <Select
                name="feedbackType"
                value={filters.feedbackType}
                onChange={handleFilterChange}
                label={t('feedback_list.type_label')}
              >
                <MenuItem value="">{t('feedback_list.all_types')}</MenuItem>
                {feedbackTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>{t('survey_list.title')}</InputLabel>
              <Select
                name="surveyId"
                value={filters.surveyId}
                onChange={handleFilterChange}
                label={t('survey_list.title')}
              >
                <MenuItem value="">{t('common.all')}</MenuItem>
                {surveysData?.map((survey) => (
                  <MenuItem key={survey.id} value={survey.id}>
                    {survey.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} display="flex" justifyContent="flex-end">
            <Button variant="outlined" onClick={handleClearFilters}>
              {t('common.clear_filters')}
            </Button>
          </Grid>
        </Grid>
      </Paper>

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
          <WordCloud words={words} options={{
            rotations: 2,
            rotationAngles: [-90, 0],
            fontSizes: [20, 60],
          }} />
        </Paper>
      ) : (
        <Alert severity="info">{t('word_clouds.no_data_to_display')}</Alert>
      )}
    </Box>
  );
};

export default WordClouds;