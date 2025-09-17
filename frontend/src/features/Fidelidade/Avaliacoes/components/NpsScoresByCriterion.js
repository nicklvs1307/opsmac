import React from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';

const NpsScoresByCriterion = ({ npsMetricsPerCriterion }) => {
  const { t } = useTranslation();

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        {t('satisfaction_analytics.nps_by_criterion')}
      </Typography>
      {npsMetricsPerCriterion && npsMetricsPerCriterion.length > 0 ? (
        <Grid container spacing={2}>
          {npsMetricsPerCriterion.map((criterion) => (
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
  );
};

export default NpsScoresByCriterion;
