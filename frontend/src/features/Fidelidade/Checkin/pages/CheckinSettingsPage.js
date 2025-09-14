import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
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
  CircularProgress,
  Alert,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import QRCode from 'qrcode.react';
import { useAuth } from '@/app/providers/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import usePermissions from '@/hooks/usePermissions';
import {
  useGetCheckinSettings,
  useUpdateCheckinSettings,
  useUpdateRestaurantProfile,
} from '../api/checkinService';
import { useRewards } from '@/features/Coupons/api/couponQueries';
import toast from 'react-hot-toast';

const CheckinSettingsPage = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { can } = usePermissions();
  const restaurantId = user?.restaurants?.[0]?.id;

  const {
    data: settingsData,
    isLoading: isLoadingSettings,
    isError,
    error,
  } = useGetCheckinSettings(restaurantId);
  const { data: rewards, isLoading: isLoadingRewards } = useRewards(restaurantId);
  const updateSettingsMutation = useUpdateCheckinSettings();
  const updateProfileMutation = useUpdateRestaurantProfile();

  const [checkinQRCode, setCheckinQRCode] = useState(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      checkin_cycle_length: 10,
      checkin_cycle_name: '',
      enable_ranking: false,
      enable_level_progression: false,
      rewards_per_visit: [],
      checkin_time_restriction: 'unlimited',
      identification_method: 'phone',
      points_per_checkin: 1,
      checkin_limit_per_cycle: 1,
      allow_multiple_cycles: true,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'rewards_per_visit',
  });

  useEffect(() => {
    if (settingsData) {
      const { settings, slug } = settingsData;
      const checkinProgramSettings = settings?.checkin_program_settings || {};
      reset({ ...checkinProgramSettings, restaurant_slug: slug });

      if (slug) {
        const checkinUrl = `${window.location.origin}/checkin/public/${slug}`;
        setCheckinQRCode({ url: checkinUrl });
      } else {
        setCheckinQRCode(null);
      }
    }
  }, [settingsData, reset]);

  const onSave = (data) => {
    if (!restaurantId) {
      toast.error('ID do restaurante não encontrado. Tente recarregar a página.');
      return;
    }
    const { restaurant_slug, ...settings } = data;
    updateSettingsMutation.mutate({
      restaurantId,
      settings: { checkin_program_settings: settings },
    });
    updateProfileMutation.mutate({ restaurantId, profile: { slug: restaurant_slug } });
  };

  // Verifica se o usuário tem a feature para acessar a página
  if (!can('checkin_settings', 'read')) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="warning">
          {t('common.module_not_enabled', { moduleName: t('modules.checkin') })}
        </Alert>
      </Box>
    );
  }

  if (isLoadingSettings || isLoadingRewards) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error.message}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader title={t('checkin_program.title')} />
            <CardContent>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {t('checkin_program.checkin_program_description')}
              </Typography>

              {/* Slug do Restaurante */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  {t('checkin_program.slug_title')}
                </Typography>
                <Controller
                  name="restaurant_slug"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={t('checkin_program.slug_label')}
                      fullWidth
                      margin="normal"
                      helperText={t('checkin_program.slug_helper')}
                    />
                  )}
                />
              </Box>

              {/* Personalização Visual */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  {t('checkin_program.visual_customization_title')}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="primary_color"
                      control={control}
                      render={({ field }) => (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <TextField
                            {...field}
                            label={t('checkin_program.primary_color_label')}
                            fullWidth
                            margin="normal"
                            type="color"
                            helperText={t('checkin_program.color_helper')}
                            InputLabelProps={{ shrink: true }}
                            sx={{ flexGrow: 1 }}
                          />
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: '4px',
                              backgroundColor: field.value || 'transparent',
                              border: '1px solid #ccc',
                            }}
                          />
                        </Box>
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="secondary_color"
                      control={control}
                      render={({ field }) => (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <TextField
                            {...field}
                            label={t('checkin_program.secondary_color_label')}
                            fullWidth
                            margin="normal"
                            type="color"
                            helperText={t('checkin_program.color_helper_secondary')}
                            InputLabelProps={{ shrink: true }}
                            sx={{ flexGrow: 1 }}
                          />
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: '4px',
                              backgroundColor: field.value || 'transparent',
                              border: '1px solid #ccc',
                            }}
                          />
                        </Box>
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="text_color"
                      control={control}
                      render={({ field }) => (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <TextField
                            {...field}
                            label={t('checkin_program.text_color_label')}
                            fullWidth
                            margin="normal"
                            type="color"
                            helperText={t('checkin_program.color_helper_text')}
                            InputLabelProps={{ shrink: true }}
                            sx={{ flexGrow: 1 }}
                          />
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: '4px',
                              backgroundColor: field.value || 'transparent',
                              border: '1px solid #ccc',
                            }}
                          />
                        </Box>
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="background_color"
                      control={control}
                      render={({ field }) => (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <TextField
                            {...field}
                            label={t('checkin_program.background_color_label')}
                            fullWidth
                            margin="normal"
                            type="color"
                            helperText={t('checkin_program.color_helper_background')}
                            InputLabelProps={{ shrink: true }}
                            sx={{ flexGrow: 1 }}
                          />
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: '4px',
                              backgroundColor: field.value || 'transparent',
                              border: '1px solid #ccc',
                            }}
                          />
                        </Box>
                      )}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Controller
                      name="background_image_url"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label={t('checkin_program.background_image_url_label')}
                          fullWidth
                          margin="normal"
                          helperText={t('checkin_program.background_image_url_helper')}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* Ciclo de Check-in */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  {t('checkin_program.checkin_cycle')}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="checkin_cycle_length"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label={t('checkin_program.cycle_length')}
                          type="number"
                          fullWidth
                          margin="normal"
                          helperText={t('checkin_program.cycle_length_helper')}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="checkin_cycle_name"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label={t('checkin_program.cycle_name')}
                          fullWidth
                          margin="normal"
                          helperText={t('checkin_program.cycle_name_helper')}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
                <FormControlLabel
                  control={
                    <Controller
                      name="enable_ranking"
                      control={control}
                      render={({ field }) => (
                        <Switch
                          {...field}
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                        />
                      )}
                    />
                  }
                  label={t('checkin_program.enable_ranking')}
                />
                <FormControlLabel
                  control={
                    <Controller
                      name="enable_level_progression"
                      control={control}
                      render={({ field }) => (
                        <Switch
                          {...field}
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                        />
                      )}
                    />
                  }
                  label={t('checkin_program.enable_level_progression')}
                />
              </Box>

              {/* Recompensas por Visita */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  {t('checkin_program.rewards_per_visit')}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {t('checkin_program.rewards_per_visit_helper')}
                </Typography>
                {fields.map((item, index) => (
                  <Paper key={item.id} sx={{ p: 2, mb: 2, border: '1px solid #eee' }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={4}>
                        <Controller
                          name={`rewards_per_visit.${index}.visit_count`}
                          control={control}
                          rules={{
                            required: t('checkin_program.visit_count_required'),
                            setValueAs: (value) => (value === '' ? undefined : Number(value)),
                          }}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label={t('checkin_program.visit_count')}
                              type="number"
                              fullWidth
                              error={!!errors.rewards_per_visit?.[index]?.visit_count}
                              helperText={errors.rewards_per_visit?.[index]?.visit_count?.message}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Controller
                          name={`rewards_per_visit.${index}.reward_id`}
                          control={control}
                          rules={{ required: t('checkin_program.reward_required') }}
                          render={({ field }) => (
                            <FormControl
                              fullWidth
                              error={!!errors.rewards_per_visit?.[index]?.reward_id}
                            >
                              <InputLabel>{t('checkin_program.select_reward')}</InputLabel>
                              <Select {...field} label={t('checkin_program.select_reward')}>
                                {rewards &&
                                  rewards.map((reward) => (
                                    <MenuItem key={reward.id} value={reward.id}>
                                      {reward.title}
                                    </MenuItem>
                                  ))}
                              </Select>
                              <FormHelperText>
                                {errors.rewards_per_visit?.[index]?.reward_id?.message}
                              </FormHelperText>
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
                          {t('checkin_program.remove')}
                        </Button>
                      </Grid>
                      <Grid item xs={12}>
                        <Controller
                          name={`rewards_per_visit.${index}.message_template`}
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label={t('checkin_program.message_template')}
                              fullWidth
                              multiline
                              rows={3}
                              helperText={t('checkin_program.reward_message_variables')}
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
                  {t('checkin_program.add_reward')}
                </Button>
              </Box>

              {/* Controle Anti-Fraude */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  {t('checkin_program.anti_fraud_control')}
                </Typography>
                <FormControlLabel
                  control={
                    <Controller
                      name="checkin_requires_table"
                      control={control}
                      render={({ field }) => (
                        <Switch
                          {...field}
                          checked={!!field.value} // Garante que o valor seja booleano
                          onChange={(e) => field.onChange(e.target.checked)}
                        />
                      )}
                    />
                  }
                  label={t('checkin_program.require_table_number')}
                />
                <FormControlLabel
                  control={
                    <Controller
                      name="require_coupon_for_checkin"
                      control={control}
                      render={({ field }) => (
                        <Switch
                          {...field}
                          checked={!!field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                        />
                      )}
                    />
                  }
                  label={t('checkin_program.require_coupon_for_checkin')}
                />
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="checkin_time_restriction"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label={t('checkin_program.time_restriction')}
                          fullWidth
                          margin="normal"
                          helperText={t('checkin_program.time_restriction_helper')}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="checkin_duration_minutes"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label={t('checkin_program.checkin_duration_minutes')}
                          type="number"
                          fullWidth
                          margin="normal"
                          helperText={t('checkin_program.checkin_duration_minutes_helper')}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="identification_method"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth margin="normal">
                          <InputLabel>{t('checkin_program.identification_method')}</InputLabel>
                          <Select {...field} label={t('checkin_program.identification_method')}>
                            <MenuItem value="phone">{t('checkin_program.method_phone')}</MenuItem>
                            <MenuItem value="cpf">{t('checkin_program.method_cpf')}</MenuItem>
                            <MenuItem value="unique_link">
                              {t('checkin_program.method_unique_link')}
                            </MenuItem>
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* Sistema de Pontuação e Ranking */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  {t('checkin_program.points_and_ranking')}
                </Typography>
                <Controller
                  name="points_per_checkin"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={t('checkin_program.points_per_checkin')}
                      type="number"
                      fullWidth
                      margin="normal"
                      helperText={t('checkin_program.points_per_checkin_helper')}
                    />
                  )}
                />
              </Box>

              {/* Limite de Check-ins por Ciclo */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  {t('checkin_program.checkin_limit')}
                </Typography>
                <Controller
                  name="checkin_limit_per_cycle"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={t('checkin_program.limit_per_cycle')}
                      type="number"
                      fullWidth
                      margin="normal"
                      helperText={t('checkin_program.limit_per_cycle_helper')}
                    />
                  )}
                />
                <FormControlLabel
                  control={
                    <Controller
                      name="allow_multiple_cycles"
                      control={control}
                      render={({ field }) => (
                        <Switch
                          {...field}
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                        />
                      )}
                    />
                  }
                  label={t('checkin_program.allow_multiple_cycles')}
                />
              </Box>

              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit(onSave)}
                disabled={updateSettingsMutation.isLoading || updateProfileMutation.isLoading}
                sx={{ mt: 2 }}
              >
                {updateSettingsMutation.isLoading || updateProfileMutation.isLoading ? (
                  <CircularProgress size={20} />
                ) : (
                  t('checkin_program.save_checkin_program_button')
                )}
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title={t('checkin_program.qr_code_title')} />
            <CardContent>
              {checkinQRCode ? (
                <Box textAlign="center">
                  <QRCode value={checkinQRCode.url} size={200} />
                  <Typography variant="caption" display="block" mt={2}>
                    {checkinQRCode.url}
                  </Typography>
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 1 }}>
                    <Button
                      variant="outlined"
                      onClick={() => navigator.clipboard.writeText(checkinQRCode.url)}
                    >
                      {t('checkin_program.copy_link_button')}
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => {
                        const canvas = document.querySelector('canvas');
                        const pngUrl = canvas
                          .toDataURL('image/png')
                          .replace('image/png', 'image/octet-stream');
                        let downloadLink = document.createElement('a');
                        downloadLink.href = pngUrl;
                        downloadLink.download = 'checkin-qrcode.png';
                        document.body.appendChild(downloadLink);
                        downloadLink.click();
                        document.body.removeChild(downloadLink);
                      }}
                    >
                      {t('checkin_program.download_qr_code_button')}
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Typography>{t('checkin_program.save_to_generate_qr_code')}</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CheckinSettingsPage;
