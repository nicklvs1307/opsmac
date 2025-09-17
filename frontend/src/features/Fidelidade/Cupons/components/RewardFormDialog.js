import React, { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Button,
  CircularProgress,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';

const rewardSchema = yup.object().shape({
  title: yup.string().required('O título é obrigatório.'),
  description: yup.string().optional(),
  value: yup.number().min(0, 'O valor deve ser maior ou igual a 0.').required('O valor é obrigatório.'),
  reward_type: yup.string().required('O tipo de recompensa é obrigatório.'),
  is_active: yup.boolean().required(),
});

const RewardFormDialog = ({
  open,
  onClose,
  editingReward,
  createRewardMutation,
  updateRewardMutation,
  token,
  restaurantId,
}) => {
  const { t } = useTranslation();
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(rewardSchema),
    defaultValues: {
      title: '',
      description: '',
      value: 0,
      reward_type: 'discount',
      is_active: true,
    },
  });

  useEffect(() => {
    if (editingReward) {
      reset({
        title: editingReward.title,
        description: editingReward.description,
        value: editingReward.value,
        reward_type: editingReward.reward_type,
        is_active: editingReward.is_active,
      });
    } else {
      reset({
        title: '',
        description: '',
        value: 0,
        reward_type: 'discount',
        is_active: true,
      });
    }
  }, [editingReward, reset]);

  const onSubmit = (data) => {
    if (editingReward) {
      updateRewardMutation.mutate({ rewardId: editingReward.id, rewardData: data, token });
    } else {
      createRewardMutation.mutate({ rewardData: { ...data, restaurant_id: restaurantId }, token });
    }
  };

  const isLoading = createRewardMutation.isLoading || updateRewardMutation.isLoading;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {editingReward ? t('reward_management.edit_reward') : t('reward_management.create_reward')}
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                autoFocus
                margin="dense"
                label={t('reward_management.form.title')}
                type="text"
                fullWidth
                variant="outlined"
                error={!!errors.title}
                helperText={errors.title?.message}
              />
            )}
          />
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                margin="dense"
                label={t('reward_management.form.description')}
                type="text"
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                error={!!errors.description}
                helperText={errors.description?.message}
              />
            )}
          />
          <Controller
            name="value"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                margin="dense"
                label={t('reward_management.form.value')}
                type="number"
                fullWidth
                variant="outlined"
                error={!!errors.value}
                helperText={errors.value?.message}
              />
            )}
          />
          <Controller
            name="reward_type"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth margin="dense" error={!!errors.reward_type}>
                <InputLabel id="reward-type-label">
                  {t('reward_management.form.reward_type')}
                </InputLabel>
                <Select {...field} labelId="reward-type-label" label={t('reward_management.form.reward_type')}>
                  <MenuItem value="discount">{t('reward_management.form.type_discount')}</MenuItem>
                  <MenuItem value="free_item">{t('reward_management.form.type_free_item')}</MenuItem>
                  <MenuItem value="spin_the_wheel">{t('reward_management.form.type_spin_the_wheel')}</MenuItem>
                </Select>
                {errors.reward_type && <FormHelperText>{errors.reward_type.message}</FormHelperText>}
              </FormControl>
            )}
          />
          <Controller
            name="is_active"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Switch
                    {...field}
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                }
                label={t('reward_management.form.is_active')}
                sx={{ mt: 1 }}
              />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>{t('common.cancel')}</Button>
          <Button type="submit" variant="contained" color="primary" disabled={isLoading}>
            {isLoading ? <CircularProgress size={24} /> : (editingReward ? t('common.save_changes') : t('common.create'))}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default RewardFormDialog;
