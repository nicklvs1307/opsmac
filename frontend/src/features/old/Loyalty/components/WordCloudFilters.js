import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Grid,
} from '@mui/material';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

const WordCloudFilters = ({ control, surveysData, handleFilterChange, handleClearFilters }) => {
  const { t } = useTranslation();

  const feedbackTypes = useMemo(
    () => [
      { value: 'compliment', label: t('feedback_list.type_compliment') },
      { value: 'complaint', label: t('feedback_list.type_complaint') },
      { value: 'suggestion', label: t('feedback_list.type_suggestion') },
      { value: 'criticism', label: t('feedback_list.type_criticism') },
    ],
    [t]
  );

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        {t('common.filters')}
      </Typography>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={6} md={3}>
          <Controller
            name="startDate"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={t('feedback_list.visit_date_label') + ' (Início)'}
                type="date"
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
                onChange={(e) => {
                  field.onChange(e);
                  handleFilterChange(e);
                }}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Controller
            name="endDate"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={t('feedback_list.visit_date_label') + ' (Fim)'}
                type="date"
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
                onChange={(e) => {
                  field.onChange(e);
                  handleFilterChange(e);
                }}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Controller
            name="feedbackType"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth>
                <InputLabel>{t('feedback_list.type_label')}</InputLabel>
                <Select
                  {...field}
                  label={t('feedback_list.type_label')}
                  onChange={(e) => {
                    field.onChange(e);
                    handleFilterChange(e);
                  }}
                >
                  <MenuItem value="">{t('feedback_list.all_types')}</MenuItem>
                  {feedbackTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Controller
            name="surveyId"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth>
                <InputLabel>{t('survey_list.title')}</InputLabel>
                <Select
                  {...field}
                  label={t('survey_list.title')}
                  onChange={(e) => {
                    field.onChange(e);
                    handleFilterChange(e);
                  }}
                >
                  <MenuItem value="">{t('common.all')}</MenuItem>
                  {surveysData?.map((survey) => (
                    <MenuItem key={survey.id} value={survey.id}>
                      {survey.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />
        </Grid>
        <Grid item xs={12} display="flex" justifyContent="flex-end">
          <Button variant="outlined" onClick={handleClearFilters}>
            {t('common.clear_filters')}
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default WordCloudFilters;
