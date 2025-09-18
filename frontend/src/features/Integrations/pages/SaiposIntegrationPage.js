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
} from '../api/integrationsQueries';

const SaiposIntegration = () => {
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
      saipos_api_key: '',
      saipos_restaurant_id: '',
    },
  });

  useEffect(() => {
    if (settingsData) {
      const saiposSettings = settingsData.settings?.integrations?.saipos || {};
      reset(saiposSettings);
    }
  }, [settingsData, reset]);

  const onSubmit = (data) => {
    updateSettingsMutation.mutate({ integrations: { saipos: data } });
  };

  return (
    <Box>
      <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
        {t('integrations.saipos.title')}
      </Typography>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="body1" sx={{ mb: 2 }}>
          {t('integrations.saipos.description')}
        </Typography>
        <Typography variant="h6" component="h3" sx={{ mb: 1 }}>
          {t('integrations.saipos.features_and_requirements_title')}
        </Typography>
        <List dense>
          <ListItem>
            <ListItemText
              primary={t('integrations.saipos.step1_primary')}
              secondary={t('integrations.saipos.step1_secondary')}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={t('integrations.saipos.step2_primary')}
              secondary={t('integrations.saipos.step2_secondary')}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={t('integrations.saipos.step3_primary')}
              secondary={t('integrations.saipos.step3_secondary')}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={t('integrations.saipos.step4_primary')}
              secondary={t('integrations.saipos.step4_secondary')}
            />
          </ListItem>
        </List>
        <Divider sx={{ my: 2 }} />
        <Typography variant="body2" color="text.secondary">
          {t('integrations.saipos.documentation_link')}
        </Typography>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
          {t('integrations.saipos.credentials_title')}
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Controller
            name="saipos_api_key"
            control={control}
            rules={{ required: t('integrations.saipos.api_key_required') }}
            render={({ field }) => (
              <TextField
                {...field}
                label={t('integrations.saipos.api_key_label')}
                fullWidth
                margin="normal"
                error={!!errors.saipos_api_key}
                helperText={errors.saipos_api_key ? errors.saipos_api_key.message : ''}
              />
            )}
          />
          <Controller
            name="saipos_restaurant_id"
            control={control}
            rules={{ required: t('integrations.saipos.restaurant_id_required') }}
            render={({ field }) => (
              <TextField
                {...field}
                label={t('integrations.saipos.restaurant_id_label')}
                fullWidth
                margin="normal"
                error={!!errors.saipos_restaurant_id}
                helperText={errors.saipos_restaurant_id ? errors.saipos_restaurant_id.message : ''}
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
              t('integrations.saipos.save_button')
            )}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default SaiposIntegration;
