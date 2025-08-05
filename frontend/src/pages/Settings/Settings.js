import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Paper,
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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  FormControlLabel, // Adicionado
  InputLabel,
  Select,
  MenuItem,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Person as PersonIcon,
  Business as BusinessIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Palette as PaletteIcon,
  PhotoCamera as PhotoCameraIcon,
  Save as SaveIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  ContentCopy as ContentCopyIcon,
  WhatsApp as WhatsAppIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { useThemeMode } from '../../contexts/ThemeContext';

import axiosInstance from '../../api/axiosInstance';

import ProfilePictureUpload from '../../components/UI/ProfilePictureUpload';

const getFullImageUrl = (relativePath) => {
  if (!relativePath) return '';
  // Always use the frontend domain for images
  const baseUrl = window.location.origin;
  return `${baseUrl}${relativePath.startsWith('/') ? relativePath : `/${relativePath}`}`;
};

const Settings = () => {
  const { user, updateUser, setUser } = useAuth();
  const { mode, toggleTheme } = useThemeMode();
  const { t, i18n } = useTranslation();
  const restaurantId = user?.restaurants?.[0]?.id;
  
  const [loading, setLoading] = useState(true); // Keep true from current
  const [apiToken, setApiToken] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  const [changePasswordDialog, setChangePasswordDialog] = useState(false);
  const [testMessageDialog, setTestMessageDialog] = useState(false);
  const [testRecipient, setTestRecipient] = useState('');
  const [testMessage, setTestMessage] = useState('');
  const [selectedLogo, setSelectedLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(getFullImageUrl(user?.restaurant?.logo) || '');
  const [settings, setSettings] = useState({
    notifications: {
      email_feedback: true,
      email_reports: true,
      sms_alerts: false,
      push_notifications: true,
    },
    appearance: {
      theme: mode, // Use mode from useThemeMode
      language: i18n.language, // Use i18n.language
      timezone: 'America/Sao_Paulo',
    },
    business: {
      auto_reply: true,
      feedback_moderation: false,
      qr_expiration: 30,
      loyalty_program: true,
    },
  });

  useEffect(() => {
    setLogoPreview(getFullImageUrl(user?.restaurant?.logo) || '');
  }, [user]);

  const handleLogoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedLogo(file);
      setLogoPreview(URL.createObjectURL(file));
      console.log('[Settings] Selected logo file:', file);
    }
  };

  const handleLogoUpload = async () => {
    if (!selectedLogo) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('logo', selectedLogo);

    try {
      const response = await axiosInstance.post(`/api/settings/${restaurantId}/logo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('[Settings] Logo upload success response:', response.data);
      alert('Logo updated successfully!');
      const updatedRestaurant = { ...user.restaurant, logo: response.data.logo_url };
      const updatedUser = { ...user, restaurant: updatedRestaurant };
      setUser(updatedUser);
      console.log('[Settings] Before calling setUser, setUser is:', setUser);
      setSelectedLogo(null);
      setLogoPreview(getFullImageUrl(response.data.logo_url)); // Atualiza a prévia com a URL completa
    } catch (err) {
      console.error('[Settings] Logo upload error:', err.response?.data || err.message);
      alert(err.response?.data?.message || 'Error uploading logo.');
    } finally {
      setLoading(false);
    }
  };

  const fetchApiToken = useCallback(async (id) => {
    try {
      const response = await axiosInstance.get(`/api/settings/${id}/api-token`);
      setApiToken(response.data.api_token || '');
    } catch (err) {
      console.error('Error fetching API token:', err);
      alert('Error fetching API token.');
    }
  }, [t]);

  const fetchSettings = useCallback(async (id) => {
    try {
      const response = await axiosInstance.get(`/api/settings/${id}`);
      setSettings(prevSettings => ({
        notifications: { ...(prevSettings.notifications || {}), ...(response.data.settings?.notifications || {}) },
        appearance: { ...(prevSettings.appearance || {}), ...(response.data.settings?.appearance || {}) },
        business: { ...(prevSettings.business || {}), ...(response.data.settings?.business || {}) },
      }));
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleGenerateApiToken = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.post(`/api/settings/${restaurantId}/api-token/generate`);
      setApiToken(response.data.api_token);
      alert('New API token generated successfully!');
    } catch (err) {
      console.error('Error generating API token:', err);
      alert('Error generating API token.');
    } finally {
      setLoading(false);
    }
  }, [restaurantId, t]);

  const handleRevokeApiToken = useCallback(async () => {
    try {
      setLoading(true);
      await axiosInstance.delete(`/api/settings/${restaurantId}/api-token`);
      setApiToken('');
      alert('API token revoked successfully!');
    } catch (err) {
      console.error('Error revoking API token:', err);
      toast.error(t('settings.error_revoking_api_token'));
    } finally {
      setLoading(false);
    }
  }, [restaurantId, t]);

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
      restaurant_name: user?.restaurant?.name || '',
      cuisine_type: user?.restaurant?.cuisine_type || '',
      address: user?.restaurant?.address || '',
      description: user?.restaurant?.description || '',
    },
  });

  const {
    control: passwordControl,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
    watch,
  } = useForm({
    defaultValues: {
      current_password: '',
      new_password: '',
      confirm_password: '',
    },
  });

  const newPassword = watch('new_password');

  const {
    control: whatsappControl,
    handleSubmit: handleWhatsappSubmit,
    formState: { errors: whatsappErrors },
    reset: resetWhatsapp,
  } = useForm({
    defaultValues: {
      whatsapp_enabled: false, // Adicionado
      whatsapp_api_url: '',
      whatsapp_api_key: '',
      whatsapp_instance_id: '',
      whatsapp_phone_number: '',
    },
  });

  const onWhatsappSettingsSubmit = async (data) => {
    try {
      setLoading(true);
      // O objeto 'data' já inclui o 'whatsapp_enabled' do formulário
      await axiosInstance.put(`/api/settings/${restaurantId}/whatsapp`, data);
      alert('WhatsApp settings updated successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating WhatsApp settings.');
    } finally {
      setLoading(false);
    }
  };

  // Combined useEffect for initial data fetching and form reset
  useEffect(() => {
    if (user && restaurantId) {
      fetchSettings(restaurantId);
      fetchApiToken(restaurantId);
      resetProfile({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        restaurant_name: user.restaurant?.name || '',
        cuisine_type: user.restaurant?.cuisine_type || '',
        address: user.restaurant?.address || '',
        description: user.restaurant?.description || '',
      });
      // Fetch and set WhatsApp settings separately
      const fetchWhatsappSettings = async () => {
        try {
          const response = await axiosInstance.get(`/api/settings/${restaurantId}/whatsapp`);
          // A resposta da API agora deve incluir 'whatsapp_enabled'
          resetWhatsapp(response.data);
        } catch (err) {
          console.error('Error fetching WhatsApp settings:', err);
          alert('Error fetching WhatsApp settings.');
        }
      };
      fetchWhatsappSettings();
    }
  }, [user, restaurantId, fetchSettings, fetchApiToken, resetProfile, resetWhatsapp, t]);

  const onProfileSubmit = async (data) => {
    try {
      setLoading(true);
      
      const profileData = {
        name: data.name,
        email: data.email,
        phone: data.phone,
      };
      
      const restaurantData = {
        name: data.restaurant_name,
        cuisine_type: data.cuisine_type,
        address: data.address,
        description: data.description,
      };
      
      // Update user profile
      await updateUser(profileData);

      // Update restaurant profile
      if (restaurantId) {
        await axiosInstance.put(`/api/settings/${restaurantId}/profile`, restaurantData);
        // Update user context with new restaurant data
        const updatedRestaurant = { ...user.restaurant, ...restaurantData };
        const updatedUser = { ...user, restaurant: updatedRestaurant };
        setUser(updatedUser);
      }

      alert('Profile updated successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating profile.');
    } finally {
      setLoading(false);
    }
  };

  const onPasswordSubmit = async (data) => {
    try {
      setLoading(true);
      
      await axiosInstance.put('/api/auth/change-password', {
        current_password: data.current_password,
        new_password: data.new_password,
      });
      
            alert('Password changed successfully!');
      setChangePasswordDialog(false);
      resetPassword();
    } catch (err) {
      alert(err.response?.data?.message || 'Error changing password.');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = async (category, setting, value) => {
    try {
      const newSettings = {
        ...settings,
        [category]: {
          ...settings[category],
          [setting]: value,
        },
      };
      
      setSettings(newSettings);
      
      await axiosInstance.put(`/api/settings/${restaurantId}`, { // Use restaurantId
        category,
        setting,
        value,
      });
      
      alert('Setting updated!');
    } catch (err) {
      alert('Error updating setting.');
      // Revert on error
      if (restaurantId) { // Only fetch if restaurantId exists
        fetchSettings(restaurantId);
      }
    }
  };

  const sendTestMessage = async () => {
    try {
      setLoading(true);
      await axiosInstance.post(`/api/settings/${restaurantId}/whatsapp/test`, {
        recipient: testRecipient,
        message: testMessage,
      });
      alert('Test message sent successfully!');
      setTestMessageDialog(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Error sending test message.');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: t('settings.profile'), icon: PersonIcon },
    { id: 'business', label: t('settings.business'), icon: BusinessIcon },
    { id: 'notifications', label: t('settings.notifications'), icon: NotificationsIcon },
    { id: 'security', label: t('settings.security'), icon: SecurityIcon },
    { id: 'appearance', label: t('settings.appearance'), icon: PaletteIcon },
    { id: 'whatsapp', label: t('settings.whatsapp'), icon: WhatsAppIcon },
  ];

  const cuisineTypes = [
    'Brasileira', 'Italiana', 'Japonesa', 'Chinesa', 'Mexicana', 'Francesa',
    'Indiana', 'Árabe', 'Vegetariana', 'Vegana', 'Fast Food', 'Pizzaria',
    'Churrascaria', 'Frutos do Mar', 'Contemporânea', 'Fusion', 'Outros',
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <Card>
            <CardHeader
              title={t('settings.personal_info')}
              subheader={t('settings.update_personal_info')}
            />
            <CardContent>
              <Box display="flex" alignItems="center" mb={3}>
                <Avatar
                  sx={{ width: 80, height: 80, mr: 2 }}
                  src={user?.avatar}
                >
                  {user?.name?.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6">{user?.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user?.role === 'admin' ? t('settings.role_admin') : t('settings.role_user')}
                  </Typography>
                  <IconButton size="small" sx={{ mt: 1 }}>
                    <PhotoCameraIcon />
                  </IconButton>
                </Box>
              </Box>
              
              <ProfilePictureUpload
                currentAvatar={user?.avatar}
                onUploadSuccess={(newAvatarUrl) => {
                  setUser(prevUser => ({ ...prevUser, avatar: newAvatarUrl }));
                  const successMessage = typeof t === 'function' ? t('settings.avatar_updated_successfully') : 'Avatar updated successfully!';
                  toast.success(successMessage);
                }}
              />

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
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={20} /> : t('settings.save_changes')}
                </Button>
              </Box>
            </CardContent>
          </Card>
        );

      case 'business':
        return (
          <Card>
            <CardHeader
              title={t('settings.restaurant_info')}
              subheader={t('settings.configure_restaurant_info')}
            />
            <CardContent>
              <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
                <Avatar
                  sx={{ width: 120, height: 120, mb: 2, border: '2px solid', borderColor: 'divider' }}
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
                    onClick={handleLogoUpload}
                    disabled={loading}
                    sx={{ mt: 1 }}
                  >
                    {loading ? <CircularProgress size={20} /> : t('settings.upload_logo')}
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
                      checked={settings.business.auto_reply}
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
                      checked={settings.business.feedback_moderation}
                      onChange={(e) => handleSettingChange('business', 'feedback_moderation', e.target.checked)}
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
                      checked={settings.business.loyalty_program}
                      onChange={(e) => handleSettingChange('business', 'loyalty_program', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
              
              <Box mt={3}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleProfileSubmit(onProfileSubmit)}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={20} /> : t('settings.save_changes')}
                </Button>
              </Box>
            </CardContent>
          </Card>
        );

      case 'notifications':
        return (
          <Card>
            <CardHeader
              title={t('settings.notification_preferences')}
              subheader={t('settings.configure_notifications')}
            />
            <CardContent>
              <List>
                <ListItem>
                  <ListItemText
                    primary={t('settings.email_new_feedback')}
                    secondary={t('settings.receive_email_new_feedback')}
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={settings.notifications.email_feedback}
                      onChange={(e) => handleSettingChange('notifications', 'email_feedback', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                
                <ListItem>
                  <ListItemText
                    primary={t('settings.email_reports')}
                    secondary={t('settings.receive_weekly_reports')}
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={settings.notifications.email_reports}
                      onChange={(e) => handleSettingChange('notifications', 'email_reports', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                
                <ListItem>
                  <ListItemText
                    primary={t('settings.sms_alerts')}
                    secondary={t('settings.receive_important_alerts_sms')}
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={settings.notifications.sms_alerts}
                      onChange={(e) => handleSettingChange('notifications', 'sms_alerts', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                
                <ListItem>
                  <ListItemText
                    primary={t('settings.push_notifications')}
                    secondary={t('settings.receive_browser_notifications')}
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={settings.notifications.push_notifications}
                      onChange={(e) => handleSettingChange('notifications', 'push_notifications', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        );

      case 'security':
        return (
          <Card>
            <CardHeader
              title={t('settings.security_settings')}
              subheader={t('settings.manage_security_settings')}
            />
            <CardContent>
              <Box mb={3}>
                <Typography variant="h6" gutterBottom>
                  {t('settings.change_password')}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {t('settings.keep_account_secure')}
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => setChangePasswordDialog(true)}
                >
                  {t('settings.change_password')}
                </Button>
              </Box>
              
              <Divider sx={{ my: 3 }} />
              
              <Box>
                <Typography variant="h6" gutterBottom>
                  {t('settings.active_sessions')}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {t('settings.manage_logged_in_sessions')}
                </Typography>
                
                <List>
                  <ListItem>
                    <ListItemText
                      primary={t('settings.current_browser')}
                      secondary={t('settings.current_browser_details')}
                    />
                    <Chip label={t('settings.current_browser')} color="primary" size="small" />
                  </ListItem>
                </List>
              </Box>
              {/* API Token Section */}
              <Divider sx={{ my: 3 }} />
              <Box>
                <Typography variant="h6" gutterBottom>
                  {t('settings.api_token')}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {t('settings.use_public_api')}
                </Typography>
                {apiToken ? (
                  <Box display="flex" alignItems="center">
                    <TextField
                      value={apiToken}
                      fullWidth
                      InputProps={{
                        readOnly: true,
                      }}
                      sx={{ mr: 2 }}
                    />
                    <IconButton onClick={() => navigator.clipboard.writeText(apiToken)}>
                      <ContentCopyIcon />
                    </IconButton>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={handleRevokeApiToken}
                      disabled={loading}
                    >
                      {t('settings.revoke_token')}
                    </Button>
                  </Box>
                ) : (
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleGenerateApiToken}
                    disabled={loading}
                  >
                    {t('settings.generate_new_token')}
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        );

      case 'appearance':
        return (
          <Card>
            <CardHeader
              title={t('settings.appearance')}
              subheader={t('settings.personalize_appearance')}
            />
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>{t('settings.theme')}</InputLabel>
                    <Select
                      value={settings.appearance.theme}
                      label={t('settings.theme')}
                      onChange={(e) => {
                        handleSettingChange('appearance', 'theme', e.target.value);
                        toggleTheme(e.target.value); // Toggle theme in context
                      }}
                    >
                      <MenuItem value="light">{t('settings.light')}</MenuItem>
                      <MenuItem value="dark">{t('settings.dark')}</MenuItem>
                      <MenuItem value="auto">{t('settings.auto')}</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>{t('settings.language')}</InputLabel>
                    <Select
                      value={settings.appearance.language}
                      label={t('settings.language')}
                      onChange={(e) => {
                        handleSettingChange('appearance', 'language', e.target.value);
                        i18n.changeLanguage(e.target.value); // Change language in i18n
                      }}
                    >
                      <MenuItem value="pt">{t('settings.language_pt')}</MenuItem>
                      <MenuItem value="en">{t('settings.language_en')}</MenuItem>
                      <MenuItem value="es">{t('settings.language_es')}</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>{t('settings.timezone')}</InputLabel>
                    <Select
                      value={settings.appearance.timezone}
                      label={t('settings.timezone')}
                      onChange={(e) => handleSettingChange('appearance', 'timezone', e.target.value)}
                    >
                      <MenuItem value="America/Sao_Paulo">{t('settings.timezone_sao_paulo')}</MenuItem>
                      <MenuItem value="America/New_York">{t('settings.timezone_new_york')}</MenuItem>
                      <MenuItem value="Europe/London">{t('settings.timezone_london')}</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        );

      case 'whatsapp':
        return (
          <Card>
            <CardHeader
              title={t('settings.whatsapp_integration')}
              subheader={t('settings.configure_whatsapp_api')}
            />
            <CardContent>
              {/* Seção para Habilitar/Desabilitar o WhatsApp */}
              <FormControlLabel
                control={
                  <Controller
                    name="whatsapp_enabled"
                    control={whatsappControl}
                    render={({ field }) => (
                      <Switch
                        {...field}
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    )}
                  />
                }
                label={t('settings.enable_whatsapp_integration', 'Habilitar Integração com WhatsApp')}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {t('settings.enable_whatsapp_integration_helper', 'Ative para permitir o envio de mensagens automáticas via WhatsApp.')}
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Controller
                    name="whatsapp_api_url"
                    control={whatsappControl}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label={t('settings.whatsapp_api_url')}
                        fullWidth
                        placeholder="https://your-evolution-api.com"
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    name="whatsapp_api_key"
                    control={whatsappControl}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label={t('settings.whatsapp_api_key')}
                        fullWidth
                        type="password"
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    name="whatsapp_instance_id"
                    control={whatsappControl}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label={t('settings.whatsapp_instance_id')}
                        fullWidth
                        placeholder="Ex: inst_123456"
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    name="whatsapp_phone_number"
                    control={whatsappControl}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label={t('settings.whatsapp_phone_number')}
                        fullWidth
                        placeholder="5511987654321"
                      />
                    )}
                  />
                </Grid>
              </Grid>
              <Box mt={3}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleWhatsappSubmit(onWhatsappSettingsSubmit)} // Usar o novo submit handler
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={20} /> : t('settings.save_whatsapp_settings')}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<SendIcon />}
                  onClick={() => setTestMessageDialog(true)}
                  disabled={loading}
                  sx={{ ml: 2 }}
                >
                  {t('settings.send_test_message')}
                </Button>
              </Box>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('settings.title')}
      </Typography>
      
      <Grid container spacing={3}>
        {/* Sidebar */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <List component="nav">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <ListItem
                    key={tab.id}
                    button
                    selected={activeTab === tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    sx={{
                      borderRadius: 1,
                      mb: 0.5,
                      '&.Mui-selected': {
                        backgroundColor: 'primary.main',
                        color: 'primary.contrastText',
                        '&:hover': {
                          backgroundColor: 'primary.dark',
                        },
                      },
                    }}
                  >
                    <Icon sx={{ mr: 2 }} />
                    <ListItemText primary={tab.label} />
                  </ListItem>
                );
              })}
            </List>
          </Paper>
        </Grid>
        
        {/* Content */}
        <Grid item xs={12} md={9}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
              <CircularProgress />
            </Box>
          ) : (
            renderTabContent()
          )}
        </Grid>
      </Grid>

      {/* Test Message Dialog */}
      <Dialog
        open={testMessageDialog}
        onClose={() => setTestMessageDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t('settings.send_test_message')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t('settings.recipient_phone_number')}
            fullWidth
            value={testRecipient}
            onChange={(e) => setTestRecipient(e.target.value)}
            placeholder="Ex: 5511987654321"
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label={t('settings.test_message_content')}
            fullWidth
            multiline
            rows={4}
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            placeholder={t('settings.test_message_placeholder')}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTestMessageDialog(false)}>{t('settings.cancel_button')}</Button>
          <Button
            onClick={sendTestMessage}
            variant="contained"
            disabled={loading || !testRecipient.trim() || !testMessage.trim()}
          >
            {loading ? <CircularProgress size={20} /> : t('settings.send_button')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog
        open={changePasswordDialog}
        onClose={() => setChangePasswordDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t('settings.change_password')}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Controller
                name="current_password"
                control={passwordControl}
                rules={{ required: t('settings.current_password_required') }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t('settings.current_password_label')}
                    type="password"
                    fullWidth
                    error={!!passwordErrors.current_password}
                    helperText={passwordErrors.current_password?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="new_password"
                control={passwordControl}
                rules={{
                  required: t('settings.new_password_required'),
                  minLength: {
                    value: 6,
                    message: t('settings.new_password_min_length'),
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t('settings.new_password_label')}
                    type="password"
                    fullWidth
                    error={!!passwordErrors.new_password}
                    helperText={passwordErrors.new_password?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="confirm_password"
                control={passwordControl}
                rules={{
                  required: t('settings.confirm_password_required'),
                  validate: (value) =>
                    value === newPassword || t('settings.passwords_do_not_match'),
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t('settings.confirm_password_label')}
                    type="password"
                    fullWidth
                    error={!!passwordErrors.confirm_password}
                    helperText={passwordErrors.confirm_password?.message}
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setChangePasswordDialog(false)}>{t('settings.cancel_button')}</Button>
          <Button
            onClick={handlePasswordSubmit(onPasswordSubmit)}
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : t('settings.update_password')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Settings;