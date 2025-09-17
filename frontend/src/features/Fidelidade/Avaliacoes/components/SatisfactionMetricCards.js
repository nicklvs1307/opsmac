import React from 'react';
import { Grid } from '@mui/material';
import {
  BarChart as BarChartIcon,
  Star as StarIcon,
  ThumbUp as ThumbUpIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

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

const SatisfactionMetricCards = ({ data }) => {
  const { t } = useTranslation();

  return (
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
  );
};

export default SatisfactionMetricCards;
