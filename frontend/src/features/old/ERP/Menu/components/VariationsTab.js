import React from 'react';
import { Typography, Box, Paper } from '@mui/material';
import { useTranslation } from 'react-i18next';

const VariationsTab = () => {
  const { t } = useTranslation();
  return (
    <Paper sx={{ p: 3, textAlign: 'center' }}>
      <Typography variant="h6">{t('menu_management.tabs.variations')}</Typography>
      <Typography>{t('common.feature_in_development')}</Typography>
    </Paper>
  );
};

export default VariationsTab;
