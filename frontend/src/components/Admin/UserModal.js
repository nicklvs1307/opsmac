import React, { useEffect } from 'react';
import {
  Box, Typography, TextField, Button, Select, MenuItem, FormControl, InputLabel,
  Dialog, DialogTitle, DialogContent, DialogActions, FormGroup, FormControlLabel, Checkbox, IconButton
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';

// Esquema de Validação para o Usuário
const userSchema = (t, editingUser) => yup.object().shape({
  name: yup.string().min(2, t('admin_dashboard.name_min_chars')).required(t('admin_dashboard.name_required')),
  email: yup.string().email(t('admin_dashboard.email_invalid')).required(t('admin_dashboard.email_required')),
  phone: yup.string().optional(),
  role: yup.string().oneOf(['owner', 'admin', 'employee'], t('admin_dashboard.role_invalid')).required(t('admin_dashboard.role_required')),
  password: yup.string()
    .min(6, t('admin_dashboard.password_min_chars'))
    .when('editingUser', {
      is: (val) => !val, // If not editing an existing user (i.e., creating a new one)
      then: (schema) => schema.required(t('admin_dashboard.password_required')),
      otherwise: (schema) => schema.optional(),
    }),
});

const generateRandomPassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=';
  let password = '';
  for (let i = 0; i < 12; i++) { // Generate a 12-character password
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

const UserModal = ({ isOpen, onClose, editingUser, onSave }) => {
  const { t } = useTranslation();
  const { control, handleSubmit, reset, setValue } = useForm({
    resolver: yupResolver(userSchema(t, editingUser)),
  });

  useEffect(() => {
    reset(editingUser || {});
  }, [editingUser, reset]);

  const onSubmit = (data) => {
    onSave(data);
  };

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>{editingUser ? t('admin_dashboard.edit_user_title') : t('admin_dashboard.create_user_tab')}</DialogTitle>
      <DialogContent>
        <Controller name="name" control={control} render={({ field, fieldState: { error } }) => (
          <TextField
            {...field}
            label={t('admin_dashboard.name_label')}
            fullWidth
            margin="normal"
            error={!!error}
            helperText={error ? error.message : null}
          />
        )} />
        <Controller name="email" control={control} render={({ field, fieldState: { error } }) => (
          <TextField
            {...field}
            label={t('admin_dashboard.email_label')}
            fullWidth
            margin="normal"
            error={!!error}
            helperText={error ? error.message : null}
          />
        )} />
        <Controller name="phone" control={control} render={({ field, fieldState: { error } }) => (
          <TextField
            {...field}
            label={t('admin_dashboard.user_phone_label')}
            fullWidth
            margin="normal"
            error={!!error}
            helperText={error ? error.message : null}
          />
        )} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Controller
            name="password"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                label={t('admin_dashboard.password_label')}
                type="password"
                fullWidth
                margin="normal"
                error={!!error}
                helperText={error ? error.message : null}
              />
            )}
          />
          <Button
            variant="outlined"
            onClick={() => setValue('password', generateRandomPassword())}
            sx={{ mt: 2 }}
          >
            {t('admin_dashboard.generate_password_button')}
          </Button>
        </Box>
        <Controller name="role" control={control} render={({ field, fieldState: { error } }) => (
          <FormControl fullWidth margin="normal" error={!!error}>
            <InputLabel>{t('admin_dashboard.role_label')}</InputLabel>
            <Select {...field} label={t('admin_dashboard.role_label')}>
              <MenuItem value="owner">{t('admin_dashboard.role_owner')}</MenuItem>
              <MenuItem value="admin">{t('admin_dashboard.role_admin')}</MenuItem>
              <MenuItem value="employee">{t('admin_dashboard.role_employee')}</MenuItem>
            </Select>
            {error && <FormHelperText>{error.message}</FormHelperText>}
          </FormControl>
        )} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('common.cancel')}</Button>
        <Button onClick={handleSubmit(onSubmit)} variant="contained">{t('common.save')}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserModal;
