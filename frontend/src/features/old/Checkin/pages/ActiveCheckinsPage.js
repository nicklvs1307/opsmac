import React from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
} from '@mui/material';
import { ExitToApp as ExitToAppIcon } from '@mui/icons-material';
import { useAuth } from '@/app/providers/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import usePermissions from '@/hooks/usePermissions';
import { useGetActiveCheckins, useCheckout } from '@/features/Checkin/api/checkinService';
import CheckinsTable from '../components/CheckinsTable';

const ActiveCheckinsPage = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { can } = usePermissions();
  const restaurantId = user?.restaurants?.[0]?.id;

  const {
    data: activeCheckins,
    isLoading,
    isError,
    error,
  } = useGetActiveCheckins(restaurantId, {
    enabled: can('fidelity:checkin:active', 'read'), // Only fetch data if the user has permission
  });
  const checkoutMutation = useCheckout();

  const handleCheckout = (checkinId) => {
    checkoutMutation.mutate(checkinId);
  };

  // Verifica se o usuário tem a feature para acessar a página
  if (!can('fidelity:checkin:active', 'read')) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="warning">
          {t('common.module_not_enabled', { moduleName: t('modules.checkin') })}
        </Alert>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error.message}
      </Alert>
    );
  }

  return (
    <Paper
      sx={{
        p: 3,
        borderRadius: 2,
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Typography
        variant="h6"
        gutterBottom
        sx={{
          fontWeight: 600,
          color: '#2c3e50',
          mb: 3,
        }}
      >
        {t('checkin_dashboard.active_checkins_title')}
      </Typography>
      <CheckinsTable
        checkins={activeCheckins}
        handleCheckout={handleCheckout}
        isLoadingCheckout={checkoutMutation.isLoading}
      />
    </Paper>
  );
};

export default ActiveCheckinsPage;
