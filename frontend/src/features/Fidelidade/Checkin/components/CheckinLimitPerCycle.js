import React from 'react';
import { Box, Typography, TextField, FormControlLabel, Switch } from '@mui/material';
import { Controller } from 'react-hook-form';
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
  );
};

export default CheckinLimitPerCycle;
