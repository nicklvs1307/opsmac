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
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { Controller, useFieldArray } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import RewardItemField from './RewardItemField';

const CheckinRewardsPerVisit = ({ control, errors, rewards, isLoadingRewards }) => {
  const { t } = useTranslation();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'rewards_per_visit',
  });

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        {t('checkin_program.rewards_per_visit')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {t('checkin_program.rewards_per_visit_helper')}
      </Typography>
      {fields.map((item, index) => (
        <RewardItemField
          key={item.id}
          control={control}
          errors={errors}
          index={index}
          remove={remove}
          rewards={rewards}
          isLoadingRewards={isLoadingRewards}
        />
      ))}
      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={() => append({ visit_count: '', reward_id: '', message_template: '' })}
      >
        {t('checkin_program.add_reward')}
      </Button>
    </Box>
  );
};

export default CheckinRewardsPerVisit;
