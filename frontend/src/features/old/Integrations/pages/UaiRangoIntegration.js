import React, { useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  TextField,
  Button,
  CircularProgress,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '@/app/providers/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import {
  useGetIntegrationSettings,
  useUpdateIntegrationSettings,
} from '@/features/Integrations/api/integrationsService';

const UaiRangoIntegration = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const restaurantId = user?.restaurants?.[0]?.id;

  const { data: settingsData, isLoading: isLoadingSettings } =
    useGetIntegrationSettings(restaurantId);
  const updateSettingsMutation = useUpdateIntegrationSettings(restaurantId);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      apiKey: '',
      restaurantUaiRangoId: '',
    },
  });

  useEffect(() => {
    if (settingsData) {
      const uaiRangoSettings = settingsData.settings?.integrations?.uaiRango || {};
      reset(uaiRangoSettings);
    }
  }, [settingsData, reset]);

  const onSubmit = (data) => {
    updateSettingsMutation.mutate({ integrations: { uaiRango: data } });
  };

  return (
    <Box>
      <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
        {t('integrations.uairango.title')}
      </Typography>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="body1" sx={{ mb: 2 }}>
          {t('integrations.uairango.description')}
        </Typography>
        <Typography variant="h6" component="h3" sx={{ mb: 1 }}>
          {t('integrations.uairango.key_points_title')}
        </Typography>
        <List dense>
          <ListItem>
            <ListItemText
              primary={t('integrations.uairango.step1_primary')}
              secondary={t('integrations.uairango.step1_secondary')}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={t('integrations.uairango.step2_primary')}
              secondary={t('integrations.uairango.step2_secondary')}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={t('integrations.uairango.step3_primary')}
              secondary={t('integrations.uairango.step3_secondary')}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={t('integrations.uairango.step4_primary')}
              secondary={t('integrations.uairango.step4_secondary')}
            />
          </ListItem>
        </List>
        <Divider sx={{ my: 2 }} />
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {t('integrations.uairango.documentation_guidance')}
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Controller
            name="apiKey"
            control={control}
            rules={{ required: t('integrations.uairango.api_key_required') }}
            render={({ field }) => (
              <TextField
                {...field}
                label={t('integrations.uairango.api_key_label')}
                fullWidth
                margin="normal"
                error={!!errors.apiKey}
                helperText={errors.apiKey ? errors.apiKey.message : ''}
              />
            )}
          />
          <Controller
            name="restaurantUaiRangoId"
            control={control}
            rules={{ required: t('integrations.uairango.restaurant_id_required') }}
            render={({ field }) => (
              <TextField
                {...field}
                label={t('integrations.uairango.restaurant_id_label')}
                fullWidth
                margin="normal"
                error={!!errors.restaurantUaiRangoId}
                helperText={errors.restaurantUaiRangoId ? errors.restaurantUaiRangoId.message : ''}
              />
            )}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            disabled={isLoadingSettings || updateSettingsMutation.isLoading}
          >
            {isLoadingSettings || updateSettingsMutation.isLoading ? (
              <CircularProgress size={24} />
            ) : (
              t('integrations.uairango.save_button')
            )}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default UaiRangoIntegration;
