import React, { useState } from 'react';
import { Box, Grid, Paper, Typography, CircularProgress, Alert, TextField, Button } from '@mui/material';
import {
  BarChart as BarChartIcon,
  Star as StarIcon,
  ThumbUp as ThumbUpIcon,
} from '@mui/icons-material';
import { useAuth } from '@/app/providers/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { useSatisfactionAnalytics } from './api/satisfactionService';
import { format, subMonths } from 'date-fns';

// A simple card for displaying a metric
const MetricCard = ({ title, value, icon, bgColor }) => (
  <Paper
    sx={{
      p: 3,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
      background: bgColor,
      color: 'white',
      borderRadius: 2,
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    }}
  >
    {icon}
    <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mt: 1 }}>
      {value}
    </Typography>
    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
      {title}
    </Typography>
  </Paper>
);

const SatisfactionAnalyticsPage = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const restaurantId = user?.restaurants?.[0]?.id;

  const [startDate, setStartDate] = useState(format(subMonths(new Date(), 12), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const { data, isLoading, error } = useSatisfactionAnalytics(restaurantId, { start_date: startDate, end_date: endDate });

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 3 }}>
        {t('satisfaction_analytics.load_error')} ({error.message})
      </Alert>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('fidelity_general.satisfaction_analytics_title')}
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={5}>
                  <TextField
                      label={t('common.start_date')}
                      type="date"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                  />
              </Grid>
              <Grid item xs={12} md={5}>
                  <TextField
                      label={t('common.end_date')}
                      type="date"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                  />
              </Grid>
              <Grid item xs={12} md={2}>
                  <Button variant="contained" fullWidth>
                      {t('common.apply_filters')}
                  </Button>
              </Grid>
          </Grid>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <MetricCard
            title={t('satisfaction_analytics.total_responses')}
            value={data?.totalResponses || 0}
            icon={<BarChartIcon sx={{ fontSize: 40, color: 'white' }} />}
            bgColor="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <MetricCard
            title={t('satisfaction_analytics.average_nps')}
            value={data?.averageNps?.toFixed(0) || 'N/A'}
            icon={<ThumbUpIcon sx={{ fontSize: 40, color: 'white' }} />}
            bgColor="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <MetricCard
            title={t('satisfaction_analytics.average_csat')}
            value={data?.averageCsat?.toFixed(2) || 'N/A'}
            icon={<StarIcon sx={{ fontSize: 40, color: 'white' }} />}
            bgColor="linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)"
          />
        </Grid>
      </Grid>

      {/* NPS Scores by Criterion */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('satisfaction_analytics.nps_by_criterion')}
        </Typography>
        {data?.npsMetricsPerCriterion && data.npsMetricsPerCriterion.length > 0 ? (
          <Grid container spacing={2}>
            {data.npsMetricsPerCriterion.map((criterion) => (
              <Grid item xs={12} md={6} key={criterion.id}>
                <Paper sx={{ p: 2, border: '1px solid #eee' }}>
                  <Typography variant="subtitle1">{criterion.name}</Typography>
                  <Typography>
                    {t('satisfaction_analytics.promoters')}: {criterion.promoters}
                  </Typography>
                  <Typography>
                    {t('satisfaction_analytics.neutrals')}: {criterion.neutrals}
                  </Typography>
                  <Typography>
                    {t('satisfaction_analytics.detractors')}: {criterion.detractors}
                  </Typography>
                  <Typography>
                    {t('satisfaction_analytics.total_responses')}: {criterion.totalResponses}
                  </Typography>
                  <Typography variant="h6" sx={{ mt: 1 }}>
                    {t('satisfaction_analytics.nps_score')}:{' '}
                    {criterion.npsScore?.toFixed(2) || 'N/A'}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography>{t('satisfaction_analytics.no_nps_data')}</Typography>
        )}
      </Paper>

      {/* More charts and data visualizations can be added here */}
    </Box>
  );
};

export default SatisfactionAnalyticsPage;
