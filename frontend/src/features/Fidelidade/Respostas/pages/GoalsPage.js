import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  LinearProgress,
  FormHelperText,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useAuth } from '@/app/providers/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axiosInstance from '@/services/axiosInstance';
import { useForm, Controller } from 'react-hook-form';
import { format } from 'date-fns';

// API Functions
const fetchGoals = async ({ restaurantId, token }) => {
  const response = await axiosInstance.get(`/goals`, {
    params: { restaurantId },
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data; // Assuming the API returns { goals: [...], pagination: {...} }
};

const createGoal = async ({ goalData, token }) => {
  const response = await axiosInstance.post('/goals', goalData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const updateGoal = async ({ goalId, goalData, token }) => {
  const response = await axiosInstance.put(`/goals/${goalId}`, goalData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const deleteGoal = async ({ goalId, token }) => {
  const response = await axiosInstance.delete(`/goals/${goalId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const updateGoalProgress = async ({ goalId, token }) => {
  const response = await axiosInstance.post(
    `/goals/${goalId}/update-progress`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

const GoalsPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const restaurantId = user?.restaurants?.[0]?.id;
  const token = user?.token;
  const queryClient = useQueryClient();

  const [openDialog, setOpenDialog] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null); // null for create, object for edit

  const {
    data: goalsData,
    isLoading,
    isError,
    error,
  } = useQuery(['goals', restaurantId], () => fetchGoals({ restaurantId, token }), {
    enabled: !!restaurantId && !!token,
  });

  const createGoalMutation = useMutation(createGoal, {
    onSuccess: () => {
      queryClient.invalidateQueries('goals');
      setOpenDialog(false);
      setEditingGoal(null);
      alert(t('goals.create_success'));
    },
    onError: (err) => {
      alert(err.message || t('goals.create_error'));
    },
  });

  const updateGoalMutation = useMutation(updateGoal, {
    onSuccess: () => {
      queryClient.invalidateQueries('goals');
      setOpenDialog(false);
      setEditingGoal(null);
      alert(t('goals.update_success'));
    },
    onError: (err) => {
      alert(err.message || t('goals.update_error'));
    },
  });

  const deleteGoalMutation = useMutation(deleteGoal, {
    onSuccess: () => {
      queryClient.invalidateQueries('goals');
      alert(t('goals.delete_success'));
    },
    onError: (err) => {
      alert(err.message || t('goals.delete_error'));
    },
  });

  const updateProgressMutation = useMutation(updateGoalProgress, {
    onSuccess: () => {
      queryClient.invalidateQueries('goals');
      alert(t('goals.update_progress_success'));
    },
    onError: (err) => {
      alert(err.message || t('goals.update_progress_error'));
    },
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors: formErrors },
  } = useForm({
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

  const handleOpenCreateDialog = () => {
    setEditingGoal(null);
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (goal) => {
    setEditingGoal(goal);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingGoal(null);
  };

  const onSubmit = (data) => {
    if (editingGoal) {
      updateGoalMutation.mutate({ goalId: editingGoal.id, goalData: data, token });
    } else {
      createGoalMutation.mutate({ goalData: { ...data, restaurantId }, token });
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error?.message || t('common.error_loading_data')}
      </Alert>
    );
  }

  const goals = goalsData?.goals || [];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('goals.title')}
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateDialog}
        >
          {t('goals.create_goal')}
        </Button>
      </Box>

      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('goals.table_header.name')}</TableCell>
              <TableCell>{t('goals.table_header.metric')}</TableCell>
              <TableCell>{t('goals.table_header.target_value')}</TableCell>
              <TableCell>{t('goals.table_header.current_value')}</TableCell>
              <TableCell>{t('goals.table_header.progress')}</TableCell>
              <TableCell>{t('goals.table_header.period')}</TableCell>
              <TableCell>{t('goals.table_header.status')}</TableCell>
              <TableCell align="right">{t('goals.table_header.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {goals.length > 0 ? (
              goals.map((goal) => (
                <TableRow key={goal.id}>
                  <TableCell>{goal.name}</TableCell>
                  <TableCell>{t(`goals.metric_type.${goal.metric}`)}</TableCell>
                  <TableCell>{goal.targetValue}</TableCell>
                  <TableCell>{goal.currentValue}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ width: '100%', mr: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={(goal.currentValue / goal.targetValue) * 100}
                        />
                      </Box>
                      <Box sx={{ minWidth: 35 }}>
                        <Typography variant="body2" color="text.secondary">{`${Math.round(
                          (goal.currentValue / goal.targetValue) * 100
                        )}%`}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{`${format(new Date(goal.startDate), 'dd/MM/yyyy')} - ${format(new Date(goal.endDate), 'dd/MM/yyyy')}`}</TableCell>
                  <TableCell>{t(`goals.status_type.${goal.status}`)}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      onClick={() => updateProgressMutation.mutate({ goalId: goal.id, token })}
                    >
                      <RefreshIcon />
                    </IconButton>
                    <IconButton onClick={() => handleOpenEditDialog(goal)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => deleteGoalMutation.mutate({ goalId: goal.id, token })}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  {t('goals.no_goals_found')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>{editingGoal ? t('goals.edit_goal') : t('goals.create_goal')}</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              name="name"
              label={t('goals.form.name')}
              type="text"
              fullWidth
              variant="outlined"
              {...control.register('name', { required: t('goals.form.name_required') })}
              error={!!formErrors.name}
              helperText={formErrors.name?.message}
            />
            <TextField
              margin="dense"
              id="description"
              name="description"
              label={t('goals.form.description')}
              type="text"
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              {...control.register('description')}
            />
            <TextField
              margin="dense"
              id="targetValue"
              name="targetValue"
              label={t('goals.form.target_value')}
              type="number"
              fullWidth
              variant="outlined"
              {...control.register('targetValue', {
                required: t('goals.form.target_value_required'),
                valueAsNumber: true,
              })}
              error={!!formErrors.targetValue}
              helperText={formErrors.targetValue?.message}
            />
            <FormControl fullWidth margin="dense">
              <InputLabel>{t('goals.form.metric')}</InputLabel>
              <Controller
                name="metric"
                control={control}
                rules={{ required: t('goals.form.metric_required') }}
                render={({ field }) => (
                  <Select {...field} label={t('goals.form.metric')}>
                    <MenuItem value="totalCheckins">
                      {t('goals.metric_type.totalCheckins')}
                    </MenuItem>
                    <MenuItem value="newCustomers">{t('goals.metric_type.newCustomers')}</MenuItem>
                    <MenuItem value="avgNpsScore">{t('goals.metric_type.avgNpsScore')}</MenuItem>
                    <MenuItem value="totalLoyaltyPoints">
                      {t('goals.metric_type.totalLoyaltyPoints')}
                    </MenuItem>
                    <MenuItem value="totalSpent">{t('goals.metric_type.totalSpent')}</MenuItem>
                  </Select>
                )}
              />
              <FormHelperText error={!!formErrors.metric}>
                {formErrors.metric?.message}
              </FormHelperText>
            </FormControl>
            <TextField
              margin="dense"
              id="startDate"
              name="startDate"
              label={t('goals.form.start_date')}
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              variant="outlined"
              {...control.register('startDate', { required: t('goals.form.start_date_required') })}
              error={!!formErrors.startDate}
              helperText={formErrors.startDate?.message}
            />
            <TextField
              margin="dense"
              id="endDate"
              name="endDate"
              label={t('goals.form.end_date')}
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              variant="outlined"
              {...control.register('endDate', { required: t('goals.form.end_date_required') })}
              error={!!formErrors.endDate}
              helperText={formErrors.endDate?.message}
            />

            <DialogActions>
              <Button onClick={handleCloseDialog}>{t('common.cancel')}</Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={createGoalMutation.isLoading || updateGoalMutation.isLoading}
              >
                {editingGoal ? t('common.save_changes') : t('common.create')}
              </Button>
            </DialogActions>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default GoalsPage;
