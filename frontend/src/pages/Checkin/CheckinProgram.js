import React from 'react';
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
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { Controller } from 'react-hook-form';
import QRCode from 'qrcode.react';

const CheckinProgram = ({ control, errors, fields, append, remove, rewards, loading, onSave, t, checkinQRCode }) => {
  return (
    <>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
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
                      control={control}
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
                      control={control}
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
                  label={t('relationship.enable_ranking')}
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
                          control={control}
                          rules={{
                            required: t('relationship.visit_count_required'),
                            setValueAs: (value) => value === '' ? undefined : Number(value),
                          }}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label={t('relationship.visit_count')}
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
                          rules={{ required: t('relationship.reward_required') }}
                          render={({ field }) => (
                            <FormControl fullWidth error={!!errors.rewards_per_visit?.[index]?.reward_id}>
                              <InputLabel>{t('relationship.select_reward')}</InputLabel>
                              <Select {...field} label={t('relationship.select_reward')}>
                                {rewards.map((reward) => (
                                  <MenuItem key={reward.id} value={reward.id}>
                                    {reward.title}
                                  </MenuItem>
                                ))}
                              </Select>
                              <FormHelperText>{errors.rewards_per_visit?.[index]?.reward_id?.message}</FormHelperText>
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
                          control={control}
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
                <FormControlLabel
                  control={
                    <Controller
                      name="settings.checkin_requires_table"
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
                  label="Exigir número da mesa no check-in"
                />
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="checkin_time_restriction"
                      control={control}
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
                      name="checkin_duration_minutes"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label={t('relationship.checkin_duration_minutes')}
                          type="number"
                          fullWidth
                          margin="normal"
                          helperText={t('relationship.checkin_duration_minutes_helper')}
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
                  control={control}
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
                  control={control}
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
                  label={t('relationship.allow_multiple_cycles')}
                />
              </Box>

              <Button
                variant="contained"
                color="primary"
                onClick={onSave}
                disabled={loading}
                sx={{ mt: 2 }}
              >
                {loading ? <CircularProgress size={20} /> : t('relationship.save_checkin_program_button')}
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="QR Code de Check-in" />
            <CardContent>
              {checkinQRCode ? (
                <Box textAlign="center">
                  <QRCode value={checkinQRCode.feedback_url} size={200} />
                  <Typography variant="caption" display="block" mt={2}>
                    {checkinQRCode.feedback_url}
                  </Typography>
                </Box>
              ) : (
                <Typography>Salve o programa de fidelidade para gerar o QR Code.</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
};

export default CheckinProgram;
