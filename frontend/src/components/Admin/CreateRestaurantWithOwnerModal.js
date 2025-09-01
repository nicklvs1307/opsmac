import React, { useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';

const restaurantWithOwnerSchema = (t) =>
  yup.object().shape({
    restaurantName: yup.string().required(t('admin_dashboard.restaurant_name_required')),
    address: yup.string().required(t('admin_dashboard.address_required')),
    city: yup.string().required(t('admin_dashboard.city_required')),
    state: yup.string().required(t('admin_dashboard.state_required')),
    ownerName: yup
      .string()
      .min(2, t('admin_dashboard.name_min_chars'))
      .required(t('admin_dashboard.owner_name_required')),
    ownerEmail: yup
      .string()
      .email(t('admin_dashboard.email_invalid'))
      .required(t('admin_dashboard.owner_email_required')),
    ownerPassword: yup
      .string()
      .min(6, t('admin_dashboard.password_min_chars'))
      .required(t('admin_dashboard.owner_password_required')),
  });

const CreateRestaurantWithOwnerModal = ({ isOpen, onClose, onSave }) => {
  const { t } = useTranslation();
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(restaurantWithOwnerSchema(t)),
  });

  useEffect(() => {
    if (!isOpen) {
      reset(); // Reset form when modal closes
    }
  }, [isOpen, reset]);

  const onSubmit = (data) => {
    onSave(data);
  };

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>{t('admin_dashboard.create_restaurant_with_owner_title')}</DialogTitle>
      <DialogContent>
        <Box mb={2}>
          <Typography variant="h6" gutterBottom>
            {t('admin_dashboard.restaurant_details')}
          </Typography>
          <Controller
            name="restaurantName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={t('admin_dashboard.restaurant_name_label')}
                fullWidth
                margin="normal"
                error={!!errors.restaurantName}
                helperText={errors.restaurantName?.message}
              />
            )}
          />
          <Controller
            name="address"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={t('admin_dashboard.address_label')}
                fullWidth
                margin="normal"
                error={!!errors.address}
                helperText={errors.address?.message}
              />
            )}
          />
          <Controller
            name="city"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={t('admin_dashboard.city_label')}
                fullWidth
                margin="normal"
                error={!!errors.city}
                helperText={errors.city?.message}
              />
            )}
          />
          <Controller
            name="state"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={t('admin_dashboard.state_label')}
                fullWidth
                margin="normal"
                error={!!errors.state}
                helperText={errors.state?.message}
              />
            )}
          />
        </Box>

        <Box mt={4} mb={2}>
          <Typography variant="h6" gutterBottom>
            {t('admin_dashboard.owner_details')}
          </Typography>
          <Controller
            name="ownerName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={t('admin_dashboard.owner_name_label')}
                fullWidth
                margin="normal"
                error={!!errors.ownerName}
                helperText={errors.ownerName?.message}
              />
            )}
          />
          <Controller
            name="ownerEmail"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={t('admin_dashboard.owner_email_label')}
                fullWidth
                margin="normal"
                error={!!errors.ownerEmail}
                helperText={errors.ownerEmail?.message}
              />
            )}
          />
          <Controller
            name="ownerPassword"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={t('admin_dashboard.owner_password_label')}
                type="password"
                fullWidth
                margin="normal"
                error={!!errors.ownerPassword}
                helperText={errors.ownerPassword?.message}
              />
            )}
          />
        </Box>
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

export default CreateRestaurantWithOwnerModal;
