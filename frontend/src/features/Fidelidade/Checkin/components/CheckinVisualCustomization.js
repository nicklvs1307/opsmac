import React from 'react';
import { Box, Typography, Grid, TextField } from '@mui/material';
import { Controller } from 'react-hook-form';
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
  );
};

export default CheckinVisualCustomization;
