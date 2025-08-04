import React from 'react';
import { Box, Typography, Grid, Paper, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Poll as PollIcon,
  Feedback as FeedbackIcon,
  Analytics as AnalyticsIcon,
  CardGiftcard as CardGiftcardIcon,
} from '@mui/icons-material';

const SatisfacaoDashboard = () => {
  const { t } = useTranslation();

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('satisfaction.dashboard_title')}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        {t('satisfaction.dashboard_description')}
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={3}>
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
            <PollIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>{t('sidebar.surveys')}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{t('satisfaction.surveys_description')}</Typography>
            <Button 
              variant="contained" 
              component={RouterLink} 
              to="/satisfaction/surveys"
            >
              {t('satisfaction.manage_surveys')}
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
            <FeedbackIcon sx={{ fontSize: 60, color: 'secondary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>{t('sidebar.feedbacks')}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{t('satisfaction.feedbacks_description')}</Typography>
            <Button 
              variant="contained" 
              component={RouterLink} 
              to="/satisfaction/feedback"
            >
              {t('satisfaction.view_feedbacks')}
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
            <AnalyticsIcon sx={{ fontSize: 60, color: 'info.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>{t('sidebar.satisfaction_analysis')}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{t('satisfaction.analysis_description')}</Typography>
            <Button 
              variant="contained" 
              component={RouterLink} 
              to="/satisfaction/analysis"
            >
              {t('satisfaction.view_analysis')}
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
            <CardGiftcardIcon sx={{ fontSize: 60, color: 'warning.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>{t('sidebar.loyalty_program_satisfaction')}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{t('satisfaction.loyalty_description')}</Typography>
            <Button 
              variant="contained" 
              component={RouterLink} 
              to="/satisfaction/loyalty"
            >
              {t('satisfaction.configure_loyalty')}
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SatisfacaoDashboard;