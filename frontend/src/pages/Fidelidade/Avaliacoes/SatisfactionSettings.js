import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, TextField, Button, List, ListItem, ListItemText, IconButton, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Grid, Alert } from '@mui/material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm, Controller } from 'react-hook-form';
import axiosInstance from '../../../api/axiosInstance';
import toast from 'react-hot-toast';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

// Funções da API
const fetchNpsCriteria = async () => {
  const { data } = await axiosInstance.get('/api/nps-criteria');
  return data;
};

const createNpsCriterion = (name) => {
  return axiosInstance.post('/api/nps-criteria', { name });
};

const updateNpsCriterion = ({ id, name }) => {
  return axiosInstance.put(`/api/nps-criteria/${id}`, { name });
};

const deleteNpsCriterion = (id) => {
  return axiosInstance.delete(`/api/nps-criteria/${id}`);
};

const SatisfactionSettings = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { t } = useTranslation();
  const restaurantId = user?.restaurants?.[0]?.id;
  const enabledModules = user?.restaurants?.[0]?.settings?.enabled_modules || [];

  // Verifica se o módulo de pesquisas/feedback está habilitado
  if (!enabledModules.includes('surveys_feedback')) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="warning">
          {t('common.module_not_enabled', { moduleName: t('modules.surveys_feedback') })}
        </Alert>
      </Box>
    );
  }

  const [newCriterionName, setNewCriterionName] = useState('');
  const [editCriterion, setEditCriterion] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittingSettings, setIsSubmittingSettings] = useState(false);

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      background_color: '#ffffff',
      text_color: '#000000',
      primary_color: '#3f51b5',
      background_image_url: '',
    }
  });

  useEffect(() => {
    if (restaurantId) {
      axiosInstance.get(`/api/settings/${restaurantId}`)
        .then(response => {
          const settings = response.data.settings?.survey_program_settings;
          if (settings) {
            reset(settings);
          }
        })
        .catch(err => console.error('Failed to fetch settings:', err));
    }
  }, [restaurantId, reset]);

  const { data: criteria, isLoading, isError } = useQuery('npsCriteria', fetchNpsCriteria);

  const onSettingsSubmit = async (data) => {
    try {
      setIsSubmittingSettings(true);
      await axiosInstance.put(`/api/settings/${restaurantId}`, {
        settings: {
          survey_program_settings: data
        }
      });
      toast.success(t('satisfaction_settings.personalization_success'));
    } catch (error) {
      toast.error(error.response?.data?.msg || t('satisfaction_settings.personalization_error'));
    } finally {
      setIsSubmittingSettings(false);
    }
  };

  const mutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries('npsCriteria');
      setIsSubmitting(false);
      setNewCriterionName('');
      setEditCriterion(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.msg || t('satisfaction_settings.error_occurred'));
      setIsSubmitting(false);
    },
  };

  const createMutation = useMutation(createNpsCriterion, {
    ...mutationOptions,
    onSuccess: () => {
      toast.success(t('satisfaction_settings.criterion_created_success'));
      mutationOptions.onSuccess();
    },
  });

  const updateMutation = useMutation(updateNpsCriterion, {
    ...mutationOptions,
    onSuccess: () => {
      toast.success(t('satisfaction_settings.criterion_updated_success'));
      mutationOptions.onSuccess();
    },
  });

  const deleteMutation = useMutation(deleteNpsCriterion, {
    ...mutationOptions,
    onSuccess: () => {
      toast.success(t('satisfaction_settings.criterion_deleted_success'));
      mutationOptions.onSuccess();
    },
  });

  const handleCriterionSubmit = (e) => {
    e.preventDefault();
    if (!newCriterionName.trim()) {
      toast.error(t('satisfaction_settings.criterion_name_empty_error'));
      return;
    }
    setIsSubmitting(true);
    createMutation.mutate(newCriterionName);
  };

  const handleUpdate = () => {
    if (!editCriterion || !editCriterion.name.trim()) {
        toast.error(t('satisfaction_settings.criterion_name_empty_error'));
        return;
    }
    setIsSubmitting(true);
    updateMutation.mutate({ id: editCriterion.id, name: editCriterion.name });
  };

  const handleDelete = (id) => {
    if (window.confirm(t('satisfaction_settings.confirm_delete_criterion'))) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <Box p={3}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          {t('satisfaction_settings.personalization_title')}
        </Typography>
        <form onSubmit={handleSubmit(onSettingsSubmit)}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="background_color"
                control={control}
                render={({ field }) => <TextField {...field} label={t('satisfaction_settings.background_color_label')} fullWidth type="color" InputLabelProps={{ shrink: true }} />}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="text_color"
                control={control}
                render={({ field }) => <TextField {...field} label={t('satisfaction_settings.text_color_label')} fullWidth type="color" InputLabelProps={{ shrink: true }} />}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="primary_color"
                control={control}
                render={({ field }) => <TextField {...field} label={t('satisfaction_settings.primary_color_label')} fullWidth type="color" InputLabelProps={{ shrink: true }} />}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="background_image_url"
                control={control}
                render={({ field }) => <TextField {...field} label={t('satisfaction_settings.background_image_url_label')} fullWidth />}
              />
            </Grid>
          </Grid>
          <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }} disabled={isSubmittingSettings}>
            {isSubmittingSettings ? <CircularProgress size={24} /> : t('satisfaction_settings.save_personalization_button')}
          </Button>
        </form>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          {t('satisfaction_settings.nps_criteria_title')}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {t('satisfaction_settings.nps_criteria_description')}
        </Typography>

        <Box component="form" onSubmit={handleCriterionSubmit} sx={{ display: 'flex', gap: 2, mb: 4 }}>
          <TextField
            fullWidth
            label={t('satisfaction_settings.new_nps_criterion_label')}
            value={newCriterionName}
            onChange={(e) => setNewCriterionName(e.target.value)}
            variant="outlined"
            disabled={isSubmitting}
          />
          <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
            {isSubmitting ? <CircularProgress size={24} /> : t('satisfaction_settings.add_button')}
          </Button>
        </Box>

        {isLoading ? (
          <CircularProgress />
        ) : isError ? (
          <Typography color="error">{t('satisfaction_settings.error_loading_criteria')}</Typography>
        ) : (
          <List>
            {criteria?.map((criterion) => (
              <ListItem key={criterion.id} secondaryAction={
                <Box>
                  <IconButton edge="end" aria-label="edit" onClick={() => setEditCriterion(criterion)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(criterion.id)} sx={{ ml: 1 }}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              }>
                <ListItemText primary={criterion.name} />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      <Dialog open={!!editCriterion} onClose={() => setEditCriterion(null)} fullWidth maxWidth="sm">
        <DialogTitle>{t('satisfaction_settings.edit_criterion_title')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t('satisfaction_settings.criterion_name_label')}
            type="text"
            fullWidth
            variant="standard"
            value={editCriterion?.name || ''}
            onChange={(e) => setEditCriterion({ ...editCriterion, name: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditCriterion(null)}>{t('satisfaction_settings.cancel_button')}</Button>
          <Button onClick={handleUpdate} disabled={isSubmitting}>
            {isSubmitting ? <CircularProgress size={24} /> : t('satisfaction_settings.save_button')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SatisfactionSettings;