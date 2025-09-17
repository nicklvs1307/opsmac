import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Card,
  CardContent,
  CardHeader,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  Typography,
  Grid,
  CircularProgress,
} from '@mui/material';
import { Send as SendIcon, Save as SaveIcon } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '@/app/providers/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

import {
  useUpdateWhatsappSettings,
  useSendTestWhatsappMessage,
  useWhatsappSettings,
} from '../api/settingsService'; // Adjusted import path

const WhatsappSettingsPage = () => {
  const { user } = useAuth();
  const { t } = useTranslation();

  const currentRestaurantId = user?.restaurants?.[0]?.id;

  const [testMessageDialog, setTestMessageDialog] = useState(false);
  const [testRecipient, setTestRecipient] = useState('');
  const [testMessage, setTestMessage] = useState('');

  const { data: whatsappSettings } = useWhatsappSettings(currentRestaurantId, {
    enabled: !!currentRestaurantId,
    onSuccess: (data) => resetWhatsapp(data),
    onError: (error) => {
      console.error('Error fetching WhatsApp settings:', error);
      toast.error(t('settings.error_fetching_whatsapp_settings'));
    },
  });

  const updateWhatsappSettingsMutation = useUpdateWhatsappSettings({
    onSuccess: () => {
      toast.success(t('settings.whatsapp_settings_updated_successfully'));
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || t('settings.error_updating_whatsapp_settings'));
    },
  });

  const sendTestMessageMutation = useSendTestWhatsappMessage({
    onSuccess: () => {
      toast.success(t('settings.test_message_sent_successfully'));
      setTestMessageDialog(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || t('settings.error_sending_test_message'));
    },
  });

  const onWhatsappSettingsSubmit = (data) => {
    if (!currentRestaurantId) return;
    updateWhatsappSettingsMutation.mutate({ restaurantId: currentRestaurantId, data });
  };

  const sendTestMessage = () => {
    if (!currentRestaurantId) return;
    sendTestMessageMutation.mutate({
      restaurantId: currentRestaurantId,
      recipient: testRecipient,
      message: testMessage,
    });
  };

  const {
    control: whatsappControl,
    handleSubmit: handleWhatsappSubmit,
    reset: resetWhatsapp,
  } = useForm({
    defaultValues: {
      whatsapp_enabled: false,
      whatsapp_api_url: '',
      whatsapp_api_key: '',
      whatsapp_instance_id: '',
      whatsapp_phone_number: '',
    },
  });

  useEffect(() => {
    if (whatsappSettings) {
      resetWhatsapp(whatsappSettings);
    }
  }, [whatsappSettings, resetWhatsapp]);

  return (
    <Card>
      <CardHeader
        title={t('settings.whatsapp_integration')}
        subheader={t('settings.configure_whatsapp_api')}
      />
      <CardContent>
        {/* Seção para Habilitar/Desabilitar o WhatsApp */}
        <FormControlLabel
          control={
            <Controller
              name="whatsapp_enabled"
              control={whatsappControl}
              render={({ field }) => (
                <Switch
                  {...field}
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
              )}
            />
          }
          label={t('settings.enable_whatsapp_integration', 'Habilitar Integração com WhatsApp')}
        />
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t(
            'settings.enable_whatsapp_integration_helper',
            'Ative para permitir o envio de mensagens automáticas via WhatsApp.'
          )}
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Controller
              name="whatsapp_api_url"
              control={whatsappControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t('settings.whatsapp_api_url')}
                  fullWidth
                  placeholder="https://your-evolution-api.com"
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller
              name="whatsapp_api_key"
              control={whatsappControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t('settings.whatsapp_api_key')}
                  fullWidth
                  type="password"
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller
              name="whatsapp_instance_id"
              control={whatsappControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t('settings.whatsapp_instance_id')}
                  fullWidth
                  placeholder="Ex: inst_123456"
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller
              name="whatsapp_phone_number"
              control={whatsappControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t('settings.whatsapp_phone_number')}
                  fullWidth
                  placeholder="5511987654321"
                />
              )}
            />
          </Grid>
        </Grid>
        <Box mt={3}>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleWhatsappSubmit(onWhatsappSettingsSubmit)}
            disabled={updateWhatsappSettingsMutation.isLoading}
          >
            {updateWhatsappSettingsMutation.isLoading ? (
              <CircularProgress size={20} />
            ) : (
              t('settings.save_whatsapp_settings')
            )}
          </Button>
          <Button
            variant="outlined"
            startIcon={<SendIcon />}
            onClick={() => setTestMessageDialog(true)}
            disabled={sendTestMessageMutation.isLoading}
            sx={{ ml: 2 }}
          >
            {sendTestMessageMutation.isLoading ? (
              <CircularProgress size={20} />
            ) : (
              t('settings.send_test_message')
            )}
          </Button>
        </Box>
      </CardContent>
      {/* Test Message Dialog */}
      <Dialog
        open={testMessageDialog}
        onClose={() => setTestMessageDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t('settings.send_test_message')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t('settings.recipient_phone_number')}
            fullWidth
            value={testRecipient}
            onChange={(e) => setTestRecipient(e.target.value)}
            placeholder="Ex: 5511987654321"
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label={t('settings.test_message_content')}
            fullWidth
            multiline
            rows={4}
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            placeholder={t('settings.test_message_placeholder')}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTestMessageDialog(false)}>{t('settings.cancel_button')}</Button>
          <Button
            onClick={sendTestMessage}
            variant="contained"
            disabled={
              sendTestMessageMutation.isLoading || !testRecipient.trim() || !testMessage.trim()
            }
          >
            {sendTestMessageMutation.isLoading ? (
              <CircularProgress size={20} />
            ) : (
              t('settings.send_button')
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default WhatsappSettingsPage;
