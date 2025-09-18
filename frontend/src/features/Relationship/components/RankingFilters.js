import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, Paper } from '@mui/material';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

const RankingFilters = ({ control, onSortByChange }) => {
  const { t } = useTranslation();

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Controller
        name="sortBy"
        control={control}
        render={({ field }) => (
          <FormControl fullWidth>
            <InputLabel>{t('ranking.sort_by')}</InputLabel>
            <Select
              {...field}
              label={t('ranking.sort_by')}
              onChange={(e) => {
                field.onChange(e);
                onSortByChange(e);
              }}
            >
              <MenuItem value="total_visits">{t('ranking.total_visits')}</MenuItem>
              <MenuItem value="loyalty_points">{t('ranking.loyalty_points')}</MenuItem>
              <MenuItem value="total_spent">{t('ranking.total_spent')}</MenuItem>
            </Select>
          </FormControl>
        )}
      />
    </Paper>
  );
};

export default RankingFilters;
