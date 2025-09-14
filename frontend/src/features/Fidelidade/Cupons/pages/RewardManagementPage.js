import React, { useState } from 'react';
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
  Switch,
  FormControlLabel,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useAuth } from '@/app/providers/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axiosInstance from '@/services/axiosInstance';

// API Functions
const fetchRewards = async ({ restaurantId, token }) => {
  const response = await axiosInstance.get(`/rewards/restaurant/${restaurantId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.rewards; // Assuming the API returns { rewards: [...] }
};

const createReward = async ({ rewardData, token }) => {
  const response = await axiosInstance.post('/rewards', rewardData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const updateReward = async ({ rewardId, rewardData, token }) => {
  const response = await axiosInstance.put(`/rewards/${rewardId}`, rewardData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const deleteReward = async ({ rewardId, token }) => {
  const response = await axiosInstance.delete(`/rewards/${rewardId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const RewardManagementPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const restaurantId = user?.restaurants?.[0]?.id;
  const token = user?.token;
  const queryClient = useQueryClient();

  const [openDialog, setOpenDialog] = useState(false);
  const [editingReward, setEditingReward] = useState(null); // null for create, object for edit

  const { 
    data: rewards,
    isLoading,
    isError,
    error,
  } = useQuery(['rewards', restaurantId], () => fetchRewards({ restaurantId, token }), {
    enabled: !!restaurantId && !!token,
  });

  const createRewardMutation = useMutation(createReward, {
    onSuccess: () => {
      queryClient.invalidateQueries('rewards');
      setOpenDialog(false);
      setEditingReward(null);
      alert(t('reward_management.create_success'));
    },
    onError: (err) => {
      alert(err.message || t('reward_management.create_error'));
    },
  });

  const updateRewardMutation = useMutation(updateReward, {
    onSuccess: () => {
      queryClient.invalidateQueries('rewards');
      setOpenDialog(false);
      setEditingReward(null);
      alert(t('reward_management.update_success'));
    },
    onError: (err) => {
      alert(err.message || t('reward_management.update_error'));
    },
  });

  const deleteRewardMutation = useMutation(deleteReward, {
    onSuccess: () => {
      queryClient.invalidateQueries('rewards');
      alert(t('reward_management.delete_success'));
    },
    onError: (err) => {
      alert(err.message || t('reward_management.delete_error'));
    },
  });

  const handleOpenCreateDialog = () => {
    setEditingReward(null);
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (reward) => {
    setEditingReward(reward);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingReward(null);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const rewardData = {
      title: formData.get('title'),
      description: formData.get('description'),
      value: parseFloat(formData.get('value')),
      reward_type: formData.get('reward_type'),
      is_active: formData.get('is_active') === 'on', // Checkbox value
      // Add other fields as needed (e.g., trigger_conditions, wheel_config)
    };

    if (editingReward) {
      updateRewardMutation.mutate({ rewardId: editingReward.id, rewardData, token });
    } else {
      createRewardMutation.mutate({ rewardData: { ...rewardData, restaurant_id: restaurantId }, token });
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

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('reward_management.title')}
      </Typography>

      <Button
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        onClick={handleOpenCreateDialog}
        sx={{ mb: 2 }}
      >
        {t('reward_management.create_reward')}
      </Button>

      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('reward_management.table_header.title')}</TableCell>
              <TableCell>{t('reward_management.table_header.description')}</TableCell>
              <TableCell>{t('reward_management.table_header.value')}</TableCell>
              <TableCell>{t('reward_management.table_header.type')}</TableCell>
              <TableCell>{t('reward_management.table_header.active')}</TableCell>
              <TableCell align="right">{t('reward_management.table_header.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rewards?.map((reward) => (
              <TableRow key={reward.id}>
                <TableCell>{reward.title}</TableCell>
                <TableCell>{reward.description}</TableCell>
                <TableCell>{reward.value}</TableCell>
                <TableCell>{reward.reward_type}</TableCell>
                <TableCell>{reward.is_active ? t('common.yes') : t('common.no')}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleOpenEditDialog(reward)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => deleteRewardMutation.mutate({ rewardId: reward.id, token })}> 
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{editingReward ? t('reward_management.edit_reward') : t('reward_management.create_reward')}</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              autoFocus
              margin="dense"
              id="title"
              name="title"
              label={t('reward_management.form.title')}
              type="text"
              fullWidth
              variant="outlined"
              defaultValue={editingReward?.title || ''}
              required
            />
            <TextField
              margin="dense"
              id="description"
              name="description"
              label={t('reward_management.form.description')}
              type="text"
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              defaultValue={editingReward?.description || ''}
            />
            <TextField
              margin="dense"
              id="value"
              name="value"
              label={t('reward_management.form.value')}
              type="number"
              fullWidth
              variant="outlined"
              defaultValue={editingReward?.value || 0}
            />
            <FormControl fullWidth margin="dense">
              <InputLabel id="reward-type-label">{t('reward_management.form.reward_type')}</InputLabel>
              <Select
                labelId="reward-type-label"
                id="reward_type"
                name="reward_type"
                label={t('reward_management.form.reward_type')}
                defaultValue={editingReward?.reward_type || 'discount'}
                required
              >
                <MenuItem value="discount">{t('reward_management.form.type_discount')}</MenuItem>
                <MenuItem value="free_item">{t('reward_management.form.type_free_item')}</MenuItem>
                <MenuItem value="spin_the_wheel">{t('reward_management.form.type_spin_the_wheel')}</MenuItem>
                {/* Add other reward types as needed */}
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <Switch
                  id="is_active"
                  name="is_active"
                  defaultChecked={editingReward?.is_active || true}
                />
              }
              label={t('reward_management.form.is_active')}
              sx={{ mt: 1 }}
            />
            {/* TODO: Add fields for trigger_conditions and wheel_config based on reward_type */}
            <DialogActions>
              <Button onClick={handleCloseDialog}>{t('common.cancel')}</Button>
              <Button type="submit" variant="contained" color="primary" disabled={createRewardMutation.isLoading || updateRewardMutation.isLoading}>
                {editingReward ? t('common.save_changes') : t('common.create')}
              </Button>
            </DialogActions>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default RewardManagementPage;
