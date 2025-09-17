import React from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { Controller } from 'react-hook-form';

const CouponFilters = ({ control, onSearchChange, onStatusChange, onRewardTypeChange }) => {
  const { t } = useTranslation();

  return (
    <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
      <Box display="flex" gap={2} flexWrap="wrap">
        <Controller
          name="search"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label={t('generated_coupons.search_placeholder')}
              variant="outlined"
              size="small"
              onChange={(e) => {
                field.onChange(e);
                onSearchChange(e);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          )}
        />
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>{t('generated_coupons.status_filter')}</InputLabel>
              <Select
                {...field}
                label={t('generated_coupons.status_filter')}
                onChange={(e) => {
                  field.onChange(e);
                  onStatusChange(e);
                }}
              >
                <MenuItem value="">{t('common.all')}</MenuItem>
                <MenuItem value="active">{t('generated_coupons.status_active')}</MenuItem>
                <MenuItem value="used">{t('generated_coupons.status_used')}</MenuItem>
                <MenuItem value="expired">{t('generated_coupons.status_expired')}</MenuItem>
              </Select>
            </FormControl>
          )}
        />
        <Controller
          name="rewardType"
          control={control}
          render={({ field }) => (
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>{t('generated_coupons.reward_type_filter')}</InputLabel>
              <Select
                {...field}
                label={t('generated_coupons.reward_type_filter')}
                onChange={(e) => {
                  field.onChange(e);
                  onRewardTypeChange(e);
                }}
              >
                <MenuItem value="">{t('common.all')}</MenuItem>
                <MenuItem value="discount">{t('reward_management.form.type_discount')}</MenuItem>
                <MenuItem value="free_item">{t('reward_management.form.type_free_item')}</MenuItem>
                <MenuItem value="spin_the_wheel">
                  {t('reward_management.form.type_spin_the_wheel')}
                </MenuItem>
              </Select>
            </FormControl>
          )}
        />
      </Box>
    </Paper>
  );
};

export default CouponFilters;
