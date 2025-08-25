import React, { useState, useEffect } from 'react';
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
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '@/app/providers/contexts/AuthContext';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const UaiRangoIntegration = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const restaurantId = user?.restaurants?.[0]?.id;

  const [apiKey, setApiKey] = useState('');
  const [restaurantUaiRangoId, setRestaurantUaiRangoId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!restaurantId) return;
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/api/restaurant/${restaurantId}`);
        const uaiRangoSettings = response.data.settings?.integrations?.uaiRango || {};
        setApiKey(uaiRangoSettings.apiKey || '');
        setRestaurantUaiRangoId(uaiRangoSettings.restaurantUaiRangoId || '');
      } catch (error) {
        console.error('Erro ao carregar configurações do Uai Rango:', error);
        toast.error(t('integrations.uairango.error_loading_settings'));
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [restaurantId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await axiosInstance.put(`/api/restaurant/${restaurantId}`, {
        settings: {
          integrations: {
            uaiRango: {
              apiKey,
              restaurantUaiRangoId,
            },
          },
        },
      });
      toast.success(t('integrations.uairango.settings_saved_successfully'));
    } catch (error) {
      console.error('Erro ao salvar configurações do Uai Rango:', error);
      toast.error(t('integrations.uairango.error_saving_settings'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

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

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          <TextField
            label={t('integrations.uairango.api_key_label')}
            variant="outlined"
            fullWidth
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            required
          />
          <TextField
            label={t('integrations.uairango.restaurant_id_label')}
            variant="outlined"
            fullWidth
            value={restaurantUaiRangoId}
            onChange={(e) => setRestaurantUaiRangoId(e.target.value)}
            required
          />
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              t('integrations.uairango.save_button')
            )}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default UaiRangoIntegration;
