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

const DeliveryMuchIntegration = () => {
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
      delivery_much_client_id: '',
      delivery_much_client_secret: '',
      delivery_much_username: '',
      delivery_much_password: '',
    },
  });

  useEffect(() => {
    if (settingsData) {
      const dmSettings = settingsData.settings?.integrations?.delivery_much || {};
      reset(dmSettings);
    }
  }, [settingsData, reset]);

  const onSubmit = (data) => {
    updateSettingsMutation.mutate({ integrations: { delivery_much: data } });
  };

  return (
    <Box>
      <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
        {t('integrations.delivery_much.title')}
      </Typography>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="body1" sx={{ mb: 2 }}>
          {t('integrations.delivery_much.description')}
        </Typography>
        <Typography variant="h6" component="h3" sx={{ mb: 1 }}>
          {t('integrations.delivery_much.features_and_requirements_title')}
        </Typography>
        <List dense>
          <ListItem>
            <ListItemText
              primary={t('integrations.delivery_much.step1_primary')}
              secondary={t('integrations.delivery_much.step1_secondary')}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={t('integrations.delivery_much.step2_primary')}
              secondary={t('integrations.delivery_much.step2_secondary')}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={t('integrations.delivery_much.step3_primary')}
              secondary={t('integrations.delivery_much.step3_secondary')}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={t('integrations.delivery_much.step4_primary')}
              secondary={t('integrations.delivery_much.step4_secondary')}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={t('integrations.delivery_much.step5_primary')}
              secondary={t('integrations.delivery_much.step5_secondary')}
            />
          </ListItem>
        </List>
        <Divider sx={{ my: 2 }} />
        <Typography variant="body2" color="text.secondary">
          {t('integrations.delivery_much.documentation_link')}
        </Typography>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
          {t('integrations.delivery_much.credentials_title')}
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Controller
            name="delivery_much_client_id"
            control={control}
            rules={{ required: t('integrations.delivery_much.client_id_required') }}
            render={({ field }) => (
              <TextField
                {...field}
                label={t('integrations.delivery_much.client_id_label')}
                fullWidth
                margin="normal"
                error={!!errors.delivery_much_client_id}
                helperText={
                  errors.delivery_much_client_id ? errors.delivery_much_client_id.message : ''
                }
              />
            )}
          />
          <Controller
            name="delivery_much_client_secret"
            control={control}
            rules={{ required: t('integrations.delivery_much.client_secret_required') }}
            render={({ field }) => (
              <TextField
                {...field}
                label={t('integrations.delivery_much.client_secret_label')}
                fullWidth
                margin="normal"
                type="password"
                error={!!errors.delivery_much_client_secret}
                helperText={
                  errors.delivery_much_client_secret
                    ? errors.delivery_much_client_secret.message
                    : ''
                }
              />
            )}
          />
          <Controller
            name="delivery_much_username"
            control={control}
            rules={{ required: t('integrations.delivery_much.username_required') }}
            render={({ field }) => (
              <TextField
                {...field}
                label={t('integrations.delivery_much.username_label')}
                fullWidth
                margin="normal"
                error={!!errors.delivery_much_username}
                helperText={
                  errors.delivery_much_username ? errors.delivery_much_username.message : ''
                }
              />
            )}
          />
          <Controller
            name="delivery_much_password"
            control={control}
            rules={{ required: t('integrations.delivery_much.password_required') }}
            render={({ field }) => (
              <TextField
                {...field}
                label={t('integrations.delivery_much.password_label')}
                fullWidth
                margin="normal"
                type="password"
                error={!!errors.delivery_much_password}
                helperText={
                  errors.delivery_much_password ? errors.delivery_much_password.message : ''
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
              t('integrations.delivery_much.save_button')
            )}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default DeliveryMuchIntegration;
