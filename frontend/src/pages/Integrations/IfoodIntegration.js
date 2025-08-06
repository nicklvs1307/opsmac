import React from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Divider, TextField, Button, CircularProgress } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import axiosInstance from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const IfoodIntegration = () => {
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
      ifood_client_id: '',
      ifood_client_secret: '',
    },
  });

  useEffect(() => {
    const fetchSettings = async () => {
      if (!restaurantId) return;
      setLoading(true);
      try {
        const response = await axiosInstance.get(`/api/settings/${restaurantId}`);
        const ifoodSettings = response.data.settings?.integrations?.ifood || {};
        reset(ifoodSettings);
      } catch (error) {
        toast.error(t('integrations.ifood.error_loading_settings'));
        console.error('Error loading Ifood settings:', error);
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
            ifood: data,
          },
        },
      });
      toast.success(t('integrations.ifood.settings_saved_successfully'));
    } catch (error) {
      toast.error(t('integrations.ifood.error_saving_settings'));
      console.error('Error saving Ifood settings:', error);
    } finally {
      setLoading(false);
    }
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
    </Box>
  );
};

export default IfoodIntegration;