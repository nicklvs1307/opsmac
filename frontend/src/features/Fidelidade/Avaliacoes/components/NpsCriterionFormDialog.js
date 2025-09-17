import React, { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

const criterionSchema = yup.object().shape({
  name: yup.string().required('O nome do critério é obrigatório.'),
});

const NpsCriterionFormDialog = ({
  open,
  onClose,
  criterion, // Se for edição, virá com os dados do critério
  createMutation,
  updateMutation,
}) => {
  const { t } = useTranslation();
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(criterionSchema),
    defaultValues: {
      name: '',
    },
  });

  useEffect(() => {
    if (criterion) {
      reset({ name: criterion.name });
    } else {
      reset({ name: '' });
    }
  }, [criterion, reset]);

  const onSubmit = (data) => {
    if (criterion) {
      // Edição
      updateMutation.mutate(
        { id: criterion.id, name: data.name },
        {
          onSuccess: () => {
            toast.success(t('satisfaction_settings.criterion_update_success'));
            onClose();
          },
          onError: (err) => {
            toast.error(t('satisfaction_settings.criterion_update_error', { message: err.message }));
          },
        }
      );
    } else {
      // Criação
      createMutation.mutate(data.name, {
        onSuccess: () => {
          toast.success(t('satisfaction_settings.criterion_create_success'));
          onClose();
        },
        onError: (err) => {
          toast.error(t('satisfaction_settings.criterion_create_error', { message: err.message }));
        },
      });
    }
  };

  const isLoading = createMutation.isLoading || updateMutation.isLoading;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {criterion ? t('satisfaction_settings.edit_criterion_title') : t('satisfaction_settings.add_criterion_title')}
      </DialogTitle>
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
                label={t('satisfaction_settings.criterion_name_label')}
                type="text"
                fullWidth
                variant="standard"
                error={!!errors.name}
                helperText={errors.name?.message}
              />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>{t('common.cancel')}</Button>
          <Button type="submit" variant="contained" disabled={isLoading}>
            {isLoading ? <CircularProgress size={24} /> : t('common.save')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default NpsCriterionFormDialog;
