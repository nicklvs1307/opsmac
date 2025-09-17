import React from 'react';
import {
  Box,
  Typography,
  Grid,
  TextField,
  FormControlLabel,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

const CheckinAntiFraudControl = ({ control }) => {
  const { t } = useTranslation();

  return (
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
  );
};

export default CheckinAntiFraudControl;
