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
  Button,
  CircularProgress,
  FormHelperText,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';

const goalSchema = yup.object().shape({
  name: yup.string().required('O nome da meta é obrigatório.'),
  description: yup.string().optional(),
  targetValue: yup.number().typeError('O valor alvo deve ser um número.').min(0, 'O valor alvo deve ser maior ou igual a 0.').required('O valor alvo é obrigatório.'),
  metric: yup.string().required('A métrica é obrigatória.'),
  startDate: yup.string().required('A data de início é obrigatória.'),
  endDate: yup.string().required('A data de término é obrigatória.'),
});

const GoalFormDialog = ({
  open,
  onClose,
  editingGoal,
  createGoalMutation,
  updateGoalMutation,
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
    resolver: yupResolver(goalSchema),
    defaultValues: {
      name: '',
      description: '',
      targetValue: 0,
      metric: '',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: format(new Date(), 'yyyy-MM-dd'),
    },
  });

  useEffect(() => {
    if (editingGoal) {
      reset({
        ...editingGoal,
        startDate: format(new Date(editingGoal.startDate), 'yyyy-MM-dd'),
        endDate: format(new Date(editingGoal.endDate), 'yyyy-MM-dd'),
      });
    } else {
      reset({
        name: '',
        description: '',
        targetValue: 0,
        metric: '',
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: format(new Date(), 'yyyy-MM-dd'),
      });
    }
  }, [editingGoal, reset]);

  const onSubmit = (data) => {
    if (editingGoal) {
      updateGoalMutation.mutate({ goalId: editingGoal.id, goalData: data, token });
    } else {
      createGoalMutation.mutate({ goalData: { ...data, restaurantId }, token });
    }
  };

  const isLoading = createGoalMutation.isLoading || updateGoalMutation.isLoading;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{editingGoal ? t('goals.edit_goal') : t('goals.create_goal')}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                autoFocus
                margin="dense"
                label={t('goals.form.name')}
                type="text"
                fullWidth
                variant="outlined"
                error={!!errors.name}
                helperText={errors.name?.message}
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
                label={t('goals.form.description')}
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
            name="targetValue"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                margin="dense"
                label={t('goals.form.target_value')}
                type="number"
                fullWidth
                variant="outlined"
                error={!!errors.targetValue}
                helperText={errors.targetValue?.message}
              />
            )}
          />
          <Controller
            name="metric"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth margin="dense" error={!!errors.metric}>
                <InputLabel>{t('goals.form.metric')}</InputLabel>
                <Select {...field} label={t('goals.form.metric')}>
                  <MenuItem value="totalCheckins">{t('goals.metric_type.totalCheckins')}</MenuItem>
                  <MenuItem value="newCustomers">{t('goals.metric_type.newCustomers')}</MenuItem>
                  <MenuItem value="avgNpsScore">{t('goals.metric_type.avgNpsScore')}</MenuItem>
                  <MenuItem value="totalLoyaltyPoints">{t('goals.metric_type.totalLoyaltyPoints')}</MenuItem>
                  <MenuItem value="totalSpent">{t('goals.metric_type.totalSpent')}</MenuItem>
                </Select>
                {errors.metric && <FormHelperText>{errors.metric.message}</FormHelperText>}
              </FormControl>
            )}
          />
          <Controller
            name="startDate"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                margin="dense"
                label={t('goals.form.start_date')}
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                variant="outlined"
                error={!!errors.startDate}
                helperText={errors.startDate?.message}
              />
            )}
          />
          <Controller
            name="endDate"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                margin="dense"
                label={t('goals.form.end_date')}
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                variant="outlined"
                error={!!errors.endDate}
                helperText={errors.endDate?.message}
              />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>{t('common.cancel')}</Button>
          <Button type="submit" variant="contained" color="primary" disabled={isLoading}>
            {isLoading ? <CircularProgress size={24} /> : (editingGoal ? t('common.save_changes') : t('common.create'))}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default GoalFormDialog;
