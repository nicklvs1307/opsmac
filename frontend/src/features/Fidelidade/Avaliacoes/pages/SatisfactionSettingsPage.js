import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Alert,
} from '@mui/material';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import toast from 'react-hot-toast';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '@/app/providers/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import usePermissions from '@/hooks/usePermissions';
// import SurveyRewardProgram from '../Pesquisas/SurveyRewardProgram'; // Componente não encontrado, importação comentada
import {
  useNpsCriteria,
  useCreateNpsCriterion,
  useUpdateNpsCriterion,
  useDeleteNpsCriterion,
  useSatisfactionSettings,
  useUpdateSatisfactionSettings,
} from '@/features/Fidelidade/Avaliacoes/api/satisfactionSettingsService';
import { useRewards } from '@/features/Coupons/api/couponQueries';

const SatisfactionSettingsPage = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { can } = usePermissions();
  const restaurantId = user?.restaurants?.[0]?.id;
  // const enabledModules = user?.restaurants?.[0]?.settings?.enabled_modules || []; // Old logic, no longer needed

  const [newCriterionName, setNewCriterionName] = useState('');
  const [editCriterion, setEditCriterion] = useState(null);

  const {
    data: criteria,
    isLoading: isLoadingCriteria,
    isError: isCriteriaError,
  } = useNpsCriteria(restaurantId);
  const { data: settingsData, isLoading: isLoadingSettings } =
    useSatisfactionSettings(restaurantId);
  const { data: rewardsData, isLoading: isLoadingRewards } = useRewards(restaurantId);

  const createMutation = useCreateNpsCriterion();
  const updateMutation = useUpdateNpsCriterion();
  const deleteMutation = useDeleteNpsCriterion();
  const updateSettingsMutation = useUpdateSatisfactionSettings(restaurantId);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      background_color: '#ffffff',
      text_color: '#000000',
      primary_color: '#3f51b5',
      background_image_url: '',
      rewards_per_response: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'rewards_per_response',
  });

  useEffect(() => {
    if (settingsData) {
      const settings = settingsData.data.settings?.survey_program_settings;
      if (settings) {
        reset({
          background_color: settings.background_color || '#ffffff',
          text_color: settings.text_color || '#000000',
          primary_color: settings.primary_color || '#3f51b5',
          background_image_url: settings.background_image_url || '',
          rewards_per_response: settings.rewards_per_response || [],
        });
      }
    }
  }, [settingsData, reset]);

  const onSettingsSubmit = (data) => {
    updateSettingsMutation.mutate({ restaurantId, settings: { survey_program_settings: data } });
  };

  const handleCriterionSubmit = (e) => {
    e.preventDefault();
    if (!newCriterionName.trim()) {
      toast.error(t('satisfaction_settings.criterion_name_empty_error'));
      return;
    }
    createMutation.mutate(newCriterionName, { onSuccess: () => setNewCriterionName('') });
  };

  const handleUpdate = () => {
    if (!editCriterion || !editCriterion.name.trim()) {
      toast.error(t('satisfaction_settings.criterion_name_empty_error'));
      return;
    }
    updateMutation.mutate(
      { id: editCriterion.id, name: editCriterion.name },
      { onSuccess: () => setEditCriterion(null) }
    );
  };

  const handleDelete = (id) => {
    if (window.confirm(t('satisfaction_settings.confirm_delete_criterion'))) {
      deleteMutation.mutate(id);
    }
  };

  if (!can('fidelity:satisfaction:settings', 'read')) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="warning">
          {t('common.module_not_enabled', { moduleName: t('modules.satisfaction') })}
        </Alert>
      </Box>
    );
  }

  if (isLoadingCriteria || isLoadingSettings || isLoadingRewards) {
    return <CircularProgress />;
  }

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
                render={({ field }) => (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <TextField
                      {...field}
                      label={t('satisfaction_settings.background_color_label')}
                      fullWidth
                      type="color"
                      InputLabelProps={{ shrink: true }}
                      sx={{ flexGrow: 1 }}
                    />
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '4px',
                        backgroundColor: field.value || 'transparent',
                        border: '1px solid #ccc',
                      }}
                    />
                  </Box>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="text_color"
                control={control}
                render={({ field }) => (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <TextField
                      {...field}
                      label={t('satisfaction_settings.text_color_label')}
                      fullWidth
                      type="color"
                      InputLabelProps={{ shrink: true }}
                      sx={{ flexGrow: 1 }}
                    />
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '4px',
                        backgroundColor: field.value || 'transparent',
                        border: '1px solid #ccc',
                      }}
                    />
                  </Box>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="primary_color"
                control={control}
                render={({ field }) => (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <TextField
                      {...field}
                      label={t('satisfaction_settings.primary_color_label')}
                      fullWidth
                      type="color"
                      InputLabelProps={{ shrink: true }}
                      sx={{ flexGrow: 1 }}
                    />
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '4px',
                        backgroundColor: field.value || 'transparent',
                        border: '1px solid #ccc',
                      }}
                    />
                  </Box>
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="background_image_url"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t('satisfaction_settings.background_image_url_label')}
                    fullWidth
                  />
                )}
              />
            </Grid>
          </Grid>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            disabled={updateSettingsMutation.isLoading}
          >
            {updateSettingsMutation.isLoading ? (
              <CircularProgress size={24} />
            ) : (
              t('satisfaction_settings.save_personalization_button')
            )}
          </Button>
        </form>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        {/* <SurveyRewardProgram
          control={control}
          errors={errors}
          fields={fields}
          append={append}
          remove={remove}
          rewards={rewardsData?.rewards || []}
          loading={updateSettingsMutation.isLoading}
          onSave={handleSubmit(onSettingsSubmit)}
          t={t}
        /> */}
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          {t('satisfaction_settings.nps_criteria_title')}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {t('satisfaction_settings.nps_criteria_description')}
        </Typography>

        <Box
          component="form"
          onSubmit={handleCriterionSubmit}
          sx={{ display: 'flex', gap: 2, mb: 4 }}
        >
          <TextField
            fullWidth
            label={t('satisfaction_settings.new_nps_criterion_label')}
            value={newCriterionName}
            onChange={(e) => setNewCriterionName(e.target.value)}
            variant="outlined"
            disabled={createMutation.isLoading}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={createMutation.isLoading}
          >
            {createMutation.isLoading ? (
              <CircularProgress size={24} />
            ) : (
              t('satisfaction_settings.add_button')
            )}
          </Button>
        </Box>

        {isLoadingCriteria ? (
          <CircularProgress />
        ) : isCriteriaError ? (
          <Typography color="error">{t('satisfaction_settings.error_loading_criteria')}</Typography>
        ) : (
          <List>
            {criteria?.map((criterion) => (
              <ListItem
                key={criterion.id}
                secondaryAction={
                  <Box>
                    <IconButton
                      edge="end"
                      aria-label="edit"
                      onClick={() => setEditCriterion(criterion)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleDelete(criterion.id)}
                      sx={{ ml: 1 }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                }
              >
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
          <Button onClick={() => setEditCriterion(null)}>
            {t('satisfaction_settings.cancel_button')}
          </Button>
          <Button onClick={handleUpdate} disabled={updateMutation.isLoading}>
            {updateMutation.isLoading ? (
              <CircularProgress size={24} />
            ) : (
              t('satisfaction_settings.save_button')
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SatisfactionSettingsPage;
