import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { useTranslation } from 'react-i18next';

const Campaigns = () => {
  const { t } = useTranslation();
  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          {t('common.coming_soon_title')}: {t('fidelity_relationship.campaigns_title')}
        </Typography>
        <Typography variant="body1">{t('common.coming_soon_description')}</Typography>
      </Paper>
    </Box>
  );
};

export default Campaigns;