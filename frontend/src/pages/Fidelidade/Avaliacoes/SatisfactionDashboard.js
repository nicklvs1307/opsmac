
import React, { useState } from 'react';
import { Box, Typography, Paper, Tabs, Tab } from '@mui/material';
import { BarChart as BarChartIcon, Settings as SettingsIcon, List as ListIcon, Feedback as FeedbackIcon } from '@mui/icons-material';
import SurveyList from './SurveyList';
import FeedbackList from '../../Feedback/FeedbackList';

import SatisfactionAnalytics from './SatisfactionAnalytics';
import SatisfactionSettings from './SatisfactionSettings';

const SatisfactionDashboard = () => {
  const [tabValue, setTabValue] = useState(0);

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
          Dashboard de Satisfação
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: '#7f8c8d',
            mb: 3,
          }}
        >
          Gerencie e analise a satisfação dos seus clientes.
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
          <Tab label="Análise de Satisfação" icon={<BarChartIcon />} />
          <Tab label="Configurações" icon={<SettingsIcon />} />
          <Tab label="Pesquisas" icon={<ListIcon />} />
          <Tab label="Feedbacks" icon={<FeedbackIcon />} />
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
