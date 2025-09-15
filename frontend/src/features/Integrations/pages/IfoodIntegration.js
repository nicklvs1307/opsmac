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

const IfoodIntegration = () => {
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
      ifood_client_id: '',
      ifood_client_secret: '',
    },
  });

  useEffect(() => {
    if (settingsData) {
      const ifoodSettings = settingsData.settings?.integrations?.ifood || {};
      reset(ifoodSettings);
    }
  }, [settingsData, reset]);

  const onSubmit = (data) => {
    updateSettingsMutation.mutate({ integrations: { ifood: data } });
  };

  return (
    <Box>
      <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
        {t('integrations.ifood.title')}
      </Typography>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="body1" sx={{ mb: 2 }}>
          {t('integrations.ifood.description')}
        </Typography>
        <Typography variant="h6" component="h3" sx={{ mb: 1 }}>
          {t('integrations.ifood.steps_and_info_title')}
        </Typography>
        <List dense>
          <ListItem>
            <ListItemText
              primary={t('integrations.ifood.step1_primary')}
              secondary={t('integrations.ifood.step1_secondary')}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={t('integrations.ifood.step2_primary')}
              secondary={t('integrations.ifood.step2_secondary')}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={t('integrations.ifood.step3_primary')}
              secondary={t('integrations.ifood.step3_secondary')}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={t('integrations.ifood.step4_primary')}
              secondary={t('integrations.ifood.step4_secondary')}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={t('integrations.ifood.step5_primary')}
              secondary={t('integrations.ifood.step5_secondary')}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={t('integrations.ifood.step6_primary')}
              secondary={t('integrations.ifood.step6_secondary')}
            />
          </ListItem>
        </List>
        <Divider sx={{ my: 2 }} />
        <Typography variant="body2" color="text.secondary">
          {t('integrations.ifood.documentation_link')}
        </Typography>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
          {t('integrations.ifood.credentials_title')}
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Controller
            name="ifood_client_id"
            control={control}
            rules={{ required: t('integrations.ifood.client_id_required') }}
            render={({ field }) => (
              <TextField
                {...field}
                label={t('integrations.ifood.client_id_label')}
                fullWidth
                margin="normal"
                error={!!errors.ifood_client_id}
                helperText={errors.ifood_client_id ? errors.ifood_client_id.message : ''}
              />
            )}
          />
          <Controller
            name="ifood_client_secret"
            control={control}
            rules={{ required: t('integrations.ifood.client_secret_required') }}
            render={({ field }) => (
              <TextField
                {...field}
                label={t('integrations.ifood.client_secret_label')}
                fullWidth
                margin="normal"
                type="password"
                error={!!errors.ifood_client_secret}
                helperText={errors.ifood_client_secret ? errors.ifood_client_secret.message : ''}
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
              t('integrations.ifood.save_button')
            )}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default IfoodIntegration;
