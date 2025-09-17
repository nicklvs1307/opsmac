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
  Grid,
  Button,
  CircularProgress,
  Paper,
  Typography,
} from '@mui/material';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';

const segmentSchema = yup.object().shape({
  name: yup.string().required('O nome do segmento é obrigatório.'),
  description: yup.string().optional(),
  rules: yup.array().of(
    yup.object().shape({
      field: yup.string().required('O campo da regra é obrigatório.'),
      value: yup.number().required('O valor da regra é obrigatório.').typeError('O valor deve ser um número.'),
    })
  ).min(1, 'Adicione pelo menos uma regra.').required('Adicione pelo menos uma regra.'),
});

const SegmentFormDialog = ({
  open,
  onClose,
  editingSegment,
  createSegmentMutation,
  updateSegmentMutation,
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
    resolver: yupResolver(segmentSchema),
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

  const onSubmit = (data) => {
    if (editingSegment) {
      updateSegmentMutation.mutate({ segmentId: editingSegment.id, segmentData: data, token });
    } else {
      createSegmentMutation.mutate({ segmentData: { ...data, restaurantId }, token });
    }
  };

  const isLoading = createSegmentMutation.isLoading || updateSegmentMutation.isLoading;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        {editingSegment ? t('segmentation.edit_segment') : t('segmentation.create_segment')}
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t('segmentation.form.name')}
            type="text"
            fullWidth
            variant="outlined"
            {...control.register('name', { required: t('segmentation.form.name_required') })}
            error={!!errors.name}
            helperText={errors.name?.message}
          />
          <TextField
            margin="dense"
            label={t('segmentation.form.description')}
            type="text"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            {...control.register('description')}
            error={!!errors.description}
            helperText={errors.description?.message}
          />

          <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
            {t('segmentation.form.rules')}
          </Typography>
          {fields.map((item, index) => (
            <Paper key={item.id} sx={{ p: 2, mb: 2, border: '1px solid #eee' }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={4}>
                  <Controller
                    name={`rules.${index}.field`}
                    control={control}
                    rules={{ required: t('segmentation.form.rule_field_required') }}
                    render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>{t('segmentation.form.rule_field')}</InputLabel>
                        <Select {...field} label={t('segmentation.form.rule_field')}>
                          <MenuItem value="totalVisits">
                            {t('segmentation.form.field_total_visits')}
                          </MenuItem>
                          <MenuItem value="totalSpent">
                            {t('segmentation.form.field_total_spent')}
                          </MenuItem>
                          <MenuItem value="loyaltyPoints">
                            {t('segmentation.form.field_loyalty_points')}
                          </MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Controller
                    name={`rules.${index}.value`}
                    control={control}
                    rules={{
                      required: t('segmentation.form.rule_value_required'),
                      setValueAs: (v) => parseFloat(v),
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label={t('segmentation.form.rule_value')}
                        type="number"
                        fullWidth
                        error={!!errors.rules?.[index]?.value}
                        helperText={errors.rules?.[index]?.value?.message}
                      />
                    )}
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
          {errors.rules && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {errors.rules.message}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>{t('common.cancel')}</Button>
          <Button type="submit" variant="contained" color="primary" disabled={isLoading}>
            {isLoading ? <CircularProgress size={24} /> : (editingSegment ? t('common.save_changes') : t('common.create'))}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default SegmentFormDialog;
