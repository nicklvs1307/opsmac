import React from 'react';
import { Box, Typography, Grid, TextField } from '@mui/material';
import { Controller } from 'react-hook-form';
import ColorPickerField from './ColorPickerField';
import { useTranslation } from 'react-i18next';

const CheckinVisualCustomization = ({ control }) => {
  const { t } = useTranslation();

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        {t('checkin_program.visual_customization_title')}
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <ColorPickerField
            control={control}
            name="primary_color"
            label={t('checkin_program.primary_color_label')}
            helperText={t('checkin_program.color_helper')}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <ColorPickerField
            control={control}
            name="secondary_color"
            label={t('checkin_program.secondary_color_label')}
            helperText={t('checkin_program.color_helper_secondary')}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <ColorPickerField
            control={control}
            name="text_color"
            label={t('checkin_program.text_color_label')}
            helperText={t('checkin_program.color_helper_text')}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <ColorPickerField
            control={control}
            name="background_color"
            label={t('checkin_program.background_color_label')}
            helperText={t('checkin_program.color_helper_background')}
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
  );
};

export default CheckinVisualCustomization;
