import React, { useState } from 'react';
import { usePermissions } from '../../../hooks/usePermissions';
import { Box, Typography, Paper, Button, CircularProgress, Alert } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/app/providers/contexts/AuthContext';
import { useMutation } from 'react-query';
import { spinWheelApi } from '../api/raffleService';
import toast from 'react-hot-toast';

const RafflePage = () => {
  const { can } = usePermissions();
  const { t } = useTranslation();
  const { user } = useAuth();
  const restaurantId = user?.restaurants?.[0]?.id;

  // Placeholder for the actual reward ID for the wheel
  // In a real scenario, this would come from a configuration or be selected by the user
  const wheelRewardId = 'YOUR_WHEEL_REWARD_ID_HERE'; // TODO: Replace with actual reward ID

  const [spinResult, setSpinResult] = useState(null);

  const {
    mutate: spinTheWheel,
    isLoading,
    isError,
    error,
    isSuccess,
  } = useMutation(spinWheelApi, {
    onSuccess: (data) => {
      setSpinResult(data.wonItem);
    },
  });

  const handleSpin = () => {
    if (restaurantId && user?.token && wheelRewardId) {
      spinTheWheel({ rewardId: wheelRewardId, restaurantId, token: user.token });
    } else {
      toast.error(t('raffle.config_error')); // Or use a more sophisticated notification
    }
  };

  if (!can('fidelity:coupons:raffle', 'participate')) { // Assumindo permissão para participar do sorteio
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="warning">
          {t('common.module_not_enabled', { moduleName: t('modules.raffle') })}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          {t('fidelity_coupons.raffle_title')}
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          {t('raffle.description')}
        </Typography>

        <Button
          variant="contained"
          color="primary"
          onClick={handleSpin}
          disabled={isLoading || !wheelRewardId}
          sx={{ mb: 2 }}
        >
          {isLoading ? <CircularProgress size={24} /> : t('raffle.spin_button')}
        </Button>

        {isError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error?.message || t('common.error_spinning_wheel')}
          </Alert>
        )}

        {isSuccess && spinResult && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h5" color="success.main">
              {t('raffle.congratulations')}
            </Typography>
            <Typography variant="h6">
              {t('raffle.you_won')}: {spinResult.title}
            </Typography>
            {spinResult.description && (
              <Typography variant="body2">{spinResult.description}</Typography>
            )}
            {spinResult.coupon_code && (
              <Typography variant="body1" sx={{ mt: 1 }}>
                {t('raffle.your_coupon_code')}: <strong>{spinResult.coupon_code}</strong>
              </Typography>
            )}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default RafflePage;
