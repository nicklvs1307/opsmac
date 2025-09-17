import React from 'react';
import {
  Box,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
} from '@mui/material';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

const EvolutionFilters = ({ control, onApplyFilters }) => {
  const { t } = useTranslation();

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={3}>
          <Controller
            name="startDate"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={t('evolution.start_date')}
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <Controller
            name="endDate"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={t('evolution.end_date')}
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <Controller
            name="granularity"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth>
                <InputLabel>{t('evolution.granularity')}</InputLabel>
                <Select {...field} label={t('evolution.granularity')}>
                  <MenuItem value="day">{t('evolution.day')}</MenuItem>
                  <MenuItem value="week">{t('evolution.week')}</MenuItem>
                  <MenuItem value="month">{t('evolution.month')}</MenuItem>
                  <MenuItem value="year">{t('evolution.year')}</MenuItem>
                </Select>
              </FormControl>
            )}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <Button variant="contained" fullWidth onClick={onApplyFilters}>
            {t('evolution.apply_filters')}
          </Button>
        </Grid>
        <Grid item xs={12}>
          <Controller
            name="selectedMetrics"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>{t('evolution.select_metrics')}</InputLabel>
                <Select
                  {...field}
                  multiple
                  renderValue={(selected) =>
                    selected.map((metric) => t(`evolution.${metric}`)).join(', ')
                  }
                >
                  <MenuItem value="checkins">{t('evolution.checkins')}</MenuItem>
                  <MenuItem value="newCustomers">{t('evolution.new_customers')}</MenuItem>
                  <MenuItem value="surveys">{t('evolution.total_survey_responses')}</MenuItem>
                  <MenuItem value="coupons">{t('evolution.redeemed_coupons')}</MenuItem>
                  <MenuItem value="nps">{t('evolution.nps_score')}</MenuItem>
                  <MenuItem value="csat">{t('evolution.csat_score')}</MenuItem>
                  <MenuItem value="loyaltyPoints">{t('evolution.total_loyalty_points')}</MenuItem>
                  <MenuItem value="totalSpent">{t('evolution.total_spent_overall')}</MenuItem>
                  <MenuItem value="engagementRate">{t('evolution.engagement_rate')}</MenuItem>
                  <MenuItem value="loyaltyRate">{t('evolution.loyalty_rate')}</MenuItem>
                </Select>
              </FormControl>
            )}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default EvolutionFilters;
