import React, { useEffect } from 'react';
import {
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormHelperText,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';

// Esquema de Validação para Restaurante
const restaurantSchema = (t) =>
  yup.object().shape({
    name: yup.string().required(t('admin_dashboard.restaurant_name_required')),
    address: yup.string().required(t('admin_dashboard.address_required')),
    city: yup.string().required(t('admin_dashboard.city_required')),
    state: yup.string().required(t('admin_dashboard.state_required')),
    ownerId: yup
      .string()
      .uuid(t('admin_dashboard.owner_id_invalid'))
      .required(t('admin_dashboard.owner_id_required')),
  });

const RestaurantModal = ({ isOpen, onClose, editingRestaurant, onSave, users }) => {
  const { t } = useTranslation();
  const { control, handleSubmit, reset } = useForm({
    resolver: yupResolver(restaurantSchema(t)),
  });

  useEffect(() => {
    reset(editingRestaurant || {});
  }, [editingRestaurant, reset]);

  const onSubmit = (data) => {
    onSave(data);
  };

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>
        {editingRestaurant
          ? t('admin_dashboard.edit_restaurant_title')
          : t('admin_dashboard.create_restaurant_tab')}
      </DialogTitle>
      <DialogContent>
        <Controller
          name="name"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <TextField
              {...field}
              label={t('admin_dashboard.restaurant_name_label')}
              fullWidth
              margin="normal"
              error={!!error}
              helperText={error ? error.message : null}
            />
          )}
        />
        <Controller
          name="address"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <TextField
              {...field}
              label={t('admin_dashboard.address_label')}
              fullWidth
              margin="normal"
              error={!!error}
              helperText={error ? error.message : null}
            />
          )}
        />
        <Controller
          name="city"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <TextField
              {...field}
              label={t('admin_dashboard.city_label')}
              fullWidth
              margin="normal"
              error={!!error}
              helperText={error ? error.message : null}
            />
          )}
        />
        <Controller
          name="state"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <TextField
              {...field}
              label={t('admin_dashboard.state_label')}
              fullWidth
              margin="normal"
              error={!!error}
              helperText={error ? error.message : null}
            />
          )}
        />
        <Controller
          name="ownerId"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <FormControl fullWidth margin="normal" error={!!error}>
              <InputLabel>{t('admin_dashboard.owner_label')}</InputLabel>
              <Select {...field} label={t('admin_dashboard.owner_label')}>
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.name}
                  </MenuItem>
                ))}
              </Select>
              {error && <FormHelperText>{error.message}</FormHelperText>}
            </FormControl>
          )}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('common.cancel')}</Button>
        <Button onClick={handleSubmit(onSubmit)} variant="contained">
          {t('common.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RestaurantModal;
