import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  Switch,
  Card,
  CardHeader,
  CardContent,
  FormControlLabel,
  FormHelperText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import axiosInstance from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import { useForm, Controller, useFieldArray } from 'react-hook-form';

const RelationshipDashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const restaurantId = user?.restaurants?.[0]?.id;

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('manual'); // 'manual' or 'automatic'
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [rewards, setRewards] = useState([]); // Novo estado para recompensas

  // Form para mensagens manuais
  const {
    control: manualMessageControl,
    handleSubmit: handleManualMessageSubmit,
    reset: resetManualMessageForm,
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
    formState: { errors: automaticCampaignsErrors },
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
      // Check-in Program Settings
      checkin_cycle_length: 10,
      checkin_cycle_name: '',
      enable_ranking: false,
      enable_level_progression: false,
      rewards_per_visit: [], // Array para armazenar as recompensas por visita
      checkin_time_restriction: 'unlimited',
      identification_method: 'phone',
      points_per_checkin: 1,
      checkin_limit_per_cycle: 1,
      allow_multiple_cycles: true,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: automaticCampaignsControl,
    name: "rewards_per_visit",
  });

  const fetchCustomers = useCallback(async () => {
    if (!restaurantId) return;
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/customers`);
      setCustomers(response.data.customers);
    } catch (err) {
      console.error('Erro ao buscar clientes:', err);
      toast.error(t('relationship.error_fetching_customers'));
    } finally {
      setLoading(false);
    }
  }, [restaurantId, t]);

  const fetchWhatsappSettings = useCallback(async () => {
    if (!restaurantId) return;
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/settings/${restaurantId}/whatsapp`);
      // Assumindo que as mensagens personalizadas estão em response.data.settings.whatsapp_messages
      const whatsappMessages = response.data.settings?.whatsapp_messages || {};
      const checkinProgramSettings = response.data.settings?.checkin_program_settings || {};

      resetAutomaticCampaignsForm({
        checkin_message_enabled: whatsappMessages.checkin_message_enabled || false,
        checkin_message_text: whatsappMessages.checkin_message_text || '',
        coupon_reminder_enabled: whatsappMessages.coupon_reminder_enabled || false,
        coupon_reminder_text: whatsappMessages.coupon_reminder_text || '',
        birthday_greeting_enabled: whatsappMessages.birthday_greeting_enabled || false,
        birthday_greeting_text: whatsappMessages.birthday_greeting_text || '',
        feedback_thank_you_enabled: whatsappMessages.feedback_thank_you_enabled || false,
        feedback_thank_you_text: whatsappMessages.feedback_thank_you_text || '',
        // Check-in Program Settings
        checkin_cycle_length: checkinProgramSettings.checkin_cycle_length || 10,
        checkin_cycle_name: checkinProgramSettings.checkin_cycle_name || '',
        enable_ranking: checkinProgramSettings.enable_ranking || false,
        enable_level_progression: checkinProgramSettings.enable_level_progression || false,
        rewards_per_visit: checkinProgramSettings.rewards_per_visit || [],
        checkin_time_restriction: checkinProgramSettings.checkin_time_restriction || 'unlimited',
        identification_method: checkinProgramSettings.identification_method || 'phone',
        points_per_checkin: checkinProgramSettings.points_per_checkin || 1,
        checkin_limit_per_cycle: checkinProgramSettings.checkin_limit_per_cycle || 1,
        allow_multiple_cycles: checkinProgramSettings.allow_multiple_cycles || true,
      });
    } catch (err) {
      console.error('Erro ao buscar configurações do WhatsApp:', err);
      toast.error(t('relationship.error_fetching_whatsapp_settings'));
    } finally {
      setLoading(false);
    }
  }, [restaurantId, resetAutomaticCampaignsForm, t]);

  const fetchRewards = useCallback(async () => {
    if (!restaurantId) return;
    try {
      const response = await axiosInstance.get(`/api/rewards/restaurant/${restaurantId}`);
      setRewards(response.data.rewards);
    } catch (err) {
      console.error('Erro ao buscar recompensas:', err);
      toast.error(t('relationship.error_fetching_rewards'));
    }
  }, [restaurantId, t]);

  useEffect(() => {
    fetchCustomers();
    fetchWhatsappSettings();
    fetchRewards();
  }, [fetchCustomers, fetchWhatsappSettings, fetchRewards]);

  const onSendManualMessage = async (data) => {
    try {
      setLoading(true);
      await axiosInstance.post(`/api/whatsapp/send-manual`, {
        restaurant_id: restaurantId,
        recipient_phone_number: data.recipient_phone_number,
        message_text: data.message_text,
      });
      toast.success(t('relationship.manual_message_sent_successfully'));
      resetManualMessageForm();
    } catch (err) {
      console.error('Erro ao enviar mensagem manual:', err);
      toast.error(err.response?.data?.message || t('relationship.error_sending_manual_message'));
    } finally {
      setLoading(false);
    }
  };

  const onSaveAutomaticCampaigns = async (data) => {
    try {
      setLoading(true);
      // Atualizar apenas a parte de whatsapp_messages e checkin_program_settings dentro de settings
      await axiosInstance.put(`/api/settings/${restaurantId}`, {
        settings: {
          whatsapp_messages: {
            checkin_message_enabled: data.checkin_message_enabled,
            checkin_message_text: data.checkin_message_text,
            coupon_reminder_enabled: data.coupon_reminder_enabled,
            coupon_reminder_text: data.coupon_reminder_text,
            birthday_greeting_enabled: data.birthday_greeting_enabled,
            birthday_greeting_text: data.birthday_greeting_text,
            feedback_thank_you_enabled: data.feedback_thank_you_enabled,
            feedback_thank_you_text: data.feedback_thank_you_text,
          },
          checkin_program_settings: {
            checkin_cycle_length: data.checkin_cycle_length,
            checkin_cycle_name: data.checkin_cycle_name,
            enable_ranking: data.enable_ranking,
            enable_level_progression: data.enable_level_progression,
            rewards_per_visit: data.rewards_per_visit,
            checkin_time_restriction: data.checkin_time_restriction,
            identification_method: data.identification_method,
            points_per_checkin: data.points_per_checkin,
            checkin_limit_per_cycle: data.checkin_limit_per_cycle,
            allow_multiple_cycles: data.allow_multiple_cycles,
          },
        },
      });
      toast.success(t('relationship.automatic_campaigns_saved_successfully'));
    } catch (err) {
      console.error('Erro ao salvar campanhas automáticas:', err);
      toast.error(err.response?.data?.message || t('relationship.error_saving_automatic_campaigns'));
    } finally {
      setLoading(false);
    }
  };

  const renderManualMessageSection = () => (
    <>
      <Card>
        <CardHeader title={t('relationship.manual_messages')} />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>{t('relationship.select_customer')}</Typography>
              {loading ? (
                <CircularProgress />
              ) : (
                <List component={Paper} sx={{ maxHeight: 400, overflow: 'auto' }}>
                  {customers.length === 0 ? (
                    <ListItem><ListItemText primary={t('relationship.no_customers_found')} /></ListItem>
                  ) : (
                    customers.map((customer) => (
                      <ListItem
                        key={customer.id}
                        button
                        selected={selectedCustomer?.id === customer.id}
                        onClick={() => {
                          setSelectedCustomer(customer);
                          manualMessageControl._formValues.recipient_phone_number = customer.phone; // Preenche o campo
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
              <Typography variant="h6" gutterBottom>{t('relationship.send_message')}</Typography>
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
                disabled={loading}
                sx={{ mt: 2 }}
              >
                {loading ? <CircularProgress size={20} /> : t('relationship.send_message_button')}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </>

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
                  disabled={!automaticCampaignsControl._formValues.checkin_message_enabled}
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
                  disabled={!automaticCampaignsControl._formValues.coupon_reminder_enabled}
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
                  disabled={!automaticCampaignsControl._formValues.birthday_greeting_enabled}
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
                  disabled={!automaticCampaignsControl._formValues.feedback_thank_you_enabled}
                  helperText={t('relationship.feedback_thank_you_variables')}
                />
              )}
            />
          </Box>

          <Button
            variant="contained"
            color="primary"
            onClick={handleAutomaticCampaignsSubmit(onSaveAutomaticCampaigns)}
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? <CircularProgress size={20} /> : t('relationship.save_campaigns_button')}
          </Button>
        </CardContent>
      </Card>
    </>

  const renderCheckinProgramSection = () => (
    <>
      <Card>
        <CardHeader title={t('relationship.checkin_program')} />
        <CardContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {t('relationship.checkin_program_description')}
          </Typography>

          {/* Ciclo de Check-in */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>{t('relationship.checkin_cycle')}</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Controller
                  name="checkin_cycle_length"
                  control={automaticCampaignsControl} // Usando o mesmo control por enquanto
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={t('relationship.cycle_length')}
                      type="number"
                      fullWidth
                      margin="normal"
                      helperText={t('relationship.cycle_length_helper')}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name="checkin_cycle_name"
                  control={automaticCampaignsControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={t('relationship.cycle_name')}
                      fullWidth
                      margin="normal"
                      helperText={t('relationship.cycle_name_helper')}
                    />
                  )}
                />
              </Grid>
            </Grid>
            <FormControlLabel
              control={
                <Controller
                  name="enable_ranking"
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
              label={t('relationship.enable_ranking')}
            />
            <FormControlLabel
              control={
                <Controller
                  name="enable_level_progression"
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
              label={t('relationship.enable_level_progression')}
            />
          </Box>

          {/* Recompensas por Visita */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>{t('relationship.rewards_per_visit')}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t('relationship.rewards_per_visit_helper')}
            </Typography>
            {fields.map((item, index) => (
              <Paper key={item.id} sx={{ p: 2, mb: 2, border: '1px solid #eee' }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={4}>
                    <Controller
                      name={`rewards_per_visit.${index}.visit_count`}
                      control={automaticCampaignsControl}
                      rules={{ required: t('relationship.visit_count_required') }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label={t('relationship.visit_count')}
                          type="number"
                          fullWidth
                          error={!!automaticCampaignsErrors.rewards_per_visit?.[index]?.visit_count}
                          helperText={automaticCampaignsErrors.rewards_per_visit?.[index]?.visit_count?.message}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name={`rewards_per_visit.${index}.reward_id`}
                      control={automaticCampaignsControl}
                      rules={{ required: t('relationship.reward_required') }}
                      render={({ field }) => (
                        <FormControl fullWidth error={!!automaticCampaignsErrors.rewards_per_visit?.[index]?.reward_id}>
                          <InputLabel>{t('relationship.select_reward')}</InputLabel>
                          <Select {...field} label={t('relationship.select_reward')}>
                            {rewards.map((reward) => (
                              <MenuItem key={reward.id} value={reward.id}>
                                {reward.title}
                              </MenuItem>
                            ))}
                          </Select>
                          <FormHelperText>{automaticCampaignsErrors.rewards_per_visit?.[index]?.reward_id?.message}</FormHelperText>
                        </FormControl>
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => remove(index)}
                      startIcon={<DeleteIcon />}
                    >
                      {t('relationship.remove')}
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                    <Controller
                      name={`rewards_per_visit.${index}.message_template`}
                      control={automaticCampaignsControl}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label={t('relationship.message_template')}
                          fullWidth
                          multiline
                          rows={3}
                          helperText={t('relationship.reward_message_variables')}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Paper>
            ))}
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => append({ visit_count: '', reward_id: '', message_template: '' })}
            >
              {t('relationship.add_reward')}
            </Button>
          </Box>

          {/* Controle Anti-Fraude */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>{t('relationship.anti_fraud_control')}</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Controller
                  name="checkin_time_restriction"
                  control={automaticCampaignsControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={t('relationship.time_restriction')}
                      fullWidth
                      margin="normal"
                      helperText={t('relationship.time_restriction_helper')}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name="identification_method"
                  control={automaticCampaignsControl}
                  render={({ field }) => (
                    <FormControl fullWidth margin="normal">
                      <InputLabel>{t('relationship.identification_method')}</InputLabel>
                      <Select {...field} label={t('relationship.identification_method')}>
                        <MenuItem value="phone">{t('relationship.method_phone')}</MenuItem>
                        <MenuItem value="cpf">{t('relationship.method_cpf')}</MenuItem>
                        <MenuItem value="unique_link">{t('relationship.method_unique_link')}</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Sistema de Pontuação e Ranking */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>{t('relationship.points_and_ranking')}</Typography>
            <Controller
              name="points_per_checkin"
              control={automaticCampaignsControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t('relationship.points_per_checkin')}
                  type="number"
                  fullWidth
                  margin="normal"
                  helperText={t('relationship.points_per_checkin_helper')}
                />
              )}
            />
          </Box>

          {/* Limite de Check-ins por Ciclo */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>{t('relationship.checkin_limit')}</Typography>
            <Controller
              name="checkin_limit_per_cycle"
              control={automaticCampaignsControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t('relationship.limit_per_cycle')}
                  type="number"
                  fullWidth
                  margin="normal"
                  helperText={t('relationship.limit_per_cycle_helper')}
                />
              )}
            />
            <FormControlLabel
              control={
                <Controller
                  name="allow_multiple_cycles"
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
              label={t('relationship.allow_multiple_cycles')}
            />
          </Box>

          <Button
            variant="contained"
            color="primary"
            onClick={handleAutomaticCampaignsSubmit(onSaveAutomaticCampaigns)}
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? <CircularProgress size={20} /> : t('relationship.save_checkin_program_button')}
          </Button>
        </CardContent>
      </Card>
    </>

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
            <Button
              variant={activeTab === 'checkin_program' ? 'contained' : 'outlined'}
              onClick={() => setActiveTab('checkin_program')}
            >
              {t('relationship.checkin_program_tab')}
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {activeTab === 'manual' && renderManualMessageSection()}
      {activeTab === 'automatic' && renderAutomaticCampaignsSection()}
      {activeTab === 'checkin_program' && renderCheckinProgramSection()}
    </Box>
  );
};

export default RelationshipDashboard;