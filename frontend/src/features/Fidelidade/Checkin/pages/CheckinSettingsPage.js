import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  Switch,
  Card,
  CardHeader,
  CardContent,
  FormControlLabel,
  FormHelperText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import QRCode from 'qrcode.react';
import { useAuth } from '@/app/providers/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import usePermissions from '@/hooks/usePermissions';
import {
  useGetCheckinSettings,
  useUpdateCheckinSettings,
  useUpdateRestaurantProfile,
} from '../api/checkinService';
import { useRewards } from '@/features/Coupons/api/couponService';
import toast from 'react-hot-toast';
import CheckinVisualCustomization from '../components/CheckinVisualCustomization';
import CheckinCycleSettings from '../components/CheckinCycleSettings';
import CheckinRewardsPerVisit from '../components/CheckinRewardsPerVisit';
import CheckinAntiFraudControl from '../components/CheckinAntiFraudControl';
import CheckinPointsAndRanking from '../components/CheckinPointsAndRanking';
import CheckinLimitPerCycle from '../components/CheckinLimitPerCycle';
import useQRCodeDownload from '../hooks/useQRCodeDownload';

const CheckinSettingsPage = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { can } = usePermissions();
  const restaurantId = user?.restaurants?.[0]?.id;

  const {
    data: settingsData,
    isLoading: isLoadingSettings,
    isError,
    error,
  } = useGetCheckinSettings(restaurantId);
  const { data: rewards, isLoading: isLoadingRewards } = useRewards(restaurantId);
  const updateSettingsMutation = useUpdateCheckinSettings();
  const updateProfileMutation = useUpdateRestaurantProfile();

  

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      checkin_cycle_length: 10,
      checkin_cycle_name: '',
      enable_ranking: false,
      enable_level_progression: false,
      rewards_per_visit: [],
      checkin_time_restriction: 'unlimited',
      identification_method: 'phone',
      points_per_checkin: 1,
      checkin_limit_per_cycle: 1,
      allow_multiple_cycles: true,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'rewards_per_visit',
  });

  const { downloadQRCode } = useQRCodeDownload();

  

  const onSave = (data) => {
    if (!restaurantId) {
      toast.error('ID do restaurante não encontrado. Tente recarregar a página.');
      return;
    }
    const { restaurant_slug, ...settings } = data;
    updateSettingsMutation.mutate({
      restaurantId,
      settings: { checkin_program_settings: settings },
    });
    updateProfileMutation.mutate({ restaurantId, profile: { slug: restaurant_slug } });
  };

  // Verifica se o usuário tem a feature para acessar a página
  if (!can('fidelity:checkin:settings', 'read')) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="warning">
          {t('common.module_not_enabled', { moduleName: t('modules.checkin') })}
        </Alert>
      </Box>
    );
  }

  if (isLoadingSettings || isLoadingRewards) {
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
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader title={t('checkin_program.title')} />
            <CardContent>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {t('checkin_program.checkin_program_description')}
              </Typography>

              {/* Slug do Restaurante */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  {t('checkin_program.slug_title')}
                </Typography>
                <Controller
                  name="restaurant_slug"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={t('checkin_program.slug_label')}
                      fullWidth
                      margin="normal"
                      helperText={t('checkin_program.slug_helper')}
                    />
                  )}
                />
              </Box>

              

              <CheckinVisualCustomization control={control} />

              <CheckinCycleSettings control={control} />

              <CheckinRewardsPerVisit
                control={control}
                errors={errors}
                rewards={rewards}
                isLoadingRewards={isLoadingRewards}
              />

              <CheckinAntiFraudControl control={control} />

              <CheckinPointsAndRanking control={control} />

              <CheckinLimitPerCycle control={control} />

              

              

              

              

              

              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit(onSave)}
                disabled={updateSettingsMutation.isLoading || updateProfileMutation.isLoading}
                sx={{ mt: 2 }}
              >
                {updateSettingsMutation.isLoading || updateProfileMutation.isLoading ? (
                  <CircularProgress size={20} />
                ) : (
                  t('checkin_program.save_checkin_program_button')
                )}
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title={t('checkin_program.qr_code_title')} />
            <CardContent>
              {settingsData?.slug ? (
                <Box textAlign="center">
                  <QRCode value={`${window.location.origin}/checkin/public/${settingsData.slug}`} size={200} />
                  <Typography variant="caption" display="block" mt={2}>
                    {`${window.location.origin}/checkin/public/${settingsData.slug}`}
                  </Typography>
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 1 }}>
                    <Button
                      variant="outlined"
                      onClick={() => navigator.clipboard.writeText(`${window.location.origin}/checkin/public/${settingsData.slug}`)}
                    >
                      {t('checkin_program.copy_link_button')}
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => downloadQRCode(`${window.location.origin}/checkin/public/${settingsData.slug}`)}
                    >
                      {t('checkin_program.download_qr_code_button')}
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Typography>{t('checkin_program.save_to_generate_qr_code')}</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CheckinSettingsPage;
