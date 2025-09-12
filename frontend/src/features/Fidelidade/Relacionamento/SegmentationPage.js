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
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, PlayArrow as PlayArrowIcon } from '@mui/icons-material';
import { useAuth } from '@/app/providers/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axiosInstance from '@/services/axiosInstance';
import { useForm, Controller, useFieldArray } from 'react-hook-form';

// API Functions
const fetchSegments = async ({ restaurantId, token }) => {
  const response = await axiosInstance.get(`/customerSegmentation`, {
    params: { restaurantId },
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data; // Assuming the API returns an array of segments
};

const createSegment = async ({ segmentData, token }) => {
  const response = await axiosInstance.post('/customerSegmentation', segmentData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const updateSegment = async ({ segmentId, segmentData, token }) => {
  const response = await axiosInstance.put(`/customerSegmentation/${segmentId}`, segmentData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const deleteSegment = async ({ segmentId, token }) => {
  const response = await axiosInstance.delete(`/customerSegmentation/${segmentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const applySegmentationRules = async ({ restaurantId, token }) => {
  const response = await axiosInstance.post(`/customerSegmentation/apply-rules`, { restaurantId }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

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
      alert(t('segmentation.create_success'));
    },
    onError: (err) => {
      alert(err.message || t('segmentation.create_error'));
    },
  });

  const updateSegmentMutation = useMutation(updateSegment, {
    onSuccess: () => {
      queryClient.invalidateQueries('segments');
      setOpenDialog(false);
      setEditingSegment(null);
      alert(t('segmentation.update_success'));
    },
    onError: (err) => {
      alert(err.message || t('segmentation.update_error'));
    },
  });

  const deleteSegmentMutation = useMutation(deleteSegment, {
    onSuccess: () => {
      queryClient.invalidateQueries('segments');
      alert(t('segmentation.delete_success'));
    },
    onError: (err) => {
      alert(err.message || t('segmentation.delete_error'));
    },
  });

  const applyRulesMutation = useMutation(applySegmentationRules, {
    onSuccess: () => {
      queryClient.invalidateQueries('segments');
      alert(t('segmentation.apply_rules_success'));
    },
    onError: (err) => {
      alert(err.message || t('segmentation.apply_rules_error'));
    },
  });

  const { control, handleSubmit, reset, formState: { errors: formErrors } } = useForm({
    defaultValues: {
      name: '',
      description: '',
      rules: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'rules',
  });

  useEffect(() => {
    if (editingSegment) {
      reset(editingSegment);
    } else {
      reset({ name: '', description: '', rules: [] });
    }
  }, [editingSegment, reset]);

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

  const onSubmit = (data) => {
    if (editingSegment) {
      updateSegmentMutation.mutate({ segmentId: editingSegment.id, segmentData: data, token });
    } else {
      createSegmentMutation.mutate({ segmentData: { ...data, restaurantId }, token });
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
          {applyRulesMutation.isLoading ? <CircularProgress size={24} /> : t('segmentation.apply_rules')}
        </Button>
      </Box>

      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('segmentation.table_header.name')}</TableCell>
              <TableCell>{t('segmentation.table_header.description')}</TableCell>
              <TableCell>{t('segmentation.table_header.rules')}</TableCell>
              <TableCell align="right">{t('segmentation.table_header.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {segments?.map((segment) => (
              <TableRow key={segment.id}>
                <TableCell>{segment.name}</TableCell>
                <TableCell>{segment.description}</TableCell>
                <TableCell>{JSON.stringify(segment.rules)}</TableCell> {/* Display rules as JSON */}
                <TableCell align="right">
                  <IconButton onClick={() => handleOpenEditDialog(segment)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => deleteSegmentMutation.mutate({ segmentId: segment.id, token })}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="md">
        <DialogTitle>{editingSegment ? t('segmentation.edit_segment') : t('segmentation.create_segment')}</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              name="name"
              label={t('segmentation.form.name')}
              type="text"
              fullWidth
              variant="outlined"
              {...control.register('name', { required: t('segmentation.form.name_required') })}
              error={!!formErrors.name}
              helperText={formErrors.name?.message}
            />
            <TextField
              margin="dense"
              id="description"
              name="description"
              label={t('segmentation.form.description')}
              type="text"
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              {...control.register('description')}
            />

            <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
              {t('segmentation.form.rules')}
            </Typography>
            {fields.map((item, index) => (
              <Paper key={item.id} sx={{ p: 2, mb: 2, border: '1px solid #eee' }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth>
                      <InputLabel>{t('segmentation.form.rule_field')}</InputLabel>
                      <Select
                        label={t('segmentation.form.rule_field')}
                        {...control.register(`rules.${index}.field`, { required: t('segmentation.form.rule_field_required') })}
                        defaultValue={item.field}
                      >
                        <MenuItem value="totalVisits">{t('segmentation.form.field_total_visits')}</MenuItem>
                        <MenuItem value="totalSpent">{t('segmentation.form.field_total_spent')}</MenuItem>
                        <MenuItem value="loyaltyPoints">{t('segmentation.form.field_loyalty_points')}</MenuItem>
                        {/* Add more fields as needed */}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label={t('segmentation.form.rule_value')}
                      type="number"
                      fullWidth
                      {...control.register(`rules.${index}.value`, { required: t('segmentation.form.rule_value_required'), setValueAs: v => parseFloat(v) })}
                      defaultValue={item.value}
                      error={!!formErrors.rules?.[index]?.value}
                      helperText={formErrors.rules?.[index]?.value?.message}
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => remove(index)}
                      startIcon={<DeleteIcon />}
                    >
                      {t('segmentation.form.remove_rule')}
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            ))}
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => append({ field: '', value: '' })}
            >
              {t('segmentation.form.add_rule')}
            </Button>

            <DialogActions>
              <Button onClick={handleCloseDialog}>{t('common.cancel')}</Button>
              <Button type="submit" variant="contained" color="primary" disabled={createSegmentMutation.isLoading || updateSegmentMutation.isLoading}>
                {editingSegment ? t('common.save_changes') : t('common.create')}
              </Button>
            </DialogActions>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default SegmentationPage;
