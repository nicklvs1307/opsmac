import React, { useState, useEffect } from 'react';
import { Alert } from '@mui/material';
import { usePermissions } from '../../hooks/usePermissions';
import {
  Box,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Avatar,
} from '@mui/material';
import { PhotoCamera as PhotoCameraIcon, Save as SaveIcon } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '@/app/providers/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

import {
  useUploadAvatar,
  useUpdateProfileAndRestaurant,
} from '../api/settingsService'; // Adjusted import path

const getFullImageUrl = (relativePath) => {
  if (!relativePath) return '';
  const baseUrl = process.env.REACT_APP_API_URL || '';
  return `${baseUrl}${relativePath.startsWith('/') ? relativePath : `/${relativePath}`}`;
};

const ProfilePage = () => {
  const { can } = usePermissions();
  const { user, updateUser, dispatch } = useAuth();
  const { t } = useTranslation();

  const [selectedAvatarFile, setSelectedAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(getFullImageUrl(user?.avatar) || '');

  useEffect(() => {
    setAvatarPreview(getFullImageUrl(user?.avatar) || '');
  }, [user]);

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const uploadAvatarMutation = useUploadAvatar({
    onSuccess: (data) => {
      toast.success(t('settings.avatar_updated_successfully'));
      dispatch({ type: 'UPDATE_USER', payload: { avatar: data.avatar_url } });
      setSelectedAvatarFile(null);
      setAvatarPreview(getFullImageUrl(data.avatar_url));
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || t('settings.error_uploading_avatar'));
    },
  });

  const updateProfileAndRestaurantMutation = useUpdateProfileAndRestaurant({
    onSuccess: (data, variables) => {
      toast.success(t('settings.profile_updated_successfully'));
      // Update user context with new restaurant data if it was updated
      if (variables.restaurantData) {
        const updatedRestaurant = { ...user.restaurant, ...variables.restaurantData };
        const updatedUser = { ...user, restaurant: updatedRestaurant };
        dispatch({ type: 'UPDATE_USER', payload: updatedUser });
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || t('settings.error_updating_profile'));
    },
  });

  const onProfileSubmit = async (data) => {
    const profileData = {
      name: data.name,
      email: data.email,
      phone: data.phone,
    };

    // No restaurant data in profile tab, so pass empty object
    const restaurantData = {};

    await updateUser(profileData); // This is from AuthContext, not refactored here

    // Assuming currentRestaurantId is available from AuthContext or passed as prop
    // For now, we'll assume it's available via user object
    const currentRestaurantId = user?.restaurants?.[0]?.id;

    if (currentRestaurantId) {
      updateProfileAndRestaurantMutation.mutate({
        restaurantId: currentRestaurantId,
        profileData,
        restaurantData,
      });
    }
  };

  const {
    control: profileControl,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    },
  });

  useEffect(() => {
    if (user) {
      resetProfile({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user, resetProfile]);

  if (!can('user_profile', 'update')) { // Assumindo permissão para atualizar o perfil do usuário
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="warning">
          {t('common.module_not_enabled', { moduleName: t('modules.profile_settings') })}
        </Alert>
      </Box>
    );
  }

  return (
    <Card>
      <CardHeader
        title={t('settings.personal_info')}
        subheader={t('settings.update_personal_info')}
      />
      <CardContent>
        <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
          <Avatar
            sx={{
              width: 120,
              height: 120,
              mb: 2,
              border: '2px solid',
              borderColor: 'divider',
            }}
            src={avatarPreview}
          >
            {user?.name?.charAt(0)}
          </Avatar>
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="avatar-upload-input"
            type="file"
            onChange={handleAvatarChange}
          />
          <label htmlFor="avatar-upload-input">
            <Button variant="outlined" component="span" startIcon={<PhotoCameraIcon />}>
              {t('settings.change_avatar')}
            </Button>
          </label>
          {selectedAvatarFile && (
            <Button
              variant="contained"
              onClick={() => uploadAvatarMutation.mutate(selectedAvatarFile)}
              disabled={uploadAvatarMutation.isLoading}
              sx={{ mt: 1 }}
            >
              {uploadAvatarMutation.isLoading ? (
                <CircularProgress size={20} />
              ) : (
                t('settings.upload_avatar')
              )}
            </Button>
          )}
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Controller
              name="name"
              control={profileControl}
              rules={{ required: t('settings.name_required') }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t('settings.full_name')}
                  fullWidth
                  error={!!profileErrors.name}
                  helperText={profileErrors.name?.message}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Controller
              name="email"
              control={profileControl}
              rules={{
                required: t('settings.email_required'),
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: t('settings.invalid_email'),
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t('settings.email')}
                  type="email"
                  fullWidth
                  error={!!profileErrors.email}
                  helperText={profileErrors.email?.message}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Controller
              name="phone"
              control={profileControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t('settings.phone')}
                  fullWidth
                  placeholder="(11) 99999-9999"
                />
              )}
            />
          </Grid>
        </Grid>

        <Box mt={3}>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleProfileSubmit(onProfileSubmit)}
            disabled={updateProfileAndRestaurantMutation.isLoading}
          >
            {updateProfileAndRestaurantMutation.isLoading ? (
              <CircularProgress size={20} />
            ) : (
              t('settings.save_changes')
            )}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProfilePage;
