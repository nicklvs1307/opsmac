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

const RewardItemField = ({ control, errors, index, remove, rewards, isLoadingRewards }) => {
  const { t } = useTranslation();

  return (
    <Paper sx={{ p: 2, mb: 2, border: '1px solid #eee' }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={4}>
          <Controller
            name={`rewards_per_visit.${index}.visit_count`}
            control={control}
            rules={{
              required: t('checkin_program.visit_count_required'),
              setValueAs: (value) => (value === '' ? undefined : Number(value)),
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label={t('checkin_program.visit_count')}
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
            rules={{ required: t('checkin_program.reward_required') }}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.rewards_per_visit?.[index]?.reward_id}>
                <InputLabel>{t('checkin_program.select_reward')}</InputLabel>
                <Select {...field} label={t('checkin_program.select_reward')}>
                  {rewards &&
                    rewards.map((reward) => (
                      <MenuItem key={reward.id} value={reward.id}>
                        {reward.title}
                      </MenuItem>
                    ))}
                </Select>
                <FormHelperText>
                  {errors.rewards_per_visit?.[index]?.reward_id?.message}
                </FormHelperText>
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
            {t('checkin_program.remove')}
          </Button>
        </Grid>
        <Grid item xs={12}>
          <Controller
            name={`rewards_per_visit.${index}.message_template`}
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={t('checkin_program.message_template')}
                fullWidth
                multiline
                rows={3}
                helperText={t('checkin_program.reward_message_variables')}
              />
            )}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default RewardItemField;
