import React from 'react';
import { Box, Typography, TextField, FormControlLabel, Switch } from '@mui/material';
import { Controller } from 'react-hook-form';
import ToggleSwitchField from './ToggleSwitchField';
import { useTranslation } from 'react-i18next';

const CheckinLimitPerCycle = ({ control }) => {
  const { t } = useTranslation();

  return (
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
      <ToggleSwitchField
        control={control}
        name="allow_multiple_cycles"
        label={t('checkin_program.allow_multiple_cycles')}
      />
    </Box>
  );
};

export default CheckinLimitPerCycle;
