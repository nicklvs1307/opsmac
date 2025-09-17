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
import RewardFormDialog from '../components/RewardFormDialog';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { fetchRewards, createReward, updateReward, deleteReward } from '../api/rewardService';



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
      toast.success(t('reward_management.create_success'));
    },
    onError: (err) => {
      toast.error(err.message || t('reward_management.create_error'));
    },
  });

  const updateRewardMutation = useMutation(updateReward, {
    onSuccess: () => {
      queryClient.invalidateQueries('rewards');
      setOpenDialog(false);
      setEditingReward(null);
      toast.success(t('reward_management.update_success'));
    },
    onError: (err) => {
      toast.error(err.message || t('reward_management.update_error'));
    },
  });

  const deleteRewardMutation = useMutation(deleteReward, {
    onSuccess: () => {
      queryClient.invalidateQueries('rewards');
      toast.success(t('reward_management.delete_success'));
    },
    onError: (err) => {
      toast.error(err.message || t('reward_management.delete_error'));
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

      <RewardTable
        rewards={rewards}
        handleOpenEditDialog={handleOpenEditDialog}
        deleteRewardMutation={deleteRewardMutation}
      />

      
    <RewardFormDialog
        open={openDialog}
        onClose={handleCloseDialog}
        editingReward={editingReward}
        createRewardMutation={createRewardMutation}
        updateRewardMutation={updateRewardMutation}
        token={token}
        restaurantId={restaurantId}
      />
    </Box>
  );
};

export default RewardManagementPage;
