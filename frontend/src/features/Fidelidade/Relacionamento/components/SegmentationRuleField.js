import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Button,
  TextField,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

const SegmentationRuleField = ({ control, errors, index, remove }) => {
  const { t } = useTranslation();

  return (
    <Paper sx={{ p: 2, mb: 2, border: '1px solid #eee' }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={4}>
          <Controller
            name={`rules.${index}.field`}
            control={control}
            rules={{ required: t('segmentation.form.rule_field_required') }}
            render={({ field }) => (
              <FormControl fullWidth>
                <InputLabel>{t('segmentation.form.rule_field')}</InputLabel>
                <Select {...field} label={t('segmentation.form.rule_field')}>
                  <MenuItem value="totalVisits">
                    {t('segmentation.form.field_total_visits')}
                  </MenuItem>
                  <MenuItem value="totalSpent">
                    {t('segmentation.form.field_total_spent')}
                  </MenuItem>
                  <MenuItem value="loyaltyPoints">
                    {t('segmentation.form.field_loyalty_points')}
                  </MenuItem>
                </Select>
              </FormControl>
            )}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <Controller
            name={`rules.${index}.value`}
            control={control}
            rules={{
              required: t('segmentation.form.rule_value_required'),
              setValueAs: (v) => parseFloat(v),
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label={t('segmentation.form.rule_value')}
                type="number"
                fullWidth
                error={!!errors.rules?.[index]?.value}
                helperText={errors.rules?.[index]?.value?.message}
              />
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
            {t('segmentation.form.remove_rule')}
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default SegmentationRuleField;
