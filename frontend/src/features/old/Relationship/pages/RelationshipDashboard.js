import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Switch,
  Card,
  CardHeader,
  CardContent,
  FormControlLabel,
} from '@mui/material';
import { useAuth } from '@/app/providers/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import {
  useFetchCustomers,
  useFetchWhatsappSettings,
  useSendManualMessage,
  useSaveAutomaticCampaigns,
} from '@/features/Relationship/api/relationshipService';

const RelationshipDashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const restaurantId = user?.restaurants?.[0]?.id;

  const [activeTab, setActiveTab] = useState('manual'); // 'manual' or 'automatic'
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const { data: customers, isLoading: isLoadingCustomers } = useFetchCustomers(restaurantId);
  const { data: whatsappSettingsData } = useFetchWhatsappSettings(restaurantId);

  const sendManualMessageMutation = useSendManualMessage();
  const saveAutomaticCampaignsMutation = useSaveAutomaticCampaigns();

  // Form para mensagens manuais
  const {
    control: manualMessageControl,
    handleSubmit: handleManualMessageSubmit,
    formState: { errors: manualMessageErrors },
  } = useForm({
    defaultValues: {
      recipient_phone_number: '',
      message_text: '',
    },
  });

  // Form para campanhas automáticas
  const {
    control: automaticCampaignsControl,
    handleSubmit: handleAutomaticCampaignsSubmit,
    reset: resetAutomaticCampaignsForm,
  } = useForm({
    defaultValues: {
      checkin_message_enabled: false,
      checkin_message_text: '',
      coupon_reminder_enabled: false,
      coupon_reminder_text: '',
      birthday_greeting_enabled: false,
      birthday_greeting_text: '',
      feedback_thank_you_enabled: false,
      feedback_thank_you_text: '',
    },
  });

  useEffect(() => {
    if (whatsappSettingsData) {
      const whatsappMessages = whatsappSettingsData.settings?.whatsapp_messages || {};
      resetAutomaticCampaignsForm({
        checkin_message_enabled: whatsappMessages.checkin_message_enabled || false,
        checkin_message_text: whatsappMessages.checkin_message_text || '',
        coupon_reminder_enabled: whatsappMessages.coupon_reminder_enabled || false,
        coupon_reminder_text: whatsappMessages.coupon_reminder_text || '',
        birthday_greeting_enabled: whatsappMessages.birthday_greeting_enabled || false,
        birthday_greeting_text: whatsappMessages.birthday_greeting_text || '',
        feedback_thank_you_enabled: whatsappMessages.feedback_thank_you_enabled || false,
        feedback_thank_you_text: whatsappMessages.feedback_thank_you_text || '',
      });
    }
  }, [whatsappSettingsData, resetAutomaticCampaignsForm]);

  const onSendManualMessage = (data) => {
    sendManualMessageMutation.mutate({
      restaurantId,
      recipientPhoneNumber: data.recipient_phone_number,
      messageText: data.message_text,
    });
  };

  const onSaveAutomaticCampaigns = (data) => {
    saveAutomaticCampaignsMutation.mutate({ restaurantId, settings: data });
  };

  const renderManualMessageSection = () => (
    <>
      <Card>
        <CardHeader title={t('relationship.manual_messages')} />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                {t('relationship.select_customer')}
              </Typography>
              {isLoadingCustomers ? (
                <CircularProgress />
              ) : (
                <List component={Paper} sx={{ maxHeight: 400, overflow: 'auto' }}>
                  {customers?.customers?.length === 0 ? (
                    <ListItem>
                      <ListItemText primary={t('relationship.no_customers_found')} />
                    </ListItem>
                  ) : (
                    customers?.customers?.map((customer) => (
                      <ListItem
                        key={customer.id}
                        button
                        selected={selectedCustomer?.id === customer.id}
                        onClick={() => {
                          setSelectedCustomer(customer);
                          manualMessageControl.setValue('recipient_phone_number', customer.phone); // Use setValue
                        }}
                      >
                        <ListItemText primary={customer.name} secondary={customer.phone} />
                      </ListItem>
                    ))
                  )}
                </List>
              )}
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                {t('relationship.send_message')}
              </Typography>
              <Controller
                name="recipient_phone_number"
                control={manualMessageControl}
                rules={{ required: t('relationship.recipient_required') }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t('relationship.recipient_phone_number')}
                    fullWidth
                    margin="normal"
                    error={!!manualMessageErrors.recipient_phone_number}
                    helperText={manualMessageErrors.recipient_phone_number?.message}
                  />
                )}
              />
              <Controller
                name="message_text"
                control={manualMessageControl}
                rules={{ required: t('relationship.message_required') }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t('relationship.message_content')}
                    fullWidth
                    multiline
                    rows={4}
                    margin="normal"
                    error={!!manualMessageErrors.message_text}
                    helperText={manualMessageErrors.message_text?.message}
                  />
                )}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleManualMessageSubmit(onSendManualMessage)}
                disabled={sendManualMessageMutation.isLoading}
                sx={{ mt: 2 }}
              >
                {sendManualMessageMutation.isLoading ? (
                  <CircularProgress size={20} />
                ) : (
                  t('relationship.send_message_button')
                )}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </>
  );

  const renderAutomaticCampaignsSection = () => (
    <>
      <Card>
        <CardHeader title={t('relationship.automatic_campaigns')} />
        <CardContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {t('relationship.automatic_campaigns_description')}
          </Typography>

          {/* Campanha de Agradecimento Pós-Check-in */}
          <Box sx={{ mb: 4 }}>
            <FormControlLabel
              control={
                <Controller
                  name="checkin_message_enabled"
                  control={automaticCampaignsControl}
                  render={({ field }) => (
                    <Switch
                      {...field}
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  )}
                />
              }
              label={t('relationship.checkin_thank_you_campaign')}
            />
            <Controller
              name="checkin_message_text"
              control={automaticCampaignsControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t('relationship.message_template')}
                  fullWidth
                  multiline
                  rows={4}
                  margin="normal"
                  disabled={!automaticCampaignsControl.getValues('checkin_message_enabled')}
                  helperText={t('relationship.checkin_message_variables')}
                />
              )}
            />
          </Box>

          {/* Campanha de Lembrete de Cupom */}
          <Box sx={{ mb: 4 }}>
            <FormControlLabel
              control={
                <Controller
                  name="coupon_reminder_enabled"
                  control={automaticCampaignsControl}
                  render={({ field }) => (
                    <Switch
                      {...field}
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  )}
                />
              }
              label={t('relationship.coupon_reminder_campaign')}
            />
            <Controller
              name="coupon_reminder_text"
              control={automaticCampaignsControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t('relationship.message_template')}
                  fullWidth
                  multiline
                  rows={4}
                  margin="normal"
                  disabled={!automaticCampaignsControl.getValues('coupon_reminder_enabled')}
                  helperText={t('relationship.coupon_reminder_variables')}
                />
              )}
            />
          </Box>

          {/* Campanha de Aniversário */}
          <Box sx={{ mb: 4 }}>
            <FormControlLabel
              control={
                <Controller
                  name="birthday_greeting_enabled"
                  control={automaticCampaignsControl}
                  render={({ field }) => (
                    <Switch
                      {...field}
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  )}
                />
              }
              label={t('relationship.birthday_greeting_campaign')}
            />
            <Controller
              name="birthday_greeting_text"
              control={automaticCampaignsControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t('relationship.message_template')}
                  fullWidth
                  multiline
                  rows={4}
                  margin="normal"
                  disabled={!automaticCampaignsControl.getValues('birthday_greeting_enabled')}
                  helperText={t('relationship.birthday_greeting_variables')}
                />
              )}
            />
          </Box>

          {/* Campanha de Agradecimento Pós-Feedback */}
          <Box sx={{ mb: 4 }}>
            <FormControlLabel
              control={
                <Controller
                  name="feedback_thank_you_enabled"
                  control={automaticCampaignsControl}
                  render={({ field }) => (
                    <Switch
                      {...field}
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  )}
                />
              }
              label={t('relationship.feedback_thank_you_campaign')}
            />
            <Controller
              name="feedback_thank_you_text"
              control={automaticCampaignsControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t('relationship.message_template')}
                  fullWidth
                  multiline
                  rows={4}
                  margin="normal"
                  disabled={!automaticCampaignsControl.getValues('feedback_thank_you_enabled')}
                  helperText={t('relationship.feedback_thank_you_variables')}
                />
              )}
            />
          </Box>

          <Button
            variant="contained"
            color="primary"
            onClick={handleAutomaticCampaignsSubmit(onSaveAutomaticCampaigns)}
            disabled={saveAutomaticCampaignsMutation.isLoading}
            sx={{ mt: 2 }}
          >
            {saveAutomaticCampaignsMutation.isLoading ? (
              <CircularProgress size={20} />
            ) : (
              t('relationship.save_campaigns_button')
            )}
          </Button>
        </CardContent>
      </Card>
    </>
  );

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('relationship.title')}
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
            <Button
              variant={activeTab === 'manual' ? 'contained' : 'outlined'}
              onClick={() => setActiveTab('manual')}
              sx={{ mr: 2 }}
            >
              {t('relationship.manual_messages_tab')}
            </Button>
            <Button
              variant={activeTab === 'automatic' ? 'contained' : 'outlined'}
              onClick={() => setActiveTab('automatic')}
            >
              {t('relationship.automatic_campaigns_tab')}
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {activeTab === 'manual' && renderManualMessageSection()}
      {activeTab === 'automatic' && renderAutomaticCampaignsSection()}
    </Box>
  );
};

export default RelationshipDashboard;
