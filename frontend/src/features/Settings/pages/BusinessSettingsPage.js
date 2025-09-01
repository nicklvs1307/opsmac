import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Switch,
  Divider,
  CircularProgress,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Business as BusinessIcon,
  PhotoCamera as PhotoCameraIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '@/app/providers/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

import {
  useUploadLogo,
  useUpdateProfileAndRestaurant,
  useUpdateGeneralSetting,
} from '../api/settingsService'; // Adjusted import path

const getFullImageUrl = (relativePath) => {
  if (!relativePath) return '';
  const baseUrl = process.env.REACT_APP_API_URL || '';
  return `${baseUrl}${relativePath.startsWith('/') ? relativePath : `/${relativePath}`}`;
};

const BusinessSettingsPage = () => {
  const { user, dispatch } = useAuth();
  const { t } = useTranslation();

  const [selectedLogo, setSelectedLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(getFullImageUrl(user?.restaurant?.logo) || '');
  const [settings, setSettings] = useState({}); // Local state for general settings

  useEffect(() => {
    setLogoPreview(getFullImageUrl(user?.restaurant?.logo) || '');
  }, [user]);

  const handleLogoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedLogo(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const uploadLogoMutation = useUploadLogo({
    onSuccess: (data) => {
      toast.success(t('settings.logo_updated_successfully'));
      const updatedRestaurant = { ...user.restaurant, logo: data.logo_url };
      const updatedUser = { ...user, restaurant: updatedRestaurant };
      dispatch({ type: 'UPDATE_USER', payload: updatedUser });
      setSelectedLogo(null);
      setLogoPreview(getFullImageUrl(data.logo_url));
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || t('settings.error_uploading_logo'));
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

  const updateGeneralSettingMutation = useUpdateGeneralSetting({
    onSuccess: () => {
      toast.success(t('settings.setting_updated'));
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || t('settings.error_updating_setting'));
      // Re-fetch settings if there was an error to revert local state
      // queryClient.invalidateQueries(['generalSettings', currentRestaurantId]); // queryClient not available here
    },
  });

  const onProfileSubmit = async (data) => {
    const profileData = {}; // No profile data in business tab

    const restaurantData = {
      name: data.restaurant_name,
      cuisine_type: data.cuisine_type,
      address: data.address,
      description: data.description,
    };

    const currentRestaurantId = user?.restaurants?.[0]?.id; // Assuming currentRestaurantId is available via user object

    if (currentRestaurantId) {
      updateProfileAndRestaurantMutation.mutate({
        restaurantId: currentRestaurantId,
        profileData,
        restaurantData,
      });
    }
  };

  const handleSettingChange = (category, setting, value) => {
    const currentRestaurantId = user?.restaurants?.[0]?.id; // Assuming currentRestaurantId is available via user object
    if (!currentRestaurantId) return;
    // Optimistic update (optional, but good for UX)
    setSettings((prev) => ({ ...prev, [category]: { ...prev[category], [setting]: value } }));

    updateGeneralSettingMutation.mutate({
      restaurantId: currentRestaurantId,
      category,
      setting,
      value,
    });
  };

  const {
    control: profileControl,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm({
    defaultValues: {
      restaurant_name: user?.restaurant?.name || '',
      cuisine_type: user?.restaurant?.cuisine_type || '',
      address: user?.restaurant?.address || '',
      description: user?.restaurant?.description || '',
    },
  });

  // Sync form with fetched settings
  useEffect(() => {
    if (user) {
      resetProfile({
        restaurant_name: user.restaurant?.name || '',
        cuisine_type: user.restaurant?.cuisine_type || '',
        address: user.restaurant?.address || '',
        description: user.restaurant?.description || '',
      });
      // Initialize local settings state from user object for business settings
      setSettings({
        business: {
          auto_reply: user.restaurant?.settings?.business?.auto_reply || false,
          feedback_moderation: user.restaurant?.settings?.business?.feedback_moderation || false,
          loyalty_program: user.restaurant?.settings?.business?.loyalty_program || false,
        },
      });
    }
  }, [user, resetProfile]);

  const cuisineTypes = [
    t('settings.cuisine_type_brazilian'),
    t('settings.cuisine_type_italian'),
    t('settings.cuisine_type_japanese'),
    t('settings.cuisine_type_chinese'),
    t('settings.cuisine_type_mexican'),
    t('settings.cuisine_type_french'),
    t('settings.cuisine_type_indian'),
    t('settings.cuisine_type_arabic'),
    t('settings.cuisine_type_vegetarian'),
    t('settings.cuisine_type_vegan'),
    t('settings.cuisine_type_fast_food'),
    t('settings.cuisine_type_pizza'),
    t('settings.cuisine_type_steakhouse'),
    t('settings.cuisine_type_seafood'),
    t('settings.cuisine_type_contemporary'),
    t('settings.cuisine_type_fusion'),
    t('settings.cuisine_type_other'),
  ];

  return (
    <>
      <Card>
        <CardHeader
          title={t('settings.restaurant_info')}
          subheader={t('settings.configure_restaurant_info')}
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
              src={logoPreview}
            >
              <BusinessIcon sx={{ fontSize: 60 }} />
            </Avatar>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="logo-upload-input"
              type="file"
              onChange={handleLogoChange}
            />
            <label htmlFor="logo-upload-input">
              <Button variant="outlined" component="span" startIcon={<PhotoCameraIcon />}>
                {t('settings.change_logo')}
              </Button>
            </label>
            {selectedLogo && (
              <Button
                variant="contained"
                onClick={() =>
                  uploadLogoMutation.mutate({
                    restaurantId: user?.restaurants?.[0]?.id,
                    logoFile: selectedLogo,
                  })
                }
                disabled={uploadLogoMutation.isLoading}
                sx={{ mt: 1 }}
              >
                {uploadLogoMutation.isLoading ? (
                  <CircularProgress size={20} />
                ) : (
                  t('settings.upload_logo')
                )}
              </Button>
            )}
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Controller
                name="restaurant_name"
                control={profileControl}
                rules={{ required: t('settings.restaurant_name_required') }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t('settings.restaurant_name')}
                    fullWidth
                    error={!!profileErrors.restaurant_name}
                    helperText={profileErrors.restaurant_name?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="cuisine_type"
                control={profileControl}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>{t('settings.cuisine_type')}</InputLabel>
                    <Select {...field} label={t('settings.cuisine_type')}>
                      {cuisineTypes.map((type) => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="address"
                control={profileControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t('settings.address')}
                    fullWidth
                    multiline
                    rows={2}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="description"
                control={profileControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t('settings.description')}
                    fullWidth
                    multiline
                    rows={3}
                    placeholder={t('settings.description')}
                  />
                )}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            {t('settings.business_settings')}
          </Typography>

          <List>
            <ListItem>
              <ListItemText
                primary={t('settings.auto_reply')}
                secondary={t('settings.send_auto_replies')}
              />
              <ListItemSecondaryAction>
                <Switch
                  checked={settings?.business?.auto_reply || false}
                  onChange={(e) => handleSettingChange('business', 'auto_reply', e.target.checked)}
                />
              </ListItemSecondaryAction>
            </ListItem>

            <ListItem>
              <ListItemText
                primary={t('settings.feedback_moderation')}
                secondary={t('settings.review_feedback_before_publishing')}
              />
              <ListItemSecondaryAction>
                <Switch
                  checked={settings?.business?.feedback_moderation || false}
                  onChange={(e) =>
                    handleSettingChange('business', 'feedback_moderation', e.target.checked)
                  }
                />
              </ListItemSecondaryAction>
            </ListItem>

            <ListItem>
              <ListItemText
                primary={t('settings.loyalty_program')}
                secondary={t('settings.activate_loyalty_program')}
              />
              <ListItemSecondaryAction>
                <Switch
                  checked={settings?.business?.loyalty_program || false}
                  onChange={(e) =>
                    handleSettingChange('business', 'loyalty_program', e.target.checked)
                  }
                />
              </ListItemSecondaryAction>
            </ListItem>
          </List>

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

      {/* The Digital Menu Link Card will be moved to DeliveryMenuPage.js in Phase 2 */}
    </>
  );
};

export default BusinessSettingsPage;
