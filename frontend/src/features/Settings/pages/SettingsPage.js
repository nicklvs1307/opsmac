import React from 'react';
import { Box, Typography, Alert } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { usePermissions } from '../../hooks/usePermissions';

const SettingsPage = () => {
  const { can } = usePermissions();
  const { t } = useTranslation();
  if (!can('settings', 'read')) { // Assumindo uma permissão geral para acessar as configurações
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="warning">
          {t('common.module_not_enabled', { moduleName: t('modules.settings') })}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Configurações
      </Typography>
      <Typography variant="body1">
        Selecione uma opção no menu lateral para gerenciar as configurações.
      </Typography>
    </Box>
  );
};

export default SettingsPage;
