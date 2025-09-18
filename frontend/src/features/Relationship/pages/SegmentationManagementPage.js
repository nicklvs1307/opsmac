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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayArrowIcon,
} from '@mui/icons-material';
import { useAuth } from '@/app/providers/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  fetchSegments,
  createSegment,
  updateSegment,
  deleteSegment,
  applySegmentationRules,
} from '../api/segmentationQueries';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import SegmentFormDialog from '../components/SegmentFormDialog';
import SegmentTable from '../components/SegmentTable';

const SegmentationPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const restaurantId = user?.restaurants?.[0]?.id;
  const token = user?.token;
  const queryClient = useQueryClient();

  const [openDialog, setOpenDialog] = useState(false);
  const [editingSegment, setEditingSegment] = useState(null); // null for create, object for edit

  const {
    data: segments,
    isLoading,
    isError,
    error,
  } = useQuery(['segments', restaurantId], () => fetchSegments({ restaurantId, token }), {
    enabled: !!restaurantId && !!token,
  });

  const createSegmentMutation = useMutation(createSegment, {
    onSuccess: () => {
      queryClient.invalidateQueries('segments');
      setOpenDialog(false);
      setEditingSegment(null);
      toast.success(t('segmentation.create_success'));
    },
    onError: (err) => {
      toast.error(err.message || t('segmentation.create_error'));
    },
  });

  const updateSegmentMutation = useMutation(updateSegment, {
    onSuccess: () => {
      queryClient.invalidateQueries('segments');
      setOpenDialog(false);
      setEditingSegment(null);
      toast.success(t('segmentation.update_success'));
    },
    onError: (err) => {
      toast.error(err.message || t('segmentation.update_error'));
    },
  });

  const deleteSegmentMutation = useMutation(deleteSegment, {
    onSuccess: () => {
      queryClient.invalidateQueries('segments');
      toast.success(t('segmentation.delete_success'));
    },
    onError: (err) => {
      toast.error(err.message || t('segmentation.delete_error'));
    },
  });

  const applyRulesMutation = useMutation(applySegmentationRules, {
    onSuccess: () => {
      queryClient.invalidateQueries('segments');
      toast.success(t('segmentation.apply_rules_success'));
    },
    onError: (err) => {
      toast.error(err.message || t('segmentation.apply_rules_error'));
    },
  });

  const handleOpenCreateDialog = () => {
    setEditingSegment(null);
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (segment) => {
    setEditingSegment(segment);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingSegment(null);
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
        {t('segmentation.title')}
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateDialog}
        >
          {t('segmentation.create_segment')}
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          startIcon={<PlayArrowIcon />}
          onClick={() => applyRulesMutation.mutate({ restaurantId, token })}
          disabled={applyRulesMutation.isLoading}
        >
          {applyRulesMutation.isLoading ? (
            <CircularProgress size={24} />
          ) : (
            t('segmentation.apply_rules')
          )}
        </Button>
      </Box>

      <SegmentTable
        segments={segments}
        handleOpenEditDialog={handleOpenEditDialog}
        deleteSegmentMutation={deleteSegmentMutation}
        token={token}
      />

      <SegmentFormDialog
        open={openDialog}
        onClose={handleCloseDialog}
        editingSegment={editingSegment}
        createSegmentMutation={createSegmentMutation}
        updateSegmentMutation={updateSegmentMutation}
        token={token}
        restaurantId={restaurantId}
      />
    </Box>
  );
};

export default SegmentationPage;