import React, { useState } from 'react';
import { Box, Typography, Paper, Tabs, Tab, Alert } from '@mui/material';
import {
  BarChart as BarChartIcon,
  Settings as SettingsIcon,
  List as ListIcon,
  Feedback as FeedbackIcon,
} from '@mui/icons-material';
import SurveyList from './SurveyList';
import FeedbackList from '../../Feedback/FeedbackList';
import SatisfactionAnalytics from './SatisfactionAnalytics';
import SatisfactionSettings from './SatisfactionSettings';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/app/providers/contexts/AuthContext';

const SatisfactionDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const { t } = useTranslation();
  const { user } = useAuth(); // Obter usuário para acessar enabled_modules
  const enabledModules = user?.restaurants?.[0]?.settings?.enabled_modules || [];

  // Verifica se o módulo de pesquisas/feedback está habilitado
  if (!enabledModules.includes('surveys_feedback')) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="warning">
          {t('common.module_not_enabled', { moduleName: t('modules.surveys_feedback') })}
        </Alert>
      </Box>
    );
  }

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box mb={4}>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 'bold',
            color: '#2c3e50',
            mb: 1,
          }}
        >
          {t('satisfaction.dashboard_title')}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: '#7f8c8d',
            mb: 3,
          }}
        >
          {t('satisfaction.dashboard_description')}
        </Typography>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label={t('satisfaction.tab_analytics')} icon={<BarChartIcon />} />
          <Tab label={t('satisfaction.tab_settings')} icon={<SettingsIcon />} />
          <Tab label={t('satisfaction.tab_surveys')} icon={<ListIcon />} />
          <Tab label={t('satisfaction.tab_feedbacks')} icon={<FeedbackIcon />} />
        </Tabs>
      </Paper>

      {tabValue === 0 && <SatisfactionAnalytics />}
      {tabValue === 1 && <SatisfactionSettings />}
      {tabValue === 2 && <SurveyList />}
      {tabValue === 3 && <FeedbackList />}
    </Box>
  );
};

export default SatisfactionDashboard;
