import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  Paper,
} from '@mui/material';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

const SurveyMultiSelect = ({ control, surveys, handleSurveySelect }) => {
  const { t } = useTranslation();

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Controller
        name="selectedSurveyIds"
        control={control}
        render={({ field }) => (
          <FormControl fullWidth>
            <InputLabel id="select-surveys-label">
              {t('surveys_comparison.select_surveys')}
            </InputLabel>
            <Select
              {...field}
              labelId="select-surveys-label"
              multiple
              onChange={(e) => {
                field.onChange(e);
                handleSurveySelect(e);
              }}
              input={
                <OutlinedInput
                  id="select-multiple-chip"
                  label={t('surveys_comparison.select_surveys')}
                />
              }
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={surveys.find((s) => s.id === value)?.title || value} />
                  ))}
                </Box>
              )}
            >
              {surveys.map((survey) => (
                <MenuItem key={survey.id} value={survey.id}>
                  {survey.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      />
    </Paper>
  );
};

export default SurveyMultiSelect;
