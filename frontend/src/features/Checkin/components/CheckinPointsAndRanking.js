import React from 'react';
import { Box, Typography, TextField } from '@mui/material';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

const CheckinPointsAndRanking = ({ control }) => {
  const { t } = useTranslation();

  return (
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
  );
};

export default CheckinPointsAndRanking;
