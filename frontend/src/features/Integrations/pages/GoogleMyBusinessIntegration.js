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
import { useGetIntegrationSettings, useUpdateIntegrationSettings } from './api/integrationsService';

const GoogleMyBusinessIntegration = () => {
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
      google_my_business_client_id: '',
      google_my_business_client_secret: '',
    },
  });

  useEffect(() => {
    if (settingsData) {
      const gmbSettings = settingsData.settings?.integrations?.google_my_business || {};
      reset(gmbSettings);
    }
  }, [settingsData, reset]);

  const onSubmit = (data) => {
    updateSettingsMutation.mutate({ integrations: { google_my_business: data } });
  };

  return (
    <Box>
      <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
        {t('integrations.google_my_business.title')}
      </Typography>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="body1" sx={{ mb: 2 }}>
          {t('integrations.google_my_business.description')}
        </Typography>
        <Typography variant="h6" component="h3" sx={{ mb: 1 }}>
          {t('integrations.google_my_business.features_and_requirements_title')}
        </Typography>
        <List dense>
          <ListItem>
            <ListItemText
              primary={t('integrations.google_my_business.step1_primary')}
              secondary={t('integrations.google_my_business.step1_secondary')}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={t('integrations.google_my_business.step2_primary')}
              secondary={t('integrations.google_my_business.step2_secondary')}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={t('integrations.google_my_business.step3_primary')}
              secondary={t('integrations.google_my_business.step3_secondary')}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={t('integrations.google_my_business.step4_primary')}
              secondary={t('integrations.google_my_business.step4_secondary')}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={t('integrations.google_my_business.step5_primary')}
              secondary={t('integrations.google_my_business.step5_secondary')}
            />
          </ListItem>
        </List>
        <Divider sx={{ my: 2 }} />
        <Typography variant="body2" color="text.secondary">
          {t('integrations.google_my_business.documentation_link')}
        </Typography>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
          {t('integrations.google_my_business.credentials_title')}
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Controller
            name="google_my_business_client_id"
            control={control}
            rules={{ required: t('integrations.google_my_business.client_id_required') }}
            render={({ field }) => (
              <TextField
                {...field}
                label={t('integrations.google_my_business.client_id_label')}
                fullWidth
                margin="normal"
                error={!!errors.google_my_business_client_id}
                helperText={
                  errors.google_my_business_client_id
                    ? errors.google_my_business_client_id.message
                    : ''
                }
              />
            )}
          />
          <Controller
            name="google_my_business_client_secret"
            control={control}
            rules={{ required: t('integrations.google_my_business.client_secret_required') }}
            render={({ field }) => (
              <TextField
                {...field}
                label={t('integrations.google_my_business.client_secret_label')}
                fullWidth
                margin="normal"
                type="password"
                error={!!errors.google_my_business_client_secret}
                helperText={
                  errors.google_my_business_client_secret
                    ? errors.google_my_business_client_secret.message
                    : ''
                }
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
              t('integrations.google_my_business.save_button')
            )}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default GoogleMyBusinessIntegration;
