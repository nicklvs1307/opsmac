import React from 'react';
import { Box, Typography, Grid, TextField, FormControlLabel, Switch } from '@mui/material';
import { Controller } from 'react-hook-form';
import ToggleSwitchField from './ToggleSwitchField';
import { useTranslation } from 'react-i18next';

const CheckinCycleSettings = ({ control }) => {
  const { t } = useTranslation();

  return (
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
      <ToggleSwitchField
        control={control}
        name="enable_ranking"
        label={t('checkin_program.enable_ranking')}
      />
      <ToggleSwitchField
        control={control}
        name="enable_level_progression"
        label={t('checkin_program.enable_level_progression')}
      />
    </Box>
  );
};

export default CheckinCycleSettings;
