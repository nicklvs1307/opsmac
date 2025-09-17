import React, { useEffect } from 'react';
import {
  Box,
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

// Esquema de Validação para o Usuário
const userSchema = (t, editingUser, isSuperadmin) =>
  yup.object().shape({
    name: yup
      .string()
      .min(2, t('admin_dashboard.name_min_chars'))
      .required(t('admin_dashboard.name_required')),
    email: yup
      .string()
      .email(t('admin_dashboard.email_invalid'))
      .required(t('admin_dashboard.email_required')),
    phone: yup.string().optional(),
    roleName: yup
      .string()
      .oneOf(['owner', 'admin', 'employee', 'super_admin'], t('admin_dashboard.role_invalid'))
      .required(t('admin_dashboard.role_required')),
    password: yup
      .string()
      .min(6, t('admin_dashboard.password_min_chars'))
      .when('$editingUser', {
        is: (val) => !val, // Only require for new users
        then: (schema) => schema.required(t('admin_dashboard.password_required')),
        otherwise: (schema) => schema.optional(),
      }),
    restaurantId: isSuperadmin
      ? yup.string().required(t('admin_dashboard.restaurant_id_required'))
      : yup.string().optional(), // Optional if not super admin, will be set automatically
  });

const generateRandomPassword = () => {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

const UserModal = ({
  isOpen,
  onClose,
  editingUser,
  onSave,
  restaurants = [],
  isSuperadmin,
  loggedInUserRestaurantId,
}) => {
  const { t } = useTranslation();
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(userSchema(t, editingUser, isSuperadmin)),
    context: { editingUser, isSuperadmin },
  });

  useEffect(() => {
    if (isOpen) {
      const defaultRestaurantId = isSuperadmin
        ? editingUser?.restaurantId || ''
        : loggedInUserRestaurantId || '';
      reset(
        editingUser
          ? {
              ...editingUser,
              roleName: editingUser.role?.name || '',
              restaurantId: defaultRestaurantId,
            }
          : {
              name: '',
              email: '',
              phone: '',
              roleName: '',
              password: '',
              restaurantId: defaultRestaurantId,
            }
      );
    }
  }, [editingUser, isOpen, reset, isSuperadmin, loggedInUserRestaurantId]);

  const onSubmit = (data) => {
    // If not super admin, ensure restaurantId is set to the logged-in user's restaurantId
    if (!isSuperadmin && !data.restaurantId) {
      data.restaurantId = loggedInUserRestaurantId;
    }
    onSave(data);
  };

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>
        {editingUser ? t('admin_dashboard.edit_user_title') : t('admin_dashboard.create_user_tab')}
      </DialogTitle>
      <DialogContent>
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label={t('admin_dashboard.name_label')}
              fullWidth
              margin="normal"
              error={!!errors.name}
              helperText={errors.name?.message}
            />
          )}
        />
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label={t('admin_dashboard.email_label')}
              fullWidth
              margin="normal"
              error={!!errors.email}
              helperText={errors.email?.message}
            />
          )}
        />
        <Controller
          name="phone"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label={t('admin_dashboard.user_phone_label')}
              fullWidth
              margin="normal"
              error={!!errors.phone}
              helperText={errors.phone?.message}
            />
          )}
        />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={t('admin_dashboard.password_label')}
                type="password"
                fullWidth
                margin="normal"
                error={!!errors.password}
                helperText={errors.password?.message}
              />
            )}
          />
          <Button
            variant="outlined"
            onClick={() => setValue('password', generateRandomPassword())}
            sx={{ mt: 1 }}
          >
            {t('admin_dashboard.generate_password_button')}
          </Button>
        </Box>
        <Controller
          name="roleName"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth margin="normal" error={!!errors.roleName}>
              <InputLabel>{t('admin_dashboard.role_label')}</InputLabel>
              <Select {...field} label={t('admin_dashboard.role_label')}>
                <MenuItem value="super_admin">{t('admin_dashboard.role_super_admin')}</MenuItem>
                <MenuItem value="owner">{t('admin_dashboard.role_owner')}</MenuItem>
                <MenuItem value="admin">{t('admin_dashboard.role_admin')}</MenuItem>
                <MenuItem value="employee">{t('admin_dashboard.role_employee')}</MenuItem>
              </Select>
              {errors.roleName && <FormHelperText>{errors.roleName.message}</FormHelperText>}
            </FormControl>
          )}
        />
        {isSuperadmin && (
          <Controller
            name="restaurantId"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth margin="normal" error={!!errors.restaurantId}>
                <InputLabel>{t('admin_dashboard.restaurant_label')}</InputLabel>
                <Select {...field} label={t('admin_dashboard.restaurant_label')}>
                  {restaurants.map((restaurant) => (
                    <MenuItem key={restaurant.id} value={restaurant.id}>
                      {restaurant.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.restaurantId && (
                  <FormHelperText>{errors.restaurantId.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />
        )}
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

export default UserModal;
