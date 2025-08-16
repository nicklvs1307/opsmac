import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Divider, TextField, Button, CircularProgress } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import axiosInstance from 'api/axiosInstance';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const SaiposIntegration = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const restaurantId = user?.restaurants?.[0]?.id;
  const [loading, setLoading] = useState(false);

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
    const fetchSettings = async () => {
      if (!restaurantId) return;
      setLoading(true);
      try {
        const response = await axiosInstance.get(`/api/settings/${restaurantId}`);
        const saiposSettings = response.data.settings?.integrations?.saipos || {};
        reset(saiposSettings);
      } catch (error) {
        toast.error(t('integrations.saipos.error_loading_settings'));
        console.error('Error loading Saipos settings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [restaurantId, reset, t]);

  const onSubmit = async (data) => {
    if (!restaurantId) return;
    setLoading(true);
    try {
      await axiosInstance.put(`/api/settings/${restaurantId}`, {
        settings: {
          integrations: {
            saipos: data,
          },
        },
      });
      toast.success(t('integrations.saipos.settings_saved_successfully'));
    } catch (error) {
      toast.error(t('integrations.saipos.error_saving_settings'));
      console.error('Error saving Saipos settings:', error);
    } finally {
      setLoading(false);
    }
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
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : t('integrations.saipos.save_button')}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default SaiposIntegration;