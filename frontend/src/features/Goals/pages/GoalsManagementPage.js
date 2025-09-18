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
import { fetchGoals, createGoal, updateGoal, deleteGoal, updateGoalProgress, } from '../api/goalsQueries';
import { useForm, Controller } from 'react-hook-form';
import { format } from 'date-fns';
import GoalFormDialog from '../components/GoalFormDialog';
import GoalTable from '../components/GoalTable';

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
      toast.success(t('goals.create_success'));
    },
    onError: (err) => {
      toast.error(err.message || t('goals.create_error'));
    },
  });

  const updateGoalMutation = useMutation(updateGoal, {
    onSuccess: () => {
      queryClient.invalidateQueries('goals');
      setOpenDialog(false);
      setEditingGoal(null);
      toast.success(t('goals.update_success'));
    },
    onError: (err) => {
      toast.error(err.message || t('goals.update_error'));
    },
  });

  const deleteGoalMutation = useMutation(deleteGoal, {
    onSuccess: () => {
      queryClient.invalidateQueries('goals');
      toast.success(t('goals.delete_success'));
    },
    onError: (err) => {
      toast.error(err.message || t('goals.delete_error'));
    },
  });

  const updateProgressMutation = useMutation(updateGoalProgress, {
    onSuccess: () => {
      queryClient.invalidateQueries('goals');
      toast.success(t('goals.update_progress_success'));
    },
    onError: (err) => {
      toast.error(err.message || t('goals.update_progress_error'));
    },
  });

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

      <GoalTable
        goals={goals}
        handleOpenEditDialog={handleOpenEditDialog}
        deleteGoalMutation={deleteGoalMutation}
        updateProgressMutation={updateProgressMutation}
        token={token}
      />

      <GoalFormDialog
        open={openDialog}
        onClose={handleCloseDialog}
        editingGoal={editingGoal}
        createGoalMutation={createGoalMutation}
        updateGoalMutation={updateGoalMutation}
        token={token}
        restaurantId={restaurantId}
      />
    </Box>
  );
};

export default GoalsPage;
