import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useTranslation } from 'react-i18next';

const MetricSelector = ({ selectedMetric, onMetricChange }) => {
  const { t } = useTranslation();

  return (
    <FormControl fullWidth sx={{ mb: 3 }}>
      <InputLabel>{t('monthly_summary.select_metric')}</InputLabel>
      <Select
        value={selectedMetric}
        label={t('monthly_summary.select_metric')}
        onChange={onMetricChange}
      >
        <MenuItem value="checkins">{t('monthly_summary.total_checkins')}</MenuItem>
        <MenuItem value="newCustomers">{t('monthly_summary.new_customers')}</MenuItem>
        <MenuItem value="surveys">{t('monthly_summary.total_survey_responses')}</MenuItem>
        <MenuItem value="coupons">{t('monthly_summary.redeemed_coupons')}</MenuItem>
        <MenuItem value="nps">{t('monthly_summary.avg_nps_score')}</MenuItem>
        <MenuItem value="csat">{t('monthly_summary.avg_rating')}</MenuItem>
        <MenuItem value="loyaltyPoints">{t('monthly_summary.total_loyalty_points')}</MenuItem>
        <MenuItem value="totalSpent">{t('monthly_summary.total_spent_overall')}</MenuItem>
        <MenuItem value="engagementRate">{t('monthly_summary.engagement_rate')}</MenuItem>
        <MenuItem value="loyaltyRate">{t('monthly_summary.loyalty_rate')}</MenuItem>
      </Select>
    </FormControl>
  );
};

export default MetricSelector;
