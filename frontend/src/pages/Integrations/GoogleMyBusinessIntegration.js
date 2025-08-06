import React from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Divider, TextField, Button, CircularProgress } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import axiosInstance from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const GoogleMyBusinessIntegration = () => {
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
      google_my_business_client_id: '',
      google_my_business_client_secret: '',
    },
  });

  useEffect(() => {
    const fetchSettings = async () => {
      if (!restaurantId) return;
      setLoading(true);
      try {
        const response = await axiosInstance.get(`/api/settings/${restaurantId}`);
        const gmbSettings = response.data.settings?.integrations?.google_my_business || {};
        reset(gmbSettings);
      } catch (error) {
        toast.error(t('integrations.google_my_business.error_loading_settings'));
        console.error('Error loading Google My Business settings:', error);
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
            google_my_business: data,
          },
        },
      });
      toast.success(t('integrations.google_my_business.settings_saved_successfully'));
    } catch (error) {
      toast.error(t('integrations.google_my_business.error_saving_settings'));
      console.error('Error saving Google My Business settings:', error);
    } finally {
      setLoading(false);
    }
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
              primary="5. Autenticação:"
              secondary="A autenticação é feita via tokens OAuth 2.0. É necessário ter uma conta Google, um perfil no Google Meu Negócio, criar um projeto no Google API Console e solicitar acesso à API."
            />
          </ListItem>
        </List>
        <Divider sx={{ my: 2 }} />
        <Typography variant="body2" color="text.secondary">
          Para mais informações e documentação detalhada, consulte a documentação oficial da Google Business Profile API.
        </Typography>
      </Paper>
    </Box>
  );
};

export default GoogleMyBusinessIntegration;